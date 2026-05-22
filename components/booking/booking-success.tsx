'use client'

import type { Booking, ClassDetailsType, Seat } from './booking-widget'

interface BookingSuccessProps {
  booking: Booking
  classDetails: ClassDetailsType
  seat: Seat
  onNewBooking: () => void
}

export function BookingSuccess({ booking, classDetails, seat, onNewBooking }: BookingSuccessProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Success Animation */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success-foreground"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
        <p className="mt-2 text-muted-foreground">
          Your spot has been reserved successfully
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card overflow-hidden">
        {/* Class Image */}
        <div className="relative h-32">
          <img
            src={classDetails.image}
            alt={classDetails.name}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <h3 className="text-lg font-bold text-white">{classDetails.name}</h3>
            <p className="text-sm text-white/80">with {classDetails.instructor}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Booking ID */}
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <span className="text-xs font-medium text-muted-foreground">BOOKING ID</span>
            <p className="mt-1 font-mono text-sm font-bold text-card-foreground">
              {booking.id.toUpperCase()}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Time</span>
              <p className="mt-0.5 font-medium text-card-foreground">{classDetails.time}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration</span>
              <p className="mt-0.5 font-medium text-card-foreground">{classDetails.duration}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Seat</span>
              <p className="mt-0.5 font-medium text-card-foreground">{seat.label}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Level</span>
              <p className="mt-0.5 font-medium text-card-foreground">{classDetails.level}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">ATTENDEE</span>
            <p className="mt-1 font-medium text-card-foreground">{booking.user.name}</p>
            <p className="text-sm text-muted-foreground">{booking.user.email}</p>
            <p className="text-sm text-muted-foreground">{booking.user.phone}</p>
          </div>

          <div className="border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">BOOKED AT</span>
            <p className="mt-1 text-sm text-card-foreground">{formatDate(booking.bookedAt)}</p>
          </div>

          {/* Equipment Reminder */}
          <div className="rounded-lg bg-warning/10 p-3">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-warning-foreground">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-warning-foreground">Equipment needed:</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {classDetails.equipment.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={onNewBooking}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Book Another Class
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        A confirmation email has been sent to {booking.user.email}
      </p>
    </div>
  )
}
