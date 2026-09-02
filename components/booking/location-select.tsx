'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Location } from '@/lib/bookify/types'

interface LocationSelectProps {
  locations: Location[]
  value: string
  onValueChange: (locationId: string) => void
  disabled?: boolean
  variant?: 'default' | 'inline'
}

export function LocationSelect({
  locations,
  value,
  onValueChange,
  disabled,
  variant = 'default',
}: LocationSelectProps) {
  if (locations.length === 0) {
    if (variant === 'inline') return null
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Location</label>
        <p className="text-sm text-muted-foreground">No locations available.</p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <Select
        value={value || locations[0].id}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 min-w-[140px] rounded-full border-border bg-card px-4 text-sm font-medium shadow-none">
          <SelectValue placeholder="Locations" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Location</label>
      <Select
        value={value || locations[0].id}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Select a location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
