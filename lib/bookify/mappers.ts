import type { GymClass } from '@/components/booking/booking-widget'
import type { ApiResponse, Location } from './types'

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

const DEFAULT_CLASS_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'

function pickImage(item: Record<string, unknown>): string {
  const image = item.image ?? item.image_url ?? item.thumbnail ?? item.cover_image
  if (typeof image === 'string' && image) return image
  return DEFAULT_CLASS_IMAGE
}

function pickTrainerImage(item: Record<string, unknown>): string {
  const trainer =
    item.trainer && typeof item.trainer === 'object'
      ? (item.trainer as Record<string, unknown>)
      : undefined

  const image =
    item.trainer_image ??
    item.trainerImage ??
    trainer?.image ??
    trainer?.image_url ??
    trainer?.profile_image

  if (typeof image === 'string' && image) return image
  return pickImage(item)
}

function pickLocationName(item: Record<string, unknown>): string | undefined {
  const location =
    item.location && typeof item.location === 'object'
      ? (item.location as Record<string, unknown>)
      : undefined

  const name =
    item.location_name ??
    item.locationName ??
    location?.name ??
    location?.title

  return name != null ? String(name) : undefined
}

function buildDescription(item: Record<string, unknown>): string {
  const explicit =
    item.description ??
    item.class_description ??
    item.classDescription ??
    item.about

  if (explicit != null && String(explicit).trim()) {
    return String(explicit).trim()
  }

  const parts: string[] = []
  if (item.theme_name) parts.push(String(item.theme_name))
  if (item.booking_type === 'price' && item.price) {
    parts.push(`$${item.price}`)
  }
  return parts.join(' | ') || 'Gym class session'
}

export function formatGenderLabel(gender?: string | null): string | null {
  if (!gender) return null
  const normalized = gender.trim().toLowerCase()
  if (normalized === 'female' || normalized === 'f') return 'Female Only'
  if (normalized === 'male' || normalized === 'm') return 'Male Only'
  return null
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
    startTime: startTime || undefined,
    duration:
      startTime && endTime
        ? formatDurationFromTimes(startTime, endTime)
        : '—',
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 1,
    enrolled: Number.isFinite(enrolled) ? enrolled : 0,
    category: pickCategory(item),
    description: buildDescription(item),
    image: pickImage(item),
    trainerImage: pickTrainerImage(item),
    locationName: pickLocationName(item),
    startDate: normalizedClassDate ?? undefined,
    classDate: normalizedClassDate ?? classDate,
    endTime: endTime || undefined,
    price: item.price != null ? String(item.price) : undefined,
    gender: item.gender != null ? String(item.gender) : undefined,
    themeName: item.theme_name != null ? String(item.theme_name) : undefined,
    bookingType: item.booking_type != null ? String(item.booking_type) : undefined,
    fullyBooked: Boolean(item.fully_booked),
    status: item.status != null ? String(item.status) : undefined,
    raw: item,
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
