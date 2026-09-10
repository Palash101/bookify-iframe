'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Clock, Info, MapPin, Timer, User, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatGenderLabel } from '@/lib/bookify/mappers'
import type { GymClass } from './booking-widget'

interface ClassListProps {
  date: Date
  classes: GymClass[]
  locationName?: string
  orgId?: string
  locationId?: string
  isLoading?: boolean
  isLoadingMore?: boolean
  children?: ReactNode
  onScrollRootChange?: (node: HTMLDivElement | null) => void
}

// const BOOKING_BASE_URL = 'http://localhost:3001'

const BOOKING_BASE_URL = 'https://www.fitnezstudios.com/'

function formatFullDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPrice(price: string) {
  const num = Number(price)
  if (!Number.isFinite(num)) return price
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

function getProgramSpotConfig(raw?: Record<string, unknown>) {
  const program = raw?.program
  if (!program || typeof program !== 'object' || Array.isArray(program)) {
    return null
  }

  const data = program as Record<string, unknown>
  const threshold = Number(data.spots_left_label)
  if (!Number.isFinite(threshold)) return null

  const spotName =
    typeof data.spot_name === 'string' && data.spot_name.trim()
      ? data.spot_name.trim()
      : 'Spot'

  return { threshold, spotName }
}

function buildDateTimeForClass(date: Date, value?: string) {
  if (!value) return null

  const match12 = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i)
  if (match12) {
    let hours = Number(match12[1])
    const minutes = Number(match12[2])
    const period = match12[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    const next = new Date(date)
    next.setHours(hours, minutes, 0, 0)
    return next
  }

  const parts = value.split(':').map(Number)
  if (parts.length < 2 || parts.some(Number.isNaN)) return null

  const next = new Date(date)
  next.setHours(parts[0], parts[1], 0, 0)
  return next
}

function getClassStartDateTime(gymClass: GymClass, selectedDate: Date) {
  const raw = gymClass.raw
  const candidates = [
    gymClass.startTime,
    typeof raw?.start_time === 'string' ? raw.start_time : undefined,
    typeof raw?.startTime === 'string' ? raw.startTime : undefined,
    gymClass.time,
  ]

  for (const value of candidates) {
    const start = buildDateTimeForClass(selectedDate, value)
    if (start) return start
  }

  return null
}

function hasClassAlreadyStarted(gymClass: GymClass, selectedDate: Date) {
  const start = getClassStartDateTime(gymClass, selectedDate)
  if (!start) return false
  return start.getTime() <= Date.now()
}

const CLASS_STARTED_MESSAGE =
  'This class has already started. Booking is no longer available.'

export function ClassList({
  date,
  classes,
  locationName,
  orgId,
  locationId,
  isLoading = false,
  isLoadingMore = false,
  children,
  onScrollRootChange,
}: ClassListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onScrollRootChange?.(listRef.current)
    return () => onScrollRootChange?.(null)
  }, [onScrollRootChange])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openBooking = (gymClass: GymClass, bookingUrl: string) => {
    if (hasClassAlreadyStarted(gymClass, date)) {
      toast(CLASS_STARTED_MESSAGE, {
        icon: <Info className="h-5 w-5 text-primary" />,
      })
      return
    }
    window.open(bookingUrl, '_blank', 'noreferrer')
  }

  const isToday = (() => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  })()

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {isToday ? 'Today' : formatFullDate(date)}
      </h3>

      <div
        ref={listRef}
        className="no-scrollbar space-y-2.5 overflow-y-auto overscroll-contain"
        style={{ height: 'var(--class-list-height)' }}
      >
        {classes.map((gymClass) => {
          const isDisabled =
            gymClass.fullyBooked || gymClass.enrolled >= gymClass.capacity
          const trainerImage = gymClass.trainerImage ?? gymClass.image
          const isExpanded = expandedIds.has(gymClass.id)
          const showMore = gymClass.description.length > 90 && !isExpanded
          const displayLocation = gymClass.locationName ?? locationName
          const genderLabel = formatGenderLabel(gymClass.gender)
          const spotsLeft = Math.max(gymClass.capacity - gymClass.enrolled, 0)
          const spotConfig = getProgramSpotConfig(gymClass.raw)
          const showSpotsLeft =
            !!spotConfig && spotsLeft <= spotConfig.threshold
          const bookingUrl =
            orgId && locationId
              ? `${BOOKING_BASE_URL}/${orgId}/${locationId}/class-details/${gymClass.id}`
              : null

          return (
            <article
              key={gymClass.id}
              role={bookingUrl ? 'link' : undefined}
              tabIndex={bookingUrl ? 0 : undefined}
              onClick={() => {
                if (bookingUrl) openBooking(gymClass, bookingUrl)
              }}
              onKeyDown={(event) => {
                if (!bookingUrl) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openBooking(gymClass, bookingUrl)
                }
              }}
              className={`group relative overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:border-primary/25 hover:shadow-md ${
                bookingUrl ? 'cursor-pointer' : ''
              } ${isDisabled ? 'opacity-60' : ''}`}
            >
              <div className="flex gap-3 p-2.5 sm:gap-3.5 sm:p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/60 sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Image
                    src={trainerImage}
                    alt={gymClass.instructor}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    sizes="72px"
                    unoptimized
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="truncate text-[15px] font-semibold leading-tight text-foreground sm:text-base">
                          {gymClass.name}
                        </h4>
                        {gymClass.themeName && (
                          <span className="truncate text-xs font-medium text-muted-foreground">
                            {gymClass.themeName}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0 text-primary/70" />
                        <span className="truncate">{gymClass.instructor}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0 text-primary/70" />
                        <span>{gymClass.time}</span>
                      </span>
                      {gymClass.duration !== '-' && (
                        <span className="inline-flex items-center gap-1">
                          <Timer className="h-3 w-3 shrink-0 text-primary/70" />
                          <span>{gymClass.duration}</span>
                        </span>
                      )}
                      {displayLocation && (
                        <span className="inline-flex max-w-[10rem] items-center gap-1 sm:max-w-[14rem]">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{displayLocation}</span>
                        </span>
                      )}
                    </div>

                    {gymClass.description && (
                      <p className="text-[11px] leading-snug text-muted-foreground/90 sm:text-xs">
                        {isExpanded || !showMore
                          ? gymClass.description
                          : `${gymClass.description.slice(0, 90)}...`}
                        {(showMore ||
                          (isExpanded && gymClass.description.length > 90)) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleExpanded(gymClass.id)
                            }}
                            className="ml-1 font-medium text-primary hover:underline"
                          >
                            {isExpanded ? 'Less' : 'More'}
                          </button>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                    {genderLabel && (
                      <span className="inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {genderLabel}
                      </span>
                    )}
                    {showSpotsLeft && spotConfig && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                        <span>
                          {isDisabled
                            ? 'Fully booked'
                            : `${spotsLeft} ${spotConfig.spotName} Left`}
                        </span>
                      </span>
                    )}
                    {gymClass.price && gymClass.bookingType === 'price' ? (
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(gymClass.price)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {classes.length === 0 && !isLoading && !isLoadingMore && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
            <p className="text-muted-foreground">No classes available for this date</p>
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
