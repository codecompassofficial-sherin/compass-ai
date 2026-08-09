import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PORT = 9231
const PROFILE = `${process.env.TEMP}/opencode/chrome-e2e-profile`
const OUT = `${process.env.TEMP}/opencode/e2e-auth-evidence.json`

const steps = []
const failures = []
const net = []
let t0 = Date.now()

function record(name, ok, detail = '') {
  steps.push({ name, ok, detail, t: Date.now() - t0 })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures.push(name)
}

function assert(cond, name, detail = '') {
  if (!cond) throw new Error(`assertion failed: ${name} ${detail}`)
}

let ws
let msgId = 0
const pending = new Map()

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (r.exceptionDetails) {
    throw new Error(
      `eval error: ${
        r.exceptionDetails.exception?.description || r.exceptionDetails.text
      }`
    )
  }
  return r.result?.value
}

async function waitFor(predicate, timeout = 20000, interval = 300) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await evaluate(predicate)) return true
    await sleep(interval)
  }
  return false
}

async function waitForPath(path, timeout = 30000) {
  return waitFor(`location.pathname === ${JSON.stringify(path)}`, timeout)
}

async function waitForText(text, timeout = 30000) {
  return waitFor(`document.body && document.body.innerText.includes(${JSON.stringify(text)})`, timeout)
}

