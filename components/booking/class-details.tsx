'use client'

import type { ClassDetailsType, Seat } from './booking-widget'

interface ClassDetailsProps {
  classDetails: ClassDetailsType
  selectedSeat: Seat | null
  onSeatSelect: (seat: Seat) => void
}

function hasLayoutPositions(seats: Seat[]) {
  return seats.some((s) => s.x != null && s.y != null)
}

export function ClassDetails({ classDetails, selectedSeat, onSeatSelect }: ClassDetailsProps) {
  const availableSeats = classDetails.seats.filter((s) => s.status === 'available').length
  const bookedSeats = classDetails.seats.filter((s) => s.status === 'booked').length
  const useLayout = hasLayoutPositions(classDetails.seats)

  const layoutBounds = useLayout
    ? classDetails.seats.reduce(
        (acc, seat) => ({
          maxX: Math.max(acc.maxX, (seat.x ?? 0) + 56),
          maxY: Math.max(acc.maxY, (seat.y ?? 0) + 56),
        }),
        { maxX: 320, maxY: 360 },
      )
    : null

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative bg-gradient-to-br from-primary/25 to-primary/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{classDetails.name}</h2>
              <p className="mt-1 text-muted-foreground">with {classDetails.instructor}</p>
            </div>
            {classDetails.price && classDetails.bookingType === 'price' && (
              <span className="rounded-lg bg-primary px-3 py-1.5 text-lg font-bold text-primary-foreground">
                ${classDetails.price}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{classDetails.time}</span>
            {classDetails.duration !== '—' && <span>{classDetails.duration}</span>}
            {classDetails.classDate && <span>{classDetails.classDate}</span>}
            {classDetails.gender && (
              <span className="capitalize">{classDetails.gender}</span>
            )}
            {classDetails.themeName && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                {classDetails.themeName}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{classDetails.description}</p>

          {classDetails.fullyBooked && (
            <p className="mt-3 text-sm font-medium text-destructive">This class is fully booked.</p>
          )}
        </div>
      </div>

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
              <div className="h-4 w-4 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-muted" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-primary" />
              <span className="text-muted-foreground">Selected</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="rounded-lg bg-muted/50 px-8 py-2 text-xs font-medium text-muted-foreground">
            INSTRUCTOR
          </div>
        </div>

        <div className="flex justify-center overflow-x-auto pb-2">
          {useLayout && layoutBounds ? (
            <div
              className="relative origin-top scale-[0.55] sm:scale-[0.65] md:scale-75"
              style={{ width: layoutBounds.maxX, height: layoutBounds.maxY }}
            >
              {classDetails.seats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id
                const isBooked = seat.status === 'booked'
                const isCircle = seat.shape === 'circle'

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => !isBooked && onSeatSelect(seat)}
                    disabled={isBooked}
                    style={{ left: seat.x, top: seat.y }}
                    className={`absolute flex items-center justify-center text-xs font-semibold transition-all ${
                      isCircle ? 'h-12 w-12 rounded-full' : 'h-12 w-12 rounded-md'
                    } ${
                      isSelected
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
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
          ) : (
            <div
              className="inline-grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(5, classDetails.seats.length) || 1}, 1fr)`,
              }}
            >
              {classDetails.seats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id
                const isBooked = seat.status === 'booked'

                return (
                  <button
                    key={seat.id}
                    type="button"
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
          )}
        </div>

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
