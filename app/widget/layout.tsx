import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitnezstudios Widget',
  description: 'Fitnezstudios Gym Class Booking Widget',
  robots: { index: false, follow: false },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
