'use client'

export function SkipToContent() {
  return (
    <a
      href="#main"
      onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Skip to content
    </a>
  )
}
