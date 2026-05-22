'use client'

import type { GymClass } from './booking-widget'

interface ClassListProps {
  date: Date
  classes: GymClass[]
  onClassSelect: (classId: string) => void
}

export function ClassList({ date, classes, onClassSelect }: ClassListProps) {
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvailabilityColor = (capacity: number, enrolled: number) => {
    const percentage = (enrolled / capacity) * 100
    if (percentage >= 90) return 'text-destructive bg-destructive/10'
    if (percentage >= 70) return 'text-warning-foreground bg-warning/20'
    return 'text-success-foreground bg-success/10'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'yoga':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/>
            <path d="M12 22V8"/>
            <path d="M5 12h14"/>
            <path d="M5 12a7 7 0 0 0 14 0"/>
          </svg>
        )
      case 'cardio':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
          </svg>
        )
      case 'strength':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5H17.5V17.5H6.5z"/>
            <path d="M2 12h4"/>
            <path d="M18 12h4"/>
            <path d="M12 2v4"/>
            <path d="M12 18v4"/>
          </svg>
        )
      case 'pilates':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
        )
      case 'boxing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Available Classes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(date)} - {classes.length} classes available
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((gymClass) => (
          <button
            key={gymClass.id}
            onClick={() => onClassSelect(gymClass.id)}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-primary/50 hover:shadow-lg"
          >
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={gymClass.image}
                alt={gymClass.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-foreground capitalize">
                  {gymClass.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAvailabilityColor(gymClass.capacity, gymClass.enrolled)}`}>
                  {gymClass.capacity - gymClass.enrolled} spots left
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary">
                    {gymClass.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    with {gymClass.instructor}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {getCategoryIcon(gymClass.category)}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {gymClass.time}
                </div>
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 22h14"/>
                    <path d="M5 2h14"/>
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                  </svg>
                  {gymClass.duration}
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {gymClass.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="mt-4 text-muted-foreground">No classes available for this date</p>
        </div>
      )}
    </div>
  )
}
