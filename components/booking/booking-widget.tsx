'use client'

import { useState, useEffect, useCallback } from 'react'
import { DateCalendar } from '@/components/booking/date-calendar'
import { ClassList } from '@/components/booking/class-list'
import { ClassDetails } from '@/components/booking/class-details'
import { BookingForm } from '@/components/booking/booking-form'
import { BookingSuccess } from '@/components/booking/booking-success'
import { LocationSelect } from '@/components/booking/location-select'
import { TrainingProgramFilter } from '@/components/booking/training-program-filter'
import { bookifyService } from '@/lib/bookify/bookify-service'
import {
  mapBookifyClass,
  mapLocation,
  mapTrainingProgram,
  toClassDetails,
  unwrapList,
} from '@/lib/bookify/mappers'
import type { Location, TrainingProgram } from '@/lib/bookify/types'

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
  trainingProgramId?: string
  startDate?: string
  classDate?: string
  endTime?: string
  price?: string
  gender?: string
  themeName?: string
  bookingType?: string
  fullyBooked?: boolean
  status?: string
  layoutId?: string
  raw?: Record<string, unknown>
}

export interface Seat {
  id: string
  row: number
  column: number
  label: string
  status: 'available' | 'booked' | 'selected'
  x?: number
  y?: number
  shape?: string
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

const CALENDAR_DAYS = 10

export function BookingWidget() {
  const [currentStep, setCurrentStep] = useState<Step>('calendar')
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([])
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [fetchedClasses, setFetchedClasses] = useState<GymClass[]>([])
  const [classes, setClasses] = useState<GymClass[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassDetailsType | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadLocations = async () => {
      setLoadingLocations(true)
      setError(null)

      try {
        const response = await bookifyService.getLocations()
        if (cancelled) return

        const mapped = unwrapList(response)
          .map(mapLocation)
          .filter((item): item is Location => item != null)

        setLocations(mapped)
        if (mapped.length > 0) {
          setSelectedLocationId(mapped[0].id)
        } else {
          setError('No locations found for this tenant.')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load locations')
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false)
          setReady(true)
        }
      }
    }

    loadLocations()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedLocationId) {
      setTrainingPrograms([])
      setSelectedProgramIds([])
      return
    }

    let cancelled = false

    const loadPrograms = async () => {
      setLoadingPrograms(true)
      setError(null)
      try {
        const response = await bookifyService.getTrainingPrograms(selectedLocationId)
        if (cancelled) return

        const mapped = unwrapList(response)
          .map(mapTrainingProgram)
          .filter((item): item is TrainingProgram => item != null)

        setTrainingPrograms(mapped)
        setSelectedProgramIds([])
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load training programs',
          )
          setTrainingPrograms([])
        }
      } finally {
        if (!cancelled) {
          setLoadingPrograms(false)
        }
      }
    }

    loadPrograms()

    return () => {
      cancelled = true
    }
  }, [selectedLocationId])

  const filterClasses = useCallback(
    (items: GymClass[], date: Date) => {
      return items.filter((gymClass) => {
        if (gymClass.classDate || gymClass.startDate) {
          const dateStr = gymClass.classDate ?? gymClass.startDate?.split('T')[0]
          if (dateStr) {
            const [y, m, d] = dateStr.split('-').map(Number)
            const classDay = new Date(y, m - 1, d)
            if (classDay.toDateString() !== date.toDateString()) {
              return false
            }
          }
        }

        if (selectedProgramIds.length === 0) return true
        if (!gymClass.trainingProgramId) return true
        return selectedProgramIds.includes(gymClass.trainingProgramId)
      })
    },
    [selectedProgramIds],
  )

  const fetchClassesForDate = useCallback(
    async (date: Date) => {
      if (!selectedLocationId) return

      setLoading(true)
      setError(null)
      try {
        const response = await bookifyService.getClasses(
          { days: CALENDAR_DAYS, sort_order: 'asc' },
          selectedLocationId,
        )

        const mapped = unwrapList(response)
          .map(mapBookifyClass)
          .filter((item): item is GymClass => item != null)

        setFetchedClasses(mapped)
        setCurrentStep('classes')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes')
        setCurrentStep('calendar')
      } finally {
        setLoading(false)
      }
    },
    [selectedLocationId],
  )

  useEffect(() => {
    if (selectedDate && selectedLocationId) {
      fetchClassesForDate(selectedDate)
    }
  }, [selectedDate, selectedLocationId, fetchClassesForDate])

  useEffect(() => {
    if (!selectedDate) {
      setClasses([])
      return
    }
    setClasses(filterClasses(fetchedClasses, selectedDate))
  }, [fetchedClasses, selectedDate, selectedProgramIds, filterClasses])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setFetchedClasses([])
    setClasses([])
  }

  const handleClassSelect = (gymClass: GymClass) => {
    setSelectedClass(toClassDetails(gymClass))
    setCurrentStep('details')
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
      const data = await bookifyService.createBooking({
        classId: selectedClass.id,
        seatId: selectedSeat.id,
        user,
      })

      const booking =
        (data as { booking?: Booking }).booking ??
        (data.data as Booking | undefined)

      if (!booking) {
        throw new Error(
          (data as { message?: string }).message || 'Booking failed',
        )
      }

      setBooking(booking)
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
        setFetchedClasses([])
        setClasses([])
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
        setCurrentStep('calendar')
        setSelectedDate(null)
        setFetchedClasses([])
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
    setFetchedClasses([])
    setClasses([])
    setSelectedClass(null)
    setSelectedSeat(null)
    setBooking(null)
  }

  const showFullPageLoader =
    loading && (currentStep === 'details' || currentStep === 'booking')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </header>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {currentStep === 'calendar' && (
          <div className="space-y-6">
            {!ready || loadingLocations ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading locations…</p>
              </div>
            ) : (
              <>
                <LocationSelect
                  locations={locations}
                  value={selectedLocationId}
                  onValueChange={(id) => {
                    setSelectedLocationId(id)
                    setSelectedDate(null)
                    setFetchedClasses([])
                    setClasses([])
                  }}
                  disabled={locations.length === 0}
                />

                {loadingPrograms ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <TrainingProgramFilter
                    programs={trainingPrograms}
                    selectedIds={selectedProgramIds}
                    onChange={setSelectedProgramIds}
                    disabled={!selectedLocationId}
                  />
                )}

                <DateCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />

                {loading && selectedDate && (
                  <div className="flex justify-center py-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showFullPageLoader && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!showFullPageLoader && (
          <>
            {currentStep === 'classes' && selectedDate && (
              <>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <ClassList
                    date={selectedDate}
                    classes={classes}
                    onClassSelect={handleClassSelect}
                  />
                )}
              </>
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

            {currentStep === 'success' &&
              booking &&
              selectedClass &&
              selectedSeat && (
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
