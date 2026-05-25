'use client'

import type { GymClass } from './booking-widget'

interface ClassListProps {
  date: Date
  classes: GymClass[]
  onClassSelect: (gymClass: GymClass) => void
}

export function ClassList({ date, classes, onClassSelect }: ClassListProps) {
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAvailabilityColor = (gymClass: GymClass) => {
    if (gymClass.fullyBooked) return 'text-destructive bg-destructive/10'
    const spotsLeft = gymClass.capacity - gymClass.enrolled
    if (spotsLeft <= 0) return 'text-destructive bg-destructive/10'
    const percentage = (gymClass.enrolled / gymClass.capacity) * 100
    if (percentage >= 90) return 'text-destructive bg-destructive/10'
    if (percentage >= 70) return 'text-warning-foreground bg-warning/20'
    return 'text-success-foreground bg-success/10'
  }

  const spotsLabel = (gymClass: GymClass) => {
    if (gymClass.fullyBooked) return 'Fully booked'
    const left = gymClass.capacity - gymClass.enrolled
    if (left <= 0) return 'No spots left'
    return `${left} spots left`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Available Classes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(date)} — {classes.length} class{classes.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((gymClass) => {
          const isDisabled = gymClass.fullyBooked || gymClass.enrolled >= gymClass.capacity

          return (
            <button
              key={gymClass.id}
              onClick={() => !isDisabled && onClassSelect(gymClass)}
              disabled={isDisabled}
              className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all ${
                isDisabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:border-primary/50 hover:shadow-lg'
              }`}
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {gymClass.themeName && (
                      <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-foreground">
                        {gymClass.themeName}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getAvailabilityColor(gymClass)}`}
                    >
                      {spotsLabel(gymClass)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary">
                      {gymClass.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      with {gymClass.instructor}
                    </p>
                  </div>
                  {gymClass.price && gymClass.bookingType === 'price' && (
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                      ${gymClass.price}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {gymClass.time}
                    {gymClass.duration !== '—' && ` · ${gymClass.duration}`}
                  </span>
                  {gymClass.gender && (
                    <span className="capitalize">{gymClass.gender}</span>
                  )}
                </div>

                {gymClass.classDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {gymClass.classDate}
                  </p>
                )}

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {gymClass.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {classes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
          <p className="text-muted-foreground">No classes available for this date</p>
        </div>
      )}
    </div>
  )
}
