import { NextRequest, NextResponse } from 'next/server'
import { bookifyFetch } from '@/lib/bookify/api-client'
import { mapBookifyClass, toClassDetails, unwrapList } from '@/lib/bookify/mappers'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Tenant-Key',
  )
  return response
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const { data, ok, status } = await bookifyFetch(`/classes/${id}`, {
      method: 'GET',
    })

    if (!ok) {
      return withCors(
        NextResponse.json(
          {
            error:
              (data as { message?: string }).message ||
              (data as { error?: string }).error ||
              'Class not found',
          },
          { status },
        ),
      )
    }

    const items = Array.isArray(data)
      ? (data as Record<string, unknown>[])
      : unwrapList(data as Record<string, unknown>)

    const raw =
      items[0] ??
      ((data as { data?: Record<string, unknown> }).data as
        | Record<string, unknown>
        | undefined) ??
      (data as Record<string, unknown>)

    const gymClass = mapBookifyClass(raw)
    if (!gymClass) {
      return withCors(
        NextResponse.json({ error: 'Class not found' }, { status: 404 }),
      )
    }

    return withCors(NextResponse.json(toClassDetails(gymClass)))
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch class details',
        },
        { status: 502 },
      ),
    )
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }))
}
