import { NextRequest, NextResponse } from 'next/server'
import { bookifyFetch } from '@/lib/bookify/api-client'
import { mapBookifyClass, unwrapList } from '@/lib/bookify/mappers'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Tenant-Key',
  )
  return response
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const locationId = searchParams.get('locationId')
  const days = searchParams.get('days') ?? '10'
  const sort_order = searchParams.get('sort_order') ?? 'asc'

  if (!date) {
    return withCors(
      NextResponse.json({ error: 'Date parameter is required' }, { status: 400 }),
    )
  }

  const queryString = `days=${days}&sort_order=${sort_order}`
  const path = locationId
    ? `/locations/${locationId}/classes?${queryString}`
    : `/classes?${queryString}`

  try {
    const { data, ok, status } = await bookifyFetch(path, { method: 'GET' })

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

    const mapped = unwrapList(data as Record<string, unknown>)
      .map(mapBookifyClass)
      .filter((item) => item != null)
      .filter((gymClass) => {
        if (!gymClass.startDate) return true
        const classDate = new Date(gymClass.startDate)
        const selected = new Date(date)
        return classDate.toDateString() === selected.toDateString()
      })

    return withCors(NextResponse.json({ classes: mapped, date }))
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
