'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DateCalendar } from '@/components/booking/date-calendar'
import { ClassList } from '@/components/booking/class-list'
import { ClassDetails } from '@/components/booking/class-details'
import { BookingForm } from '@/components/booking/booking-form'
import { BookingSuccess } from '@/components/booking/booking-success'
import { LocationSelect } from '@/components/booking/location-select'
import { bookifyService } from '@/lib/bookify/bookify-service'
import {
  mapBookifyClass,
  mapGym,
  mapLocation,
  mapTrainingProgram,
  normalizeDateKey,
  toClassDetails,
  toDateKey,
  unwrapList,
  unwrapRecord,
} from '@/lib/bookify/mappers'
import type { Gym, Location, TrainingProgram } from '@/lib/bookify/types'

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
  trainerImage?: string
  locationName?: string
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

type Step = 'calendar' | 'details' | 'booking' | 'success'

const CALENDAR_DAYS = 10

export function BookingWidget() {
  const [currentStep, setCurrentStep] = useState<Step>('calendar')
  const [gym, setGym] = useState<Gym | null>(null)
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

    const loadInitialData = async () => {
      setLoadingLocations(true)
      setError(null)

      try {
        const [gymResponse, locationsResponse] = await Promise.all([
          bookifyService.getGym(),
          bookifyService.getLocations(),
        ])

        if (cancelled) return

        const mappedGym = mapGym(unwrapRecord(gymResponse))
        const mappedLocations = unwrapList(locationsResponse)
          .map(mapLocation)
          .filter((item): item is Location => item != null)

        setGym(mappedGym)
        setLocations(mappedLocations)

        if (mappedLocations.length > 0) {
          setSelectedLocationId(mappedLocations[0].id)
        } else {
          setError('No locations found for this tenant.')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load widget data')
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false)
          setReady(true)
        }
      }
    }

    loadInitialData()

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

  const getClassProgramIds = useCallback((gymClass: GymClass): string[] => {
    const ids = new Set<string>()
    if (gymClass.trainingProgramId) {
      ids.add(String(gymClass.trainingProgramId))
    }
    const program = gymClass.raw?.program
    if (program && typeof program === 'object') {
      const programId = (program as Record<string, unknown>).id
      if (programId != null) ids.add(String(programId))
    }
    return [...ids]
  }, [])

  const filterClasses = useCallback(
    (items: GymClass[], date: Date) => {
      const selectedDateKey = toDateKey(date)

      return items.filter((gymClass) => {
        const classDateKey = normalizeDateKey(
          gymClass.classDate ?? gymClass.startDate ?? null,
        )

        if (classDateKey && classDateKey !== selectedDateKey) {
          return false
        }

        if (selectedProgramIds.length === 0) return true

        const classProgramIds = getClassProgramIds(gymClass)
        if (classProgramIds.length === 0) return true

        return selectedProgramIds.some((id) =>
          classProgramIds.includes(String(id)),
        )
      })
    },
    [selectedProgramIds, getClassProgramIds],
  )

  const fetchClasses = useCallback(async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes')
      setFetchedClasses([])
    } finally {
      setLoading(false)
    }
  }, [selectedLocationId])

  useEffect(() => {
    if (selectedLocationId) {
      fetchClasses()
    } else {
      setFetchedClasses([])
    }
  }, [selectedLocationId, fetchClasses])

  const programFilteredClasses = useMemo(() => {
    if (selectedProgramIds.length === 0) return fetchedClasses

    return fetchedClasses.filter((gymClass) => {
      const classProgramIds = getClassProgramIds(gymClass)
      if (classProgramIds.length === 0) return true
      return selectedProgramIds.some((id) =>
        classProgramIds.includes(String(id)),
      )
    })
  }, [fetchedClasses, selectedProgramIds, getClassProgramIds])

  useEffect(() => {
    if (!selectedDate) {
      setClasses([])
      return
    }
    setClasses(filterClasses(fetchedClasses, selectedDate))
  }, [fetchedClasses, selectedDate, selectedProgramIds, filterClasses])

  const classDates = useMemo(
    () =>
      [
        ...new Set(
          programFilteredClasses
            .map((gymClass) =>
              normalizeDateKey(gymClass.classDate ?? gymClass.startDate ?? null),
            )
            .filter((date): date is string => date != null),
        ),
      ].sort(),
    [programFilteredClasses],
  )

  useEffect(() => {
    if (classDates.length === 0 || selectedDate) return

    const [y, m, d] = classDates[0].split('-').map(Number)
    setSelectedDate(new Date(y, m - 1, d))
  }, [classDates, selectedDate])

  const handleDateSelect = (date: Date) => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    setSelectedDate(normalized)
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
      case 'details':
        setCurrentStep('calendar')
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

  const selectedLocation = useMemo(
    () => locations.find((loc) => loc.id === selectedLocationId),
    [locations, selectedLocationId],
  )

  const handleShowAll = () => {
    setSelectedProgramIds([])
  }

  const handleToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setSelectedDate(today)
  }

  const timezoneLabel = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = -new Date().getTimezoneOffset() / 60
      const sign = offset >= 0 ? '+' : ''
      const city = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz
      return `${city} GMT${sign}${offset}`
    } catch {
      return 'Local time'
    }
  }, [])

  const showFullPageLoader =
    loading && (currentStep === 'details' || currentStep === 'booking')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {currentStep !== 'calendar' && currentStep !== 'success' && (
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {currentStep === 'calendar' && (
          <div className="space-y-5">
            {!ready || loadingLocations ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading widget…</p>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-primary">Classes</h1>
                    <div className="mt-1 h-1 w-16 rounded-full bg-primary" />
                  </div>
                </div>

                <DateCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  classDates={classDates}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      selectedProgramIds.length === 0
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    Show all
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary/40"
                  >
                    Today
                  </button>

                  <LocationSelect
                    locations={locations}
                    value={selectedLocationId}
                    onValueChange={(id) => {
                      setSelectedLocationId(id)
                      setSelectedDate(null)
                      setClasses([])
                    }}
                    disabled={locations.length === 0}
                    variant="inline"
                  />
                </div>

                {trainingPrograms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {loadingPrograms ? (
                      <div className="flex justify-center py-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      <>
                        {trainingPrograms.map((program) => {
                          const isSelected = selectedProgramIds.includes(program.id)
                          return (
                            <button
                              key={program.id}
                              type="button"
                              onClick={() =>
                                setSelectedProgramIds(
                                  isSelected ? [] : [program.id],
                                )
                              }
                              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              {program.name}
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}

                {selectedDate && loading && fetchedClasses.length === 0 && (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}

                {selectedDate && (!loading || fetchedClasses.length > 0) && (
                  <ClassList
                    date={selectedDate}
                    classes={classes}
                    locationName={selectedLocation?.name}
                    gymId={gym?.id}
                    locationId={selectedLocationId}
                  />
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

      <footer className="border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by FitnezStudios
        </p>
      </footer>
    </div>
  )
}
