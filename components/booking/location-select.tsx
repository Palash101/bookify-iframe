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
}

export function LocationSelect({
  locations,
  value,
  onValueChange,
  disabled,
}: LocationSelectProps) {
  if (locations.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Location</label>
        <p className="text-sm text-muted-foreground">No locations available.</p>
      </div>
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
