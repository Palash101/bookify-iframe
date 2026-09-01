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
  const isAllSelected = selectedIds.length === 0

  const selectAll = () => {
    if (disabled) return
    onChange([])
  }

  const selectProgram = (id: string) => {
    if (disabled) return
    onChange([id])
  }

  if (programs.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Training programs
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={selectAll}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            isAllSelected
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-card text-card-foreground hover:border-primary/50'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          All
        </button>
        {programs.map((program) => {
          const isSelected = selectedIds.includes(program.id)
          return (
            <button
              key={program.id}
              type="button"
              disabled={disabled}
              onClick={() => selectProgram(program.id)}
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
