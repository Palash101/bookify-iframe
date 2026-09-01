import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isEmbeddable(pathname: string) {
  return pathname.startsWith('/widget')
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (isEmbeddable(request.nextUrl.pathname)) {
    // Allow any parent to load the iframe so we can render a custom
    // "domain not allowed" UI; access is enforced client-side.
    // response.headers.delete('X-Frame-Options')
    // response.headers.set('Content-Security-Policy', 'frame-ancestors *')
  }

  return response
}

export const config = {
  matcher: ['/widget', '/widget/:path*'],
}
