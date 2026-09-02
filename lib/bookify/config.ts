const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.BOOKIFY_API_URL ??
  'https://api.fitnezstudios.com'

export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1/client`

/** Browser widget calls go through this proxy so the upstream API receives the embedder's Origin. */
export const CLIENT_API_PROXY = '/api/bookify'

export const TENANT_KEY =
  process.env.NEXT_PUBLIC_TENANT_KEY ?? process.env.TENANT_KEY ?? ''

export const FITNEZ_SITE_URL =
  process.env.NEXT_PUBLIC_FITNEZ_SITE_URL ?? 'https://www.fitnezstudios.com'

export function buildClassDetailsUrl(gymId: string, classId: string): string {
  const base = FITNEZ_SITE_URL.replace(/\/$/, '')
  return `${base}/${gymId}/class-details/${classId}`
}
