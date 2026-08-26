'use client'

import { Ban, CalendarOff, ShieldOff } from 'lucide-react'

type EmbedBlockedProps = {
  domain?: string | null
}

export function EmbedBlocked({ domain }: EmbedBlockedProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="mb-6 flex items-center justify-center gap-3 text-destructive">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff className="h-7 w-7" aria-hidden />
        </span>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <Ban className="h-7 w-7" aria-hidden />
        </span>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <CalendarOff className="h-7 w-7" aria-hidden />
        </span>
      </div>

      <h1 className="text-foreground max-w-md text-xl font-semibold tracking-tight sm:text-2xl">
        Bookings not allowed for your domain
      </h1>
      <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        This booking widget can only be embedded on authorized websites. Contact
        the site owner if you need access.
      </p>

      {domain ? (
        <p className="bg-muted text-muted-foreground mt-6 max-w-full truncate rounded-md px-3 py-2 font-mono text-xs">
          {domain}
        </p>
      ) : (
        <p className="text-muted-foreground mt-6 text-xs">
          Could not verify the embedding domain.
        </p>
      )}
    </div>
  )
}
