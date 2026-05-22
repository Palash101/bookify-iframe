export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">FitZone Gym</h1>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-white/70 hover:text-white">Home</a>
              <a href="#" className="text-sm text-white/70 hover:text-white">Classes</a>
              <a href="#" className="text-sm text-white/70 hover:text-white">Membership</a>
              <a href="#" className="text-sm text-white/70 hover:text-white">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Book Your Next <span className="text-primary">Workout</span>
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Reserve your spot in any of our premium fitness classes. 
            Choose your date, pick your class, and secure your seat.
          </p>
        </div>
      </section>

      {/* Embedded Widget */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <iframe
              src="/widget"
              className="h-[700px] w-full border-0"
              title="Bookify - Gym Class Booking"
              allow="clipboard-write"
            />
          </div>
        </div>
      </section>

      {/* Integration Instructions */}
      <section className="border-t border-white/10 bg-black/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="text-center text-2xl font-bold text-white">
            Embed This Widget on Your Website
          </h3>
          <p className="mt-2 text-center text-white/60">
            Add the booking widget to any webpage with just a few lines of code
          </p>

          <div className="mt-8 space-y-6">
            {/* Method 1 */}
            <div className="rounded-xl bg-white/5 p-6">
              <h4 className="font-semibold text-white">Method 1: Simple Iframe</h4>
              <p className="mt-1 text-sm text-white/60">
                Copy and paste this iframe code directly into your HTML
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 p-4 text-sm text-green-400">
{`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : 'YOUR_DOMAIN'}/widget"
  width="100%"
  height="700"
  frameborder="0"
  title="Gym Class Booking"
></iframe>`}
              </pre>
            </div>

            {/* Method 2 */}
            <div className="rounded-xl bg-white/5 p-6">
              <h4 className="font-semibold text-white">Method 2: Using Embed Script</h4>
              <p className="mt-1 text-sm text-white/60">
                Add a container div and include the embed script for automatic initialization
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 p-4 text-sm text-green-400">
{`<!-- Add this where you want the widget -->
<div id="bookify-widget"></div>

<!-- Add this before </body> -->
<script src="${typeof window !== 'undefined' ? window.location.origin : 'YOUR_DOMAIN'}/embed.js"></script>`}
              </pre>
            </div>

            {/* Method 3 */}
            <div className="rounded-xl bg-white/5 p-6">
              <h4 className="font-semibold text-white">Method 3: Custom Initialization</h4>
              <p className="mt-1 text-sm text-white/60">
                For more control, initialize the widget manually with custom options
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 p-4 text-sm text-green-400">
{`<div id="my-booking-widget"></div>

<script src="${typeof window !== 'undefined' ? window.location.origin : 'YOUR_DOMAIN'}/embed.js"></script>
<script>
  BookifyWidget.init({
    container: '#my-booking-widget',
    width: '100%',
    height: '700px',
    borderRadius: '16px',
    shadow: true
  });
</script>`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-white/50">
          <p>Powered by Bookify - Embeddable Gym Class Booking Widget</p>
        </div>
      </footer>
    </div>
  )
}
