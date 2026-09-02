'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { normalizeDateKey, toDateKey } from '@/lib/bookify/mappers'

interface DateCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  classDates?: string[]
}

const VISIBLE_DAYS = 7

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

    for (let i = 0; i < 10; i++) {
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

  const maxOffset = Math.max(0, dates.length - VISIBLE_DAYS)
  const visibleDates = dates.slice(startOffset, startOffset + VISIBLE_DAYS)

  const formatDay = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()

  const isSelected = (date: Date) =>
    selectedDate != null && toDateKey(date) === toDateKey(selectedDate)

  const hasClasses = (date: Date) => classDateSet.has(toDateKey(date))

  const selectDate = (date: Date) => {
    const picked = new Date(date)
    picked.setHours(0, 0, 0, 0)
    onDateSelect(picked)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setStartOffset((o) => Math.max(0, o - 1))}
        disabled={startOffset === 0}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous dates"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="grid flex-1 grid-cols-7 gap-1">
        {visibleDates.map((date) => {
          const selected = isSelected(date)
          const withClasses = hasClasses(date)

          return (
            <button
              key={toDateKey(date)}
              type="button"
              onClick={() => selectDate(date)}
              className={`flex flex-col items-center rounded-xl px-1 py-3 transition-all ${
                selected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted/60'
              }`}
            >
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  selected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                }`}
              >
                {formatDay(date)}
              </span>
              <span className="mt-1 text-lg font-bold leading-none">
                {date.getDate()}
              </span>
              <span
                className={`mt-2 h-1.5 w-1.5 rounded-full ${
                  selected
                    ? 'bg-primary-foreground'
                    : withClasses
                      ? 'bg-primary/50'
                      : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setStartOffset((o) => Math.min(maxOffset, o + 1))}
        disabled={startOffset >= maxOffset}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next dates"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
