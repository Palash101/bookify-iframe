'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClassList } from '@/components/booking/class-list'
import { DateCalendar } from '@/components/booking/date-calendar'
import { LocationSelect } from '@/components/booking/location-select'
import { getStoredEmbedOriginForApi } from '@/lib/embed-origins'
import { bookifyService } from '@/lib/bookify/bookify-service'
import type { Gym, Location } from '@/lib/bookify/types'

export interface GymClass {
  id: string
  name: string
  instructor: string
  time: string
  startTime?: string
  duration: string
  capacity: number
  enrolled: number
  category: string
  description: string
  image: string
  trainerImage?: string
  locationName?: string
  startDate?: string
  classDate?: string
  endTime?: string
  price?: string
  gender?: string
  themeName?: string
  bookingType?: string
  fullyBooked?: boolean
  status?: string
  raw?: Record<string, unknown>
}

interface ClassesResponse {
  classes?: GymClass[]
  hasMore?: boolean
  error?: string
}

const PAGE_SIZE = 20

function getToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function pickId(item: Record<string, unknown>): string {
  const id = item.id ?? item._id ?? item.location_id
  return id != null ? String(id) : ''
}

function pickName(item: Record<string, unknown>): string {
  const name = item.title ?? item.name ?? item.location_name ?? item.label
  return name != null ? String(name) : 'Unnamed'
}

function mapLocation(item: Record<string, unknown>): Location | null {
  const id = pickId(item)
  if (!id) return null
  return { id, name: pickName(item), raw: item }
}

function unwrapList(response: { data?: unknown; [key: string]: unknown }): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[]

  if (Array.isArray(response.data)) {
    return response.data as Record<string, unknown>[]
  }

  const data = response.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>
    for (const key of ['items', 'classes', 'results', 'records']) {
      const value = record[key]
      if (Array.isArray(value)) return value as Record<string, unknown>[]
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) return value as Record<string, unknown>[]
    }
  }

  for (const value of Object.values(response)) {
    if (Array.isArray(value)) return value as Record<string, unknown>[]
  }

  return []
}

export function BookingWidget() {
  const [gym, setGym] = useState<Gym | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(getToday)
  const [classes, setClasses] = useState<GymClass[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [ready, setReady] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFetchingNextPageRef = useRef(false)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLocations = async () => {
      setLoadingLocations(true)
      setError(null)

      try {
        const [gymResponse, locationsResponse] = await Promise.all([
          bookifyService.getGym(),
          bookifyService.getLocations(),
        ])
        if (cancelled) return

        const gymRecord =
          gymResponse.data && typeof gymResponse.data === 'object' && !Array.isArray(gymResponse.data)
            ? (gymResponse.data as Record<string, unknown>)
            : (gymResponse as Record<string, unknown>)

        const gymId = gymRecord.id
        setGym(
          gymId != null
            ? {
                id: String(gymId),
                businessName: String(gymRecord.business_name ?? gymRecord.businessName ?? 'Studio'),
                domain: gymRecord.domain != null ? String(gymRecord.domain) : undefined,
                raw: gymRecord,
              }
            : null,
        )

        const mappedLocations = unwrapList(locationsResponse)
          .map(mapLocation)
          .filter((item): item is Location => item != null)

        setLocations(mappedLocations)
        setSelectedLocationId((current) => current || mappedLocations[0]?.id || '')
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

    void loadLocations()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const selectedLocation = useMemo(
    () => locations.find((loc) => loc.id === selectedLocationId),
    [locations, selectedLocationId],
  )

  const fetchClasses = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (!selectedLocationId) {
        setClasses([])
        setHasMore(false)
        return
      }

      if (replace) {
        setLoadingClasses(true)
      } else {
        setLoadingMore(true)
      }

      setError(null)

      try {
        const query = new URLSearchParams({
          page: String(nextPage),
          limit: String(PAGE_SIZE),
          date: selectedDateKey,
          locationId: selectedLocationId,
        })

        const embedOrigin = getStoredEmbedOriginForApi()
        const headers: HeadersInit = embedOrigin
          ? {
              'X-Embed-Origin': embedOrigin,
              'X-Origin': embedOrigin,
            }
          : {}

        const response = await fetch(`/api/classes?${query.toString()}`, {
          cache: 'no-store',
          headers,
        })
        const data = (await response.json()) as ClassesResponse

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch classes')
        }

        const nextClasses = Array.isArray(data.classes) ? data.classes : []
        setClasses((prev) => (replace ? nextClasses : [...prev, ...nextClasses]))
        setHasMore(Boolean(data.hasMore))
        setPage(nextPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes')
        if (replace) {
          setClasses([])
        }
        setHasMore(false)
      } finally {
        isFetchingNextPageRef.current = false
        setLoadingClasses(false)
        setLoadingMore(false)
      }
    },
    [selectedDateKey, selectedLocationId],
  )

  useEffect(() => {
    if (!ready || !selectedLocationId) return
    isFetchingNextPageRef.current = false
    void fetchClasses(1, true)
  }, [ready, selectedLocationId, selectedDateKey, fetchClasses])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !ready || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first?.isIntersecting) return
        if (loadingClasses || loadingMore || isFetchingNextPageRef.current) return

        isFetchingNextPageRef.current = true
        void fetchClasses(page + 1, false)
      },
      { root: scrollRoot ?? undefined, rootMargin: '240px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchClasses, hasMore, loadingClasses, loadingMore, page, ready, scrollRoot])

  const handleDateSelect = (date: Date) => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    setSelectedDate(normalized)
    setPage(1)
    setHasMore(false)
    setClasses([])
  }

  const showInitialLoader = !ready || loadingLocations

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 py-6">
        {error && (
          <div className="mb-4 shrink-0 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {showInitialLoader ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading classes...</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden">
            <div className="shrink-0 space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
                    Book your session
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Classes
                  </h1>
                  <p className="mt-1 max-w-md text-sm leading-snug text-slate-500">
                    Pick a date and location to find available classes near you.
                  </p>
                </div>
                <div className="hidden h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 sm:block" />
              </div>

              <DateCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDateSelect(getToday())}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary/40"
                >
                  Today
                </button>

                <LocationSelect
                  locations={locations}
                  value={selectedLocationId}
                  onValueChange={(id) => {
                    setSelectedLocationId(id)
                    setPage(1)
                    setHasMore(false)
                    setClasses([])
                  }}
                  disabled={locations.length === 0}
                  variant="inline"
                />
              </div>
            </div>

            <ClassList
              date={selectedDate}
              classes={classes}
              locationName={selectedLocation?.name}
              orgId={gym?.id}
              locationId={selectedLocationId}
              isLoading={loadingClasses}
              isLoadingMore={loadingMore}
              onScrollRootChange={setScrollRoot}
            >
              {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden="true" />}
            </ClassList>
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground">Powered by FitnezStudios</p>
      </footer>
    </div>
  )
}
