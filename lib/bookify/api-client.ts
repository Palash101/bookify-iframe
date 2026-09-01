import { getStoredEmbedOriginForApi } from '@/lib/embed-origins'
import { API_BASE_URL, TENANT_KEY } from './config'

export function getBookifyHeaders(
  extra?: HeadersInit,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  }

  if (TENANT_KEY) {
    headers['X-Tenant-Key'] = TENANT_KEY
  }

  const embedOrigin = getStoredEmbedOriginForApi()
  if (embedOrigin) {
    headers['X-Embed-Origin'] = embedOrigin
    // Backend may use this as the tenant/site origin (browser Origin cannot be overridden)
    headers['X-Origin'] = embedOrigin
  }

  if (extra) {
    const extraRecord =
      extra instanceof Headers
        ? Object.fromEntries(extra.entries())
        : Array.isArray(extra)
          ? Object.fromEntries(extra)
          : extra

    Object.assign(headers, extraRecord)
  }

  return headers
}

/** Builds a full URL: API_BASE_URL + path (e.g. API_BASE_URL + '/locations'). */
export function buildBookifyUrl(path: string, query?: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const [pathPart, pathQuery] = normalizedPath.slice(1).split('?')
  const base = API_BASE_URL.replace(/\/$/, '')
  const combinedQuery = [pathQuery, query].filter(Boolean).join('&')
  return `${base}/${pathPart}${combinedQuery ? `?${combinedQuery}` : ''}`
}

export async function bookifyFetch<T = unknown>(
  path: string,
  init?: RequestInit & { query?: Record<string, string> },
): Promise<{ data: T; status: number; ok: boolean }> {
  const queryString =
    init?.query && Object.keys(init.query).length > 0
      ? new URLSearchParams(
          Object.entries(init.query).map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''

  const url = buildBookifyUrl(path, queryString || undefined)
  const { query: _query, ...fetchInit } = init ?? {}

  const res = await fetch(url, {
    ...fetchInit,
    headers: {
      ...getBookifyHeaders(),
      ...(fetchInit.headers as Record<string, string> | undefined),
    },
  })

  const data = (await res.json().catch(() => ({}))) as T

  return { data, status: res.status, ok: res.ok }
}
