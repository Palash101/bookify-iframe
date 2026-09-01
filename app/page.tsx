import Image from 'next/image'
import Link from 'next/link'

const features = [
  { title: '10-Day Calendar', desc: 'Pick dates from a visual calendar strip' },
  { title: 'Class Catalog', desc: 'Browse classes, instructors & availability' },
  { title: 'Seat Selection', desc: 'Interactive seat map for your spot' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Fitnezstudios"
              width={120}
              height={72}
              className="object-contain"
              priority
            />
          </Link>
          <Link
            href="/widget"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Widget
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Hero */}
        <section className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Embeddable{' '}
            <span className="text-primary">Class Booking</span> Widget
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop the Fitnezstudios booking widget into any website with an iframe or embed script.
          </p>
        </section>

        {/* Features */}
        <section className="mb-6 grid gap-2 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <h3 className="text-sm font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Embed */}
        <section className="rounded-lg border border-border bg-card p-3">
          <h2 className="text-sm font-semibold text-card-foreground">Embed Code</h2>
          <p className="mt-1 text-xs text-muted-foreground">Iframe embed:</p>
          <pre className="mt-1.5 overflow-x-auto rounded-md bg-muted p-2.5 text-[11px] leading-relaxed text-foreground">
{`<iframe
  src="YOUR_DOMAIN/widget"
  width="100%" height="700"
  frameborder="0"
  title="Fitnezstudios - Gym Class Booking"
></iframe>`}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">Or with embed script:</p>
          <pre className="mt-1.5 overflow-x-auto rounded-md bg-muted p-2.5 text-[11px] leading-relaxed text-foreground">
{`<div id="fitnezstudios-widget"></div>
<script src="YOUR_DOMAIN/embed.js"></script>`}
          </pre>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} FitnezStudios · Powered by embeddable booking widget
        </p>
      </footer>
    </div>
  )
}
