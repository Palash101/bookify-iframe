import { API_ENDPOINTS } from './api-endpoints'
import { getBookifyHeaders } from './api-client'
import { API_BASE_URL } from './config'
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
  private baseUrl = API_BASE_URL

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

  private post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getLocations(): Promise<ApiResponse<unknown[]>> {
    return this.get('/locations')
  }

  async getTrainingPrograms(
    locationId?: string,
  ): Promise<ApiResponse<unknown[]>> {
    if (locationId) {
      return this.get(`/locations/${locationId}/training-programs`)
    }
    return this.get(API_ENDPOINTS.TRAINING_PROGRAM.LIST)
  }

  async getClasses(
    params: { days: number; sort_order: string; class_date?: string },
    locationId?: string,
  ): Promise<ApiResponse<unknown[]>> {
    const query = new URLSearchParams({
      days: String(params.days),
      sort_order: params.sort_order,
    })
    if (params.class_date) {
      query.set('class_date', params.class_date)
    }
    const queryString = query.toString()
    if (locationId) {
      return this.get(`/locations/${locationId}/classes?${queryString}`)
    }
    return this.get(`/classes?${queryString}`)
  }

  async createBooking(payload: {
    classId: string
    seatId: string
    user: { name: string; email: string; phone: string }
  }): Promise<ApiResponse<unknown>> {
    return this.post(API_ENDPOINTS.BOOKING.CREATE, payload)
  }
}

export const bookifyService = new BookifyService()
