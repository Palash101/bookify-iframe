'use client'

import { useMemo } from 'react'
import { normalizeDateKey, toDateKey } from '@/lib/bookify/mappers'

interface DateCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  classDates?: string[]
}

function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function DateCalendar({
  selectedDate,
  onDateSelect,
  classDates = [],
}: DateCalendarProps) {
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

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const formatDate = (date: Date) => {
    return date.getDate()
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return toDateKey(date) === toDateKey(selectedDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return toDateKey(date) === toDateKey(today)
  }

  const hasClasses = (date: Date) => classDateSet.has(toDateKey(date))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Select a Date</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a date to view available classes
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
        {dates.map((date) => {
          const key = toDateKey(date)
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                const picked = new Date(date)
                picked.setHours(0, 0, 0, 0)
                onDateSelect(picked)
              }}
              className={`group relative flex flex-col items-center rounded-xl border-2 p-3 transition-all ${
                isSelected(date)
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                  : hasClasses(date)
                    ? 'border-primary/40 bg-card text-card-foreground hover:border-primary/50 hover:shadow-md'
                    : 'border-border bg-card text-card-foreground hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isSelected(date)
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                }`}
              >
                {formatDay(date)}
              </span>
              <span className="mt-1 text-xl font-bold">{formatDate(date)}</span>
              <span
                className={`text-xs ${
                  isSelected(date)
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                }`}
              >
                {formatMonth(date)}
              </span>
              {isToday(date) && (
                <span
                  className={`mt-1 text-[10px] font-medium ${
                    isSelected(date) ? 'text-primary-foreground' : 'text-primary'
                  }`}
                >
                  Today
                </span>
              )}
              {hasClasses(date) && !isSelected(date) && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
