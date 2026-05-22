import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Bookify Widget',
  description: 'Embeddable Gym Class Booking Widget',
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Allow embedding in iframes */}
        <meta name="robots" content="noindex" />
      </head>
      <body className="font-sans antialiased bg-background">
        {children}
      </body>
    </html>
  )
}
