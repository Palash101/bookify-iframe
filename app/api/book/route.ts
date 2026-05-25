import { NextRequest, NextResponse } from 'next/server'
import { bookifyFetch } from '@/lib/bookify/api-client'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Tenant-Key',
  )
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, seatId, user } = body

    if (!classId || !seatId || !user) {
      return withCors(
        NextResponse.json(
          { error: 'Missing required fields: classId, seatId, user' },
          { status: 400 },
        ),
      )
    }

    if (!user.name || !user.email || !user.phone) {
      return withCors(
        NextResponse.json(
          { error: 'User must have name, email, and phone' },
          { status: 400 },
        ),
      )
    }

    const { data, ok, status } = await bookifyFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({ classId, seatId, user }),
    })

    if (!ok) {
      return withCors(
        NextResponse.json(
          {
            error:
              (data as { message?: string }).message ||
              (data as { error?: string }).error ||
              'Booking failed',
          },
          { status },
        ),
      )
    }

    const booking =
      (data as { booking?: unknown }).booking ??
      (data as { data?: unknown }).data ??
      {
        id: `booking-${Date.now()}`,
        classId,
        seatId,
        user,
        bookedAt: new Date().toISOString(),
        status: 'confirmed',
      }

    return withCors(
      NextResponse.json({
        success: true,
        booking,
        message: 'Class booked successfully!',
      }),
    )
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to process booking',
        },
        { status: 500 },
      ),
    )
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }))
}