async function typeValue(selector, value) {
  return evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return 'NO_SELECTOR';
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return 'OK';
  })()`)
}

async function clickSubmit() {
  return evaluate(
    `(() => { const b = document.querySelector('button[type="submit"]'); if (b) { b.click(); return 'OK' } return 'NO_BUTTON' })()`
  )
}

async function dashboardReady() {
  const path = await waitForPath('/dashboard', 30000)
  if (!path) return false
  const text = await waitForText('Career Progress', 30000)
  if (!text) return false
  await sleep(1200)
  const skeletons = await evaluate(`document.querySelectorAll('.animate-pulse').length`)
  return skeletons === 0
}

async function connect() {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      '--no-first-run',
      '--disable-gpu',
      '--window-size=1440,1000',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true }
  )

  let target
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page')
      if (page) {
        target = page
        break
      }
    } catch {}
    await sleep(500)
  }
  if (!target) throw new Error('could not attach to headless chrome')

  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) p.reject(new Error(msg.error.message))
        else p.resolve(msg.result)
        return
      }
      const t = Date.now() - t0
      if (msg.method === 'Network.requestWillBeSent') {
        const r = msg.params.request
        if (r.url.includes('localhost:4000')) {
          net.push({
            t,
            kind: 'req',
            method: r.method,
            url: r.url,
            auth: r.headers['authorization'] ? 'PRESENT' : 'MISSING',
          })
        }
      } else if (msg.method === 'Network.responseReceived') {
        const r = msg.params.response
        if (r.url.includes('localhost:4000')) {
          net.push({ t, kind: 'res', status: r.status, url: r.url })
        }
      }
    } catch {}
  }

  await send('Runtime.enable')
  await send('Network.enable')
  await send('Page.enable')
  return chrome
}

async function main() {
  const chrome = await connect()

  try {
    // Warm up dev server compilation.
    await send('Page.navigate', { url: `${BASE}/login` })
    await waitFor(`!!document.querySelector('input[name="email"]')`, 45000)
    await sleep(500)

    // ---------------- A. Register -> Dashboard ----------------
    const email = `e2e-${Date.now()}@example.com`
    await send('Page.navigate', { url: `${BASE}/register` })
    const regForm = await waitFor(`!!document.querySelector('input[name="firstName"]')`, 45000)
    assert(regForm, 'A register form rendered')
    await typeValue('input[name="firstName"]', 'E2E')
    await typeValue('input[name="lastName"]', 'Runner')
    await typeValue('input[name="email"]', email)
    await typeValue('input[name="password"]', 'E2ePass!2345')
    await typeValue('input[name="confirmPassword"]', 'E2ePass!2345')
    await clickSubmit()
    const aReady = await dashboardReady()
    record('A. register -> dashboard renders', aReady)
    assert(aReady, 'A dashboard')

    // ---------------- D. Logout -> Login page ----------------
    let dOk = false
    try {
      await evaluate(
        `(() => { const b = document.querySelector('button[aria-label="Open user menu"]'); if (b) { b.click(); return 'OK' } return 'NO_BTN' })()`
      )
      const item = await waitFor(
        `[...document.querySelectorAll('[role="menuitem"]')].some(i => i.textContent.trim() === 'Sign out')`,
        10000
      )
      if (item) {
        await evaluate(
          `(() => { const i = [...document.querySelectorAll('[role="menuitem"]')].find(x => x.textContent.trim() === 'Sign out'); if (i) { i.click(); return 'OK' } return 'NO_ITEM' })()`
        )
      }
      dOk =
        (await waitForPath('/login', 20000)) &&
        (await waitFor(`!!document.querySelector('input[name="email"]')`, 15000))
    } catch {}
    record('D. logout -> login page', dOk)
    assert(dOk, 'D logout')

    // ---------------- B. Login -> Dashboard ----------------
    await typeValue('input[name="email"]', email)
    await typeValue('input[name="password"]', 'E2ePass!2345')
    await clickSubmit()
    const bReady = await dashboardReady()
    record('B. login -> dashboard renders', bReady)
    assert(bReady, 'B dashboard')

    // ---------------- C. Reload -> session restores -> dashboard ----------------
    await send('Page.navigate', { url: `${BASE}/dashboard` })
    const cReady = await dashboardReady()
    record('C. reload restores session -> dashboard renders', cReady)
    assert(cReady, 'C reload')

    // ---------------- E. Back -> Forward ----------------
    await evaluate(`history.back()`)
    await sleep(4000)
    await evaluate(`history.forward()`)
    const eReady = await dashboardReady()
    record('E. back -> forward -> dashboard renders', eReady)
    assert(eReady, 'E back/forward')

    // ---------------- F. Direct /dashboard while authenticated ----------------
    await send('Page.navigate', { url: `${BASE}/projects` })
    const fProj = (await waitForPath('/projects', 30000)) && (await waitForText('Projects', 20000))
    record('F. direct /projects while authenticated renders', fProj)
    await send('Page.navigate', { url: `${BASE}/dashboard` })
    const fDash = await dashboardReady()
    record('F. direct /dashboard while authenticated renders', fDash)
    assert(fDash, 'F dashboard')

    // ---------------- D2. Final logout -> login page ----------------
    let d2Ok = false
    try {
      await evaluate(
        `(() => { const b = document.querySelector('button[aria-label="Open user menu"]'); if (b) { b.click(); return 'OK' } return 'NO_BTN' })()`
      )
      await waitFor(
        `[...document.querySelectorAll('[role="menuitem"]')].some(i => i.textContent.trim() === 'Sign out')`,
        10000
      )
      await evaluate(
        `(() => { const i = [...document.querySelectorAll('[role="menuitem"]')].find(x => x.textContent.trim() === 'Sign out'); if (i) { i.click(); return 'OK' } return 'NO_ITEM' })()`
      )
      d2Ok =
        (await waitForPath('/login', 20000)) &&
        (await waitFor(`!!document.querySelector('input[name="email"]')`, 15000))
    } catch {}
    record('D2. logout -> login page (final)', d2Ok)
    assert(d2Ok, 'D2 final logout')
  } finally {
    // ---------------- Network / Authorization verification ----------------
    const dataReq = net.filter(
      (n) => n.kind === 'req' && n.method !== 'OPTIONS'
    )
    const meReq = dataReq.filter((n) => n.url.includes('/auth/me'))
    const refreshRes = net.filter(
      (n) => n.kind === 'res' && n.url.includes('/auth/refresh')
    )
    const dashReq = dataReq.filter((n) => n.url.includes('/api/v1/dashboard'))

    const meAllAuthed = meReq.length > 0 && meReq.every((n) => n.auth === 'PRESENT')
    record(
      'network: /auth/me always sent with Authorization',
      meAllAuthed,
      `${meReq.length} request(s)`
    )

    const refreshOk = refreshRes.some((n) => n.status === 200)
    record('network: /auth/refresh succeeded', refreshOk, `${refreshRes.length} response(s)`)

    const dashboardAuthed =
      dashReq.length > 0 && dashReq.every((n) => n.auth === 'PRESENT')
    record(
      'network: /dashboard sent with Authorization',
      dashboardAuthed,
      `${dashReq.length} request(s)`
    )

    const intelligenceAuthed = dataReq
      .filter((n) => n.url.includes('/intelligence'))
      .every((n) => n.auth === 'PRESENT')
    const projectsAuthed = dataReq
      .filter((n) => n.url.includes('/projects'))
      .every((n) => n.auth === 'PRESENT')
    record(
      'network: /intelligence + /projects sent with Authorization',
      dataReq.filter((n) => n.url.includes('/intelligence')).length > 0 &&
        intelligenceAuthed &&
        projectsAuthed
    )

    writeFileSync(
      OUT,
      JSON.stringify(
        { steps, net: net.slice(0, 300), email: null, failures },
        null,
        2
      )
    )

    try {
      if (ws) ws.close()
    } catch {}
    chrome.kill()
  }
}

main()
  .then(() => {
    const failed = failures.length > 0
    console.log(`\nE2E RESULT: ${failed ? 'FAIL' : 'PASS'} (${steps.length} checks)`)
    process.exit(failed ? 1 : 0)
  })
  .catch((err) => {
    console.error('E2E FATAL', err)
    try {
      if (ws) ws.close()
    } catch {}
    process.exit(1)
  })
