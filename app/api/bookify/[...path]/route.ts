import { NextRequest, NextResponse } from 'next/server'
import { buildBookifyUrl, getBookifyHeaders } from '@/lib/bookify/api-client'
import { isOriginAllowed } from '@/lib/embed-origins'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Tenant-Key, X-Embed-Origin, X-Origin',
  )
  return response
}

async function proxyToBookify(
  request: NextRequest,
  pathSegments: string[],
  method: string,
) {
  const targetPath = pathSegments.join('/')
  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()
  const url = buildBookifyUrl(targetPath, query || undefined)

  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await request.text()

  try {
    const embedOrigin =
      request.headers.get('X-Embed-Origin') ??
      request.headers.get('X-Origin')

    if (embedOrigin && !isOriginAllowed(embedOrigin)) {
      return withCors(
        NextResponse.json({ error: 'Embed origin not allowed' }, { status: 403 }),
      )
    }

    const originForApi = embedOrigin ?? request.headers.get('origin')

    const extraHeaders: Record<string, string> = {}
    if (originForApi) {
      // API validates allowed domains via Origin — use parent site when embedded
      extraHeaders['Origin'] = originForApi
      extraHeaders['Referer'] = `${originForApi}/`
      extraHeaders['X-Embed-Origin'] = originForApi
      extraHeaders['X-Origin'] = originForApi
    }
    const upstream = await fetch(url, {
      method,
      headers: getBookifyHeaders(extraHeaders),
      body: body || undefined,
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))
    return withCors(NextResponse.json(data, { status: upstream.status }))
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to reach Bookify API',
        },
        { status: 502 },
      ),
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyToBookify(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxyToBookify(request, path, 'POST')
}

export async function OPTIONS() {
  return withCors(
    new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    }),
  )
}
