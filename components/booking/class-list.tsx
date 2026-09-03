'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { formatGenderLabel } from '@/lib/bookify/mappers'
import { buildClassDetailsUrl } from '@/lib/bookify/config'
import type { GymClass } from './booking-widget'

interface ClassListProps {
  date: Date
  classes: GymClass[]
  locationName?: string
  gymId?: string
  locationId?: string
}

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

export function ClassList({
  date,
  classes,
  locationName,
  gymId,
  locationId,
}: ClassListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
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
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {isToday ? 'Today' : formatFullDate(date)}
      </h3>

      <div className="space-y-4">
        {classes.map((gymClass) => {
          const isDisabled =
            gymClass.fullyBooked || gymClass.enrolled >= gymClass.capacity
          const trainerImage = gymClass.trainerImage ?? gymClass.image
          const isExpanded = expandedIds.has(gymClass.id)
          const showMore =
            gymClass.description.length > 120 && !isExpanded
          const displayLocation = gymClass.locationName ?? locationName
          const genderLabel = formatGenderLabel(gymClass.gender)

          return (
            <article
              key={gymClass.id}
              className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
                isDisabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-44 md:w-52">
                  <Image
                    src={trainerImage}
                    alt={gymClass.instructor}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 208px"
                    unoptimized
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
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
                    {/* <div className="relative h-7 w-7 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={trainerImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="28px"
                        unoptimized
                      />
                    </div> */}
                    <span className="text-sm text-muted-foreground">
                      {gymClass.instructor}
                    </span>
                  </div>

                  {gymClass.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {isExpanded || !showMore
                        ? gymClass.description
                        : `${gymClass.description.slice(0, 120)}…`}
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

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>{formatFullDate(date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-primary/70" />
                      <span>
                        {gymClass.time}
                        {gymClass.endTime &&
                          ` - ${formatClockTime(gymClass.endTime)}`}
                        {gymClass.duration !== '—' && ` • ${gymClass.duration}`}
                      </span>
                    </div>
                    {displayLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                        <span>{displayLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 border-t border-border p-4 sm:w-44 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:p-5">
                  {gymClass.price && gymClass.bookingType === 'price' ? (
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(gymClass.price)}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">
                      {isDisabled ? 'Fully booked' : 'Free booking'}
                    </p>
                  )}
                  <a
                    href={
                      gymId && locationId
                        ? buildClassDetailsUrl(gymId, locationId, gymClass.id)
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!gymId || !locationId}
                    className={`rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 ${
                      !gymId || !locationId
                        ? 'pointer-events-none cursor-not-allowed opacity-50'
                        : ''
                    }`}
                  >
                    Book now
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {classes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <p className="text-muted-foreground">No classes available for this date</p>
        </div>
      )}
    </div>
  )
}
