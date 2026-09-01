import type { ClassDetailsType, GymClass, Seat } from '@/components/booking/booking-widget'
import type { ApiResponse, Location, TrainingProgram } from './types'

function pickId(item: Record<string, unknown>): string {
  const id = item.id ?? item._id ?? item.location_id ?? item.program_id
  return id != null ? String(id) : ''
}

function pickClassId(item: Record<string, unknown>): string {
  const id = item.id ?? item._id ?? item.class_id
  return id != null ? String(id) : ''
}

function pickName(item: Record<string, unknown>): string {
  const name =
    item.title ??
    item.name ??
    item.location_name ??
    item.program_name ??
    item.training_programme_name ??
    item.label
  return name != null ? String(name) : 'Unnamed'
}

export function mapLocation(item: Record<string, unknown>): Location | null {
  const id = pickId(item)
  if (!id) return null
  return { id, name: pickName(item), raw: item }
}

export function mapTrainingProgram(item: Record<string, unknown>): TrainingProgram | null {
  const id = pickTrainingProgramId(item) ?? pickId(item)
  if (!id) return null
  return { id, name: pickName(item), raw: item }
}

export function pickTrainingProgramId(item: Record<string, unknown>): string | undefined {
  const program =
    item.program && typeof item.program === 'object'
      ? (item.program as Record<string, unknown>)
      : undefined

  const id =
    item.training_programme_id ??
    item.training_program_id ??
    item.trainingProgramId ??
    item.program_id ??
    item.programId ??
    program?.id ??
    program?.program_id

  return id != null ? String(id) : undefined
}

