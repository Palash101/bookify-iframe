/**
 * Origins allowed to embed the booking widget.
 * Override with NEXT_PUBLIC_ALLOWED_EMBED_ORIGINS (comma-separated).
 */
export const ALLOWED_EMBED_ORIGINS = (
  process.env.NEXT_PUBLIC_ALLOWED_EMBED_ORIGINS ??
  [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://fitmecom.vercel.app',
  ].join(',')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false
  return ALLOWED_EMBED_ORIGINS.includes(origin)
}

/** Parent page origin when embedded in an iframe; own origin when opened top-level. */
export function getEmbedParentOrigin(): string | null {
  if (typeof window === 'undefined') return null

  // Opened directly (not in an iframe) — treat as same-origin visit
  if (window.self === window.top) {
    return window.location.origin
  }

  const ancestorOrigins = (
    window.location as Location & { ancestorOrigins?: DOMStringList }
  ).ancestorOrigins

  if (ancestorOrigins && ancestorOrigins.length > 0) {
    try {
      return new URL(ancestorOrigins[0]).origin
    } catch {
      return ancestorOrigins[0]
    }
  }

  if (document.referrer) {
    try {
      return new URL(document.referrer).origin
    } catch {
      return null
    }
  }

  return null
}
