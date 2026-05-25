import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isEmbeddable(pathname: string) {
  return (
    pathname.startsWith('/widget') ||
    pathname === '/embed-demo.html'
  )
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (isEmbeddable(request.nextUrl.pathname)) {
    response.headers.delete('X-Frame-Options')
    response.headers.delete('Content-Security-Policy')
  }

  return response
}

export const config = {
  matcher: ['/widget', '/widget/:path*', '/embed-demo.html'],
}
