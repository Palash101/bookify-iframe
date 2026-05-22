'use client'

import { useState, useEffect } from 'react'
import { DateCalendar } from '@/components/booking/date-calendar'
import { ClassList } from '@/components/booking/class-list'
import { ClassDetails } from '@/components/booking/class-details'
import { BookingForm } from '@/components/booking/booking-form'
import { BookingSuccess } from '@/components/booking/booking-success'

export interface GymClass {
  id: string
  name: string
  instructor: string
  time: string
  duration: string
  capacity: number
  enrolled: number
  category: string
  description: string
  image: string
}

export interface Seat {
  id: string
  row: number
  column: number
  label: string
  status: 'available' | 'booked' | 'selected'
}

export interface ClassDetailsType extends GymClass {
  seats: Seat[]
  equipment: string[]
  level: string
  benefits: string[]
}

export interface UserDetails {
  name: string
  email: string
  phone: string
}

export interface Booking {
  id: string
  classId: string
  seatId: string
  user: UserDetails
  bookedAt: string
  status: string
}

type Step = 'calendar' | 'classes' | 'details' | 'booking' | 'success'

export function BookingWidget() {
  const [currentStep, setCurrentStep] = useState<Step>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [classes, setClasses] = useState<GymClass[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassDetailsType | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch classes when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchClasses(selectedDate)
    }
  }, [selectedDate])

  const fetchClasses = async (date: Date) => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const res = await fetch(`/api/classes?date=${dateStr}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClasses(data.classes)
      setCurrentStep('classes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchClassDetails = async (classId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/classes/${classId}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSelectedClass(data)
      setCurrentStep('details')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch class details')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'booked') return
    setSelectedSeat(seat)
    setCurrentStep('booking')
  }

  const handleBooking = async (user: UserDetails) => {
    if (!selectedClass || !selectedSeat) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass.id,
          seatId: selectedSeat.id,
          user
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBooking(data.booking)
      setCurrentStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'classes':
        setCurrentStep('calendar')
        setSelectedDate(null)
        break
      case 'details':
        setCurrentStep('classes')
        setSelectedClass(null)
        break
      case 'booking':
        setCurrentStep('details')
        setSelectedSeat(null)
        break
      case 'success':
        // Reset everything
        setCurrentStep('calendar')
        setSelectedDate(null)
        setClasses([])
        setSelectedClass(null)
        setSelectedSeat(null)
        setBooking(null)
        break
    }
  }

  const handleNewBooking = () => {
    setCurrentStep('calendar')
    setSelectedDate(null)
    setClasses([])
    setSelectedClass(null)
    setSelectedSeat(null)
    setBooking(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Bookify</h1>
            <p className="text-sm text-muted-foreground">Book your gym class</p>
          </div>
          {currentStep !== 'calendar' && currentStep !== 'success' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Step Content */}
        {!loading && (
          <>
            {currentStep === 'calendar' && (
              <DateCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            )}

            {currentStep === 'classes' && selectedDate && (
              <ClassList
                date={selectedDate}
                classes={classes}
                onClassSelect={fetchClassDetails}
              />
            )}

            {currentStep === 'details' && selectedClass && (
              <ClassDetails
                classDetails={selectedClass}
                selectedSeat={selectedSeat}
                onSeatSelect={handleSeatSelect}
              />
            )}

            {currentStep === 'booking' && selectedClass && selectedSeat && (
              <BookingForm
                classDetails={selectedClass}
                seat={selectedSeat}
                onSubmit={handleBooking}
                onBack={handleBack}
              />
            )}

            {currentStep === 'success' && booking && selectedClass && selectedSeat && (
              <BookingSuccess
                booking={booking}
                classDetails={selectedClass}
                seat={selectedSeat}
                onNewBooking={handleNewBooking}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
