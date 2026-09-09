'use client'

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import Image from 'next/image'
import { Calendar, Clock, Info, MapPin } from 'lucide-react'
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

function formatClockTime(value: string) {
  const parts = value.split(':').map(Number)
  if (parts.length < 2 || parts.some(Number.isNaN)) return value
  const [hours, minutes] = parts
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
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

  const handleBookNow = (
    event: MouseEvent<HTMLAnchorElement>,
    gymClass: GymClass,
  ) => {
    if (!hasClassAlreadyStarted(gymClass, date)) return
    event.preventDefault()
    toast(CLASS_STARTED_MESSAGE, {
      icon: <Info className="h-5 w-5 text-primary" />,
    })
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
        className="no-scrollbar space-y-4 overflow-y-auto overscroll-contain"
        style={{ height: 'var(--class-list-height)' }}
      >
        {classes.map((gymClass) => {
          const isDisabled =
            gymClass.fullyBooked || gymClass.enrolled >= gymClass.capacity
          const trainerImage = gymClass.trainerImage ?? gymClass.image
          const isExpanded = expandedIds.has(gymClass.id)
          const showMore = gymClass.description.length > 120 && !isExpanded
          const displayLocation = gymClass.locationName ?? locationName
          const genderLabel = formatGenderLabel(gymClass.gender)
          const bookingUrl =
            orgId && locationId
              ? `${BOOKING_BASE_URL}/${orgId}/${locationId}/class-details/${gymClass.id}`
              : null

          return (
            <article
              key={gymClass.id}
              className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
                isDisabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-36 md:w-40">
                  <Image
                    src={trainerImage}
                    alt={gymClass.instructor}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 208px"
                    unoptimized
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Class
                  </span>
                  <h4 className="mt-1 text-xl font-bold text-foreground">
                    {gymClass.name}
                  </h4>

                  {genderLabel && (
                    <span className="mt-2 inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      {genderLabel}
                    </span>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {gymClass.instructor}
                    </span>
                  </div>

                  {gymClass.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {isExpanded || !showMore
                        ? gymClass.description
                        : `${gymClass.description.slice(0, 120)}...`}
                      {showMore && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(gymClass.id)}
                          className="ml-1 font-medium text-primary hover:underline"
                        >
                          Show more
                        </button>
                      )}
                      {isExpanded && gymClass.description.length > 120 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(gymClass.id)}
                          className="ml-1 font-medium text-primary hover:underline"
                        >
                          Show less
                        </button>
                      )}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>{formatFullDate(date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>
                        {gymClass.time}
                        {gymClass.endTime && ` - ${formatClockTime(gymClass.endTime)}`}
                        {gymClass.duration !== '-' && ` • ${gymClass.duration}`}
                      </span>
                    </div>
                    {displayLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                        <span>{displayLocation}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3.5 py-2.5">
                    <span className="text-sm text-muted-foreground">
                      {isDisabled ? 'Fully booked' : 'Available to book'}
                    </span>
                    <div className="flex items-center gap-3">
                      {gymClass.price && gymClass.bookingType === 'price' ? (
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(gymClass.price)}
                        </span>
                      ) : null}
                      {!isDisabled && bookingUrl ? (
                        <a
                          href={bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => handleBookNow(event, gymClass)}
                          onAuxClick={(event) => handleBookNow(event, gymClass)}
                          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Book now
                        </a>
                      ) : null}
                    </div>
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
