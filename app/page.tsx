import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            Bookify
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Embeddable Gym Class Booking Widget
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">10-Day Calendar</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse and select dates from a visual 10-day calendar strip
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">Class Catalog</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              View available classes with details, instructors, and availability
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">Seat Selection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Interactive seat map to choose your preferred spot
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/widget"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Widget
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3 font-medium text-card-foreground transition-colors hover:bg-secondary"
          >
            View Demo Integration
          </Link>
        </div>

        {/* API Info */}
        <div className="mt-16 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-card-foreground">API Endpoints</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The widget uses these REST API endpoints:
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <code className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">GET</code>
              <div>
                <code className="text-sm text-card-foreground">/api/classes?date=YYYY-MM-DD</code>
                <p className="mt-1 text-xs text-muted-foreground">Fetch classes for a specific date</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <code className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">GET</code>
              <div>
                <code className="text-sm text-card-foreground">/api/classes/[id]</code>
                <p className="mt-1 text-xs text-muted-foreground">Get class details and seat layout</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <code className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">POST</code>
              <div>
                <code className="text-sm text-card-foreground">/api/book</code>
                <p className="mt-1 text-xs text-muted-foreground">Book a class with user details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code Section */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-card-foreground">Embed Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add this widget to any webpage using an iframe:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm text-foreground">
{`<iframe
  src="YOUR_DOMAIN/widget"
  width="100%"
  height="700"
  frameborder="0"
  title="Gym Class Booking"
></iframe>`}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            Or use the embed script for automatic initialization:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm text-foreground">
{`<div id="bookify-widget"></div>
<script src="YOUR_DOMAIN/embed.js"></script>`}
          </pre>
        </div>
      </div>
    </div>
  )
}
