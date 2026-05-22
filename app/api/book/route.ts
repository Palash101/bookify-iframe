import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, seatId, user } = body
    
    if (!classId || !seatId || !user) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, seatId, user' },
        { status: 400 }
      )
    }
    
    if (!user.name || !user.email || !user.phone) {
      return NextResponse.json(
        { error: 'User must have name, email, and phone' },
        { status: 400 }
      )
    }
    
    // Simulate booking - in production, save to database
    const booking = {
      id: `booking-${Date.now()}`,
      classId,
      seatId,
      user,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    }
    
    const response = NextResponse.json({
      success: true,
      booking,
      message: 'Class booked successfully!'
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  } catch {
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
