'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { EmbedBlocked } from '@/components/booking/embed-blocked'
import {
  getEmbedOriginForApi,
  getEmbedParentOrigin,
  isOriginAllowed,
  setEmbedOriginForApi,
} from '@/lib/embed-origins'

const BookingWidget = dynamic(
  () =>
    import('@/components/booking/booking-widget').then((mod) => ({
      default: mod.BookingWidget,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  },
)

type EmbedStatus = 'checking' | 'allowed' | 'blocked'

export function BookingWidgetClient() {
  const [status, setStatus] = useState<EmbedStatus>('checking')
  const [parentOrigin, setParentOrigin] = useState<string | null>(null)

  useEffect(() => {
    const origin = getEmbedParentOrigin()
    setEmbedOriginForApi(getEmbedOriginForApi())
    setParentOrigin(origin)
    setStatus(isOriginAllowed(origin) ? 'allowed' : 'blocked')
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (status === 'blocked') {
    return <EmbedBlocked domain={parentOrigin} />
  }

  return <BookingWidget />
}
