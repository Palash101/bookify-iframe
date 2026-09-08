import { NextRequest, NextResponse } from 'next/server'
import { bookifyFetch } from '@/lib/bookify/api-client'
import { isOriginAllowed } from '@/lib/embed-origins'
import { mapBookifyClass, unwrapList } from '@/lib/bookify/mappers'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Tenant-Key, X-Embed-Origin, X-Origin',
  )
  return response
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const locationId = searchParams.get('locationId')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))

  if (!locationId) {
    return withCors(
      NextResponse.json({ error: 'locationId parameter is required' }, { status: 400 }),
    )
  }

  if (!date) {
    return withCors(
      NextResponse.json({ error: 'date parameter is required' }, { status: 400 }),
    )
  }

  const embedOrigin =
    request.headers.get('X-Embed-Origin') ??
    request.headers.get('X-Origin') ??
    request.headers.get('origin')

  if (embedOrigin && !isOriginAllowed(embedOrigin)) {
    return withCors(
      NextResponse.json({ error: 'Embed origin not allowed' }, { status: 403 }),
    )
  }

  const headers: Record<string, string> = {}
  if (embedOrigin) {
    headers.Origin = embedOrigin
    headers.Referer = `${embedOrigin}/`
    headers['X-Embed-Origin'] = embedOrigin
    headers['X-Origin'] = embedOrigin
  }

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    date,
  })

  try {
    const { data, ok, status } = await bookifyFetch(
      `/locations/${locationId}/classes?${query.toString()}`,
      {
        method: 'GET',
        headers,
      },
    )

    if (!ok) {
      return withCors(
        NextResponse.json(
          {
            error:
              (data as { message?: string }).message ||
              (data as { error?: string }).error ||
              'Failed to fetch classes',
          },
          { status },
        ),
      )
    }

    const classes = unwrapList(data as Record<string, unknown>)
      .map(mapBookifyClass)
      .filter((item): item is NonNullable<ReturnType<typeof mapBookifyClass>> => item != null)

    return withCors(
      NextResponse.json({
        classes,
        page,
        limit,
        date,
        hasMore: classes.length >= limit,
      }),
    )
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to fetch classes',
        },
        { status: 502 },
      ),
    )
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }))
}
