'use client'

import type { TrainingProgram } from '@/lib/bookify/types'

interface TrainingProgramFilterProps {
  programs: TrainingProgram[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function TrainingProgramFilter({
  programs,
  selectedIds,
  onChange,
  disabled,
}: TrainingProgramFilterProps) {
  const toggleProgram = (id: string) => {
    if (disabled) return
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (programs.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">
          Training programs
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Select one or more programs to filter classes. Leave empty to show all.
      </p>
      <div className="flex flex-wrap gap-2">
        {programs.map((program) => {
          const isSelected = selectedIds.includes(program.id)
          return (
            <button
              key={program.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleProgram(program.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-card-foreground hover:border-primary/50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {program.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
