'use client'

import dynamic from 'next/dynamic'

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

export function BookingWidgetClient() {
  return <BookingWidget />
}
