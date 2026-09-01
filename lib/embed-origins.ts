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
    'https://jimmy.fitnezstudios.com',
  ].join(',')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isFitnezstudiosSubdomain(origin: string): boolean {
  try {
    const host = new URL(origin).hostname
    return host === 'fitnezstudios.com' || host.endsWith('.fitnezstudios.com')
  } catch {
    return false
  }
}

export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false
  if (ALLOWED_EMBED_ORIGINS.includes(origin)) return true
  return isFitnezstudiosSubdomain(origin)
}

let embedOriginForApi: string | null = null
let verifiedParentOrigin: string | null = null

/** Store parent origin for API requests (set once when the widget mounts). */
export function setEmbedOriginForApi(origin: string | null): void {
  embedOriginForApi = origin
}

/** Parent origin to attach to API calls when embedded; null when opened top-level. */
export function getStoredEmbedOriginForApi(): string | null {
  return embedOriginForApi
}

/**
 * Set parent origin verified via postMessage (event.origin — browser-controlled).
 * Takes precedence over referrer-based detection.
 */
export function setVerifiedParentOrigin(origin: string | null): void {
  verifiedParentOrigin = origin
}

export function isEmbedded(): boolean {
  if (typeof window === 'undefined') return false
  return window.self !== window.top
}

/** Parent page origin when in an iframe; null when opened directly. */
export function getEmbedOriginForApi(): string | null {
  if (!isEmbedded()) return null
  return getEmbedParentOrigin()
}

/**
 * Detect parent frame origin from browser APIs only.
 * Never reads URL params — those can be spoofed by anyone.
 */
function detectParentFrameOrigin(): string | null {
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

/** Parent page origin when embedded in an iframe; own origin when opened top-level. */
export function getEmbedParentOrigin(): string | null {
  if (typeof window === 'undefined') return null

  if (window.self === window.top) {
    return window.location.origin
  }

  // postMessage event.origin is browser-verified; preferred over referrer
  if (verifiedParentOrigin) {
    return verifiedParentOrigin
  }

  return detectParentFrameOrigin()
}
