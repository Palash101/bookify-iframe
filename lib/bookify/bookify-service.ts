import { API_ENDPOINTS } from './api-endpoints'
import { getBookifyHeaders } from './api-client'
import { CLIENT_API_PROXY } from './config'
import type { ApiResponse } from './types'

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return {} as T

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      'API returned invalid JSON. Ensure the dev server is running and ngrok points to port 3000.',
    )
  }
}

export class BookifyService {
  private baseUrl = CLIENT_API_PROXY

  private normalizePath(path: string): string {
    return path.startsWith('/') ? path.slice(1) : path
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/${this.normalizePath(path)}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          ...getBookifyHeaders(),
          ...(init?.headers as Record<string, string> | undefined),
        },
      })

      const body = await parseJsonResponse<ApiResponse<T>>(res)

      if (!res.ok || body.success === false) {
        throw new Error(
          body.message ||
            (body as { error?: string }).error ||
            (body as { detail?: string }).detail ||
            `Request failed (${res.status})`,
        )
      }

      return body
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' })
  }

  async getGym(): Promise<ApiResponse<unknown>> {
    return this.get(API_ENDPOINTS.GYM)
  }

  async getLocations(): Promise<ApiResponse<unknown[]>> {
    return this.get(API_ENDPOINTS.LOCATIONS)
  }
}

export const bookifyService = new BookifyService()
