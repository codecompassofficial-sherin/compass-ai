const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

interface ApiErrorEnvelope {
  error?: { message?: string; code?: string }
}

export class ApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly body: unknown
  readonly code: string | undefined

  constructor(status: number, statusText: string, body: unknown) {
    const envelope = isRecord(body) ? (body as ApiErrorEnvelope) : undefined
    super(
      (envelope?.error?.message ?? statusText) ||
        `Request failed with status ${status}`
    )
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.body = body
    this.code = envelope?.error?.code
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(options.headers)
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      credentials: options.credentials ?? 'include',
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Network error', null)
  }

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = await response.text().catch(() => null)
    }
    throw new ApiError(response.status, response.statusText, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json()
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}