/** Normalize API date values to YYYY-MM-DD for reliable comparisons. */
export function normalizeDateKey(value: string | undefined | null): string | null {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseClockTime(value: string): string {
  const parts = value.split(':').map(Number)
  if (parts.length < 2 || parts.some(Number.isNaN)) return value
  const [hours, minutes] = parts
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

function formatDurationFromTimes(start: string, end: string): string {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  let startM = toMinutes(start)
  let endM = toMinutes(end)
  if (endM < startM) endM += 24 * 60
  const diff = Math.max(endM - startM, 0)
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins} min`
}

function pickCategory(item: Record<string, unknown>): string {
  const category =
    item.theme_name ??
    item.category ??
    item.class_type ??
    item.type
  return category != null ? String(category).toLowerCase() : 'fitness'
}

function pickImage(item: Record<string, unknown>): string {
  const image = item.image ?? item.image_url ?? item.thumbnail ?? item.cover_image
  if (typeof image === 'string' && image) return image
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
}

function buildDescription(item: Record<string, unknown>): string {
  const parts: string[] = []
  if (item.theme_name) parts.push(String(item.theme_name))
  if (item.gender) parts.push(String(item.gender))
  if (item.booking_type === 'price' && item.price) {
    parts.push(`$${item.price}`)
  }
  if (item.status) parts.push(String(item.status))
  return parts.join(' · ') || 'Gym class session'
}

export function getClassStartDate(item: Record<string, unknown>): Date | null {
  const classDate = item.class_date ?? item.classDate
  if (classDate) {
    const [year, month, day] = String(classDate).split('-').map(Number)
    if (year && month && day) {
      return new Date(year, month - 1, day)
    }
  }

  const raw =
    item.start_date ??
    item.startDate ??
    item.date ??
    item.starts_at ??
    item.scheduled_at

  if (raw == null) return null
  const date = new Date(String(raw))
  return Number.isNaN(date.getTime()) ? null : date
}

export function mapBookifyClass(item: Record<string, unknown>): GymClass | null {
  const id = pickClassId(item)
  if (!id) return null

  const startTime = String(item.start_time ?? item.startTime ?? '')
  const endTime = String(item.end_time ?? item.endTime ?? '')
  const classDate = item.class_date ? String(item.class_date) : undefined
  const normalizedClassDate = normalizeDateKey(classDate)

  const capacity = Number(item.max_bookings ?? item.capacity ?? item.max_capacity ?? 0)
  const enrolled = Number(
    item.booking_counts ?? item.enrolled ?? item.enrolled_count ?? 0,
  )

  return {
    id,
    name: pickName(item),
    instructor: String(item.trainer_name ?? item.instructor ?? item.trainer ?? 'Staff'),
    time: startTime ? parseClockTime(startTime) : 'TBD',
    duration:
      startTime && endTime
        ? formatDurationFromTimes(startTime, endTime)
        : '—',
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 1,
    enrolled: Number.isFinite(enrolled) ? enrolled : 0,
    category: pickCategory(item),
    description: buildDescription(item),
    image: pickImage(item),
    trainingProgramId: pickTrainingProgramId(item),
    startDate:
      normalizedClassDate ??
      normalizeDateKey(getClassStartDate(item)?.toISOString()) ??
      undefined,
    classDate: normalizedClassDate ?? classDate,
    endTime: endTime || undefined,
    price: item.price != null ? String(item.price) : undefined,
    gender: item.gender != null ? String(item.gender) : undefined,
    themeName: item.theme_name != null ? String(item.theme_name) : undefined,
    bookingType: item.booking_type != null ? String(item.booking_type) : undefined,
    fullyBooked: Boolean(item.fully_booked),
    status: item.status != null ? String(item.status) : undefined,
    layoutId: item.layout_id != null ? String(item.layout_id) : undefined,
    raw: item,
  }
}

function mapApiSeatStatus(status: unknown): Seat['status'] {
  if (status === 'available') return 'available'
  if (status === 'booked' || status === 'occupied' || status === 'unavailable') {
    return 'booked'
  }
  return 'booked'
}

function mapLayoutSeats(item: Record<string, unknown>, capacity: number, classId: string): Seat[] {
  const layouts = item.layouts as { seats?: Array<Record<string, unknown>> } | undefined
  const apiSeats = layouts?.seats ?? []

  if (apiSeats.length === 0) {
    return generateSeats(capacity, classId)
  }

  return apiSeats.map((seat, index) => ({
    id: String(seat.id ?? `seat-${index}`),
    label: String(seat.text ?? seat.id ?? `${index + 1}`),
    row: index,
    column: 0,
    status: mapApiSeatStatus(seat.status),
    x: typeof seat.x === 'number' ? seat.x : undefined,
    y: typeof seat.y === 'number' ? seat.y : undefined,
    shape: seat.style != null ? String(seat.style) : undefined,
  }))
}

function generateSeats(capacity: number, classId: string): Seat[] {
  const rows = Math.ceil(Math.max(capacity, 1) / 5)
  const seats: Seat[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 5; col++) {
      const seatNumber = row * 5 + col + 1
      if (seatNumber <= capacity) {
        seats.push({
          id: `seat-${seatNumber}`,
          row: row + 1,
          column: col + 1,
          label: `${String.fromCharCode(65 + row)}${col + 1}`,
          status: 'available',
        })
      }
    }
  }

  return seats.length > 0 ? seats : [{ id: 'seat-1', row: 1, column: 1, label: 'A1', status: 'available' }]
}

export function toClassDetails(gymClass: GymClass): ClassDetailsType {
  const raw = gymClass.raw ?? {}
  const benefits: string[] = []
  if (gymClass.themeName) benefits.push(gymClass.themeName)
  if (gymClass.gender) benefits.push(`${gymClass.gender} session`)
  if (gymClass.price) benefits.push(`Price: $${gymClass.price}`)

  return {
    ...gymClass,
    seats: mapLayoutSeats(raw, gymClass.capacity, gymClass.id),
    equipment: gymClass.themeName ? [gymClass.themeName] : [],
    level: gymClass.gender ? String(gymClass.gender) : 'All Levels',
    benefits: benefits.length > 0 ? benefits : ['Book your spot'],
  }
}

export function unwrapList(response: ApiResponse<unknown>): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[]

  if (Array.isArray(response.data)) {
    return response.data as Record<string, unknown>[]
  }

  const data = response.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    for (const key of ['items', 'classes', 'results', 'records']) {
      const value = record[key]
      if (Array.isArray(value)) return value as Record<string, unknown>[]
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) return value as Record<string, unknown>[]
    }
  }

  for (const value of Object.values(response)) {
    if (Array.isArray(value)) return value as Record<string, unknown>[]
  }

  return []
}
