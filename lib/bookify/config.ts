const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.BOOKIFY_API_URL ??
  'https://api.fitnezstudios.com'

export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1/client`

export const TENANT_KEY =
  process.env.NEXT_PUBLIC_TENANT_KEY ?? process.env.TENANT_KEY ?? ''
