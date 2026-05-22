import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Allow the widget page to be embedded in iframes
  if (request.nextUrl.pathname.startsWith('/widget')) {
    // Remove X-Frame-Options to allow embedding
    response.headers.delete('X-Frame-Options')
    // Set permissive CSP for iframe embedding
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *"
    )
  }
  
  return response
}

export const config = {
  matcher: ['/widget/:path*']
}
