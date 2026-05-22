'use client'

import type { ClassDetailsType, Seat } from './booking-widget'

interface ClassDetailsProps {
  classDetails: ClassDetailsType
  selectedSeat: Seat | null
  onSeatSelect: (seat: Seat) => void
}

export function ClassDetails({ classDetails, selectedSeat, onSeatSelect }: ClassDetailsProps) {
  const availableSeats = classDetails.seats.filter(s => s.status === 'available').length
  const bookedSeats = classDetails.seats.filter(s => s.status === 'booked').length

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative h-48">
          <img
            src={classDetails.image}
            alt={classDetails.name}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white">{classDetails.name}</h2>
            <p className="mt-1 text-white/80">with {classDetails.instructor}</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {classDetails.time}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 22h14"/>
                <path d="M5 2h14"/>
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
              </svg>
              {classDetails.duration}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {classDetails.level}
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{classDetails.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {classDetails.equipment.map((item, index) => (
              <span
                key={index}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {classDetails.benefits.map((benefit, index) => (
              <span
                key={index}
                className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">Select Your Spot</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {availableSeats} of {classDetails.seats.length} spots available
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-secondary" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-primary" />
              <span className="text-muted-foreground">Selected</span>
            </div>
          </div>
        </div>

        {/* Instructor Area */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-lg bg-muted/50 px-8 py-2 text-xs font-medium text-muted-foreground">
            INSTRUCTOR AREA
          </div>
        </div>

        {/* Seat Grid */}
        <div className="flex justify-center">
          <div className="inline-grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {classDetails.seats.map((seat) => {
              const isSelected = selectedSeat?.id === seat.id
              const isBooked = seat.status === 'booked'

              return (
                <button
                  key={seat.id}
                  onClick={() => !isBooked && onSeatSelect(seat)}
                  disabled={isBooked}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2'
                      : isBooked
                      ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-50'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary'
                  }`}
                  title={isBooked ? 'Already booked' : `Seat ${seat.label}`}
                >
                  {seat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-center gap-8 border-t border-border pt-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-foreground">{availableSeats}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{bookedSeats}</div>
            <div className="text-xs text-muted-foreground">Booked</div>
          </div>
        </div>
      </div>
    </div>
  )
}
