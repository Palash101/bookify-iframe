'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { normalizeDateKey, toDateKey } from '@/lib/bookify/mappers'

interface DateCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  classDates?: string[]
}

const VISIBLE_DAYS = 10
const GENERATED_DAYS = 30

function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function DateCalendar({
  selectedDate,
  onDateSelect,
  classDates = [],
}: DateCalendarProps) {
  const [startOffset, setStartOffset] = useState(0)

  const dates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateMap = new Map<string, Date>()

    for (let i = 0; i < GENERATED_DAYS; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dateMap.set(toDateKey(date), date)
    }

    for (const key of classDates) {
      const normalized = normalizeDateKey(key)
      if (normalized && !dateMap.has(normalized)) {
        dateMap.set(normalized, dateFromKey(normalized))
      }
    }

    return [...dateMap.values()].sort((a, b) => a.getTime() - b.getTime())
  }, [classDates])

  const classDateSet = useMemo(
    () => new Set(classDates.map((d) => normalizeDateKey(d)).filter(Boolean)),
    [classDates],
  )

  const todayKey = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return toDateKey(today)
  }, [])

  const maxOffset = Math.max(0, dates.length - VISIBLE_DAYS)
  const visibleDates = dates.slice(startOffset, startOffset + VISIBLE_DAYS)

  const rangeLabel = useMemo(() => {
    if (visibleDates.length === 0) return ''
    const first = visibleDates[0]
    const last = visibleDates[visibleDates.length - 1]
    const sameMonth =
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()

    if (sameMonth) {
      return first.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    }

    return `${first.toLocaleDateString('en-US', { month: 'short' })} – ${last.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }, [visibleDates])

  const formatDay = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)

  const isSelected = (date: Date) =>
    selectedDate != null && toDateKey(date) === toDateKey(selectedDate)

  const isToday = (date: Date) => toDateKey(date) === todayKey

  const hasClasses = (date: Date) => classDateSet.has(toDateKey(date))

  const selectDate = (date: Date) => {
    const picked = new Date(date)
    picked.setHours(0, 0, 0, 0)
    onDateSelect(picked)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-sky-800/80 sm:text-sm">
          {rangeLabel}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStartOffset((o) => Math.max(0, o - 1))}
            disabled={startOffset === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700 transition-all hover:bg-sky-100 hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous dates"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setStartOffset((o) => Math.min(maxOffset, o + 1))}
            disabled={startOffset >= maxOffset}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700 transition-all hover:bg-sky-100 hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next dates"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="grid gap-0.5 sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${VISIBLE_DAYS}, minmax(0, 1fr))`,
        }}
      >
        {visibleDates.map((date) => {
          const selected = isSelected(date)
          const today = isToday(date)
          const withClasses = hasClasses(date)

          return (
            <button
              key={toDateKey(date)}
              type="button"
              onClick={() => selectDate(date)}
              aria-pressed={selected}
              aria-label={date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
              className={`group flex flex-col items-center gap-1 rounded-xl px-0.5 py-1 transition-all duration-200 ${
                selected ? 'bg-sky-500/10' : 'hover:bg-sky-50/80'
              }`}
            >
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${
                  selected
                    ? 'text-sky-600'
                    : today
                      ? 'text-sky-500'
                      : 'text-slate-400 group-hover:text-slate-500'
                }`}
              >
                {formatDay(date)}
              </span>

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-all duration-200 sm:h-9 sm:w-9 sm:text-sm ${
                  selected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/35'
                    : today
                      ? 'bg-white text-sky-600 ring-2 ring-sky-300'
                      : 'text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700'
                }`}
              >
                {date.getDate()}
              </span>

              <span
                className={`h-1 w-1 rounded-full transition-colors ${
                  selected
                    ? 'bg-sky-500'
                    : withClasses
                      ? 'bg-emerald-400'
                      : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
