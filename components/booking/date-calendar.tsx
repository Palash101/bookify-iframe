'use client'

import { useMemo } from 'react'

interface DateCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export function DateCalendar({ selectedDate, onDateSelect }: DateCalendarProps) {
  const dates = useMemo(() => {
    const today = new Date()
    const dateArray = []
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dateArray.push(date)
    }
    
    return dateArray
  }, [])

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
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Select a Date</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a date from the next 10 days to view available classes
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
        {dates.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`group relative flex flex-col items-center rounded-xl border-2 p-3 transition-all ${
              isSelected(date)
                ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                : 'border-border bg-card text-card-foreground hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <span className={`text-xs font-medium ${
              isSelected(date) ? 'text-primary-foreground/80' : 'text-muted-foreground'
            }`}>
              {formatDay(date)}
            </span>
            <span className="mt-1 text-xl font-bold">
              {formatDate(date)}
            </span>
            <span className={`text-xs ${
              isSelected(date) ? 'text-primary-foreground/80' : 'text-muted-foreground'
            }`}>
              {formatMonth(date)}
            </span>
            {isToday(date) && (
              <span className={`mt-1 text-[10px] font-medium ${
                isSelected(date) ? 'text-primary-foreground' : 'text-primary'
              }`}>
                Today
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-secondary/50 px-4 py-2 text-sm text-secondary-foreground">
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      )}
    </div>
  )
}
