'use client'

import { useLayoutEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { EmbedBlocked } from '@/components/booking/embed-blocked'
import {
  getEmbedOriginForApi,
  getEmbedParentOrigin,
  isEmbedded,
  isOriginAllowed,
  setEmbedOriginForApi,
  setVerifiedParentOrigin,
} from '@/lib/embed-origins'

const BOOKIFY_EMBED_INIT = 'BOOKIFY_EMBED_INIT'

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

  useLayoutEffect(() => {
    const resolveEmbed = () => {
      const origin = getEmbedParentOrigin()
      const apiOrigin = getEmbedOriginForApi()
      setEmbedOriginForApi(apiOrigin)
      setParentOrigin(origin)
      setStatus(isOriginAllowed(origin) ? 'allowed' : 'blocked')
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== BOOKIFY_EMBED_INIT) return
      // event.origin is set by the browser — cannot be spoofed by the iframe
      setVerifiedParentOrigin(event.origin)
      resolveEmbed()
    }

    window.addEventListener('message', onMessage)
    resolveEmbed()

    // Allow embed.js postMessage to arrive before finalizing
    const timeout = isEmbedded()
      ? setTimeout(resolveEmbed, 200)
      : undefined

    return () => {
      window.removeEventListener('message', onMessage)
      if (timeout) clearTimeout(timeout)
    }
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
