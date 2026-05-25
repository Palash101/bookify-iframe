export interface ApiResponse<T> {
  data?: T
  message?: string
  success?: boolean
  error?: string
  [key: string]: unknown
}

export interface Location {
  id: string
  name: string
  raw: Record<string, unknown>
}

export interface TrainingProgram {
  id: string
  name: string
  raw: Record<string, unknown>
}

