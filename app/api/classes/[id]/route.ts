import { NextRequest, NextResponse } from 'next/server'

// Mock seat layout generation
const generateSeatLayout = (classId: string, capacity: number) => {
  const rows = Math.ceil(capacity / 5)
  const seats = []
  
  // Use classId hash to generate consistent "booked" seats
  const bookedSeats = new Set<string>()
  const hashCode = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  for (let i = 0; i < Math.floor(capacity * 0.4); i++) {
    const seatNum = ((hashCode * (i + 1)) % capacity) + 1
    bookedSeats.add(`seat-${seatNum}`)
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 5; col++) {
      const seatNumber = row * 5 + col + 1
      if (seatNumber <= capacity) {
        const seatId = `seat-${seatNumber}`
        seats.push({
          id: seatId,
          row: row + 1,
          column: col + 1,
          label: `${String.fromCharCode(65 + row)}${col + 1}`,
          status: bookedSeats.has(seatId) ? 'booked' : 'available'
        })
      }
    }
  }
  
  return seats
}

const classDetails: Record<string, {
  name: string
  instructor: string
  time: string
  duration: string
  capacity: number
  enrolled: number
  category: string
  description: string
  image: string
  equipment: string[]
  level: string
  benefits: string[]
}> = {
  'yoga': {
    name: 'Morning Yoga',
    instructor: 'Sarah Johnson',
    time: '07:00 AM',
    duration: '60 min',
    capacity: 20,
    enrolled: 12,
    category: 'yoga',
    description: 'Start your day with a peaceful yoga session focusing on flexibility and mindfulness. Perfect for all skill levels.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    equipment: ['Yoga Mat', 'Block', 'Strap'],
    level: 'All Levels',
    benefits: ['Improved Flexibility', 'Stress Relief', 'Better Posture']
  },
  'hiit': {
    name: 'HIIT Cardio Blast',
    instructor: 'Mike Thompson',
    time: '09:00 AM',
    duration: '45 min',
    capacity: 25,
    enrolled: 20,
    category: 'cardio',
    description: 'High-intensity interval training to burn calories and boost your metabolism. Get ready to sweat!',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
    equipment: ['Dumbbells', 'Jump Rope', 'Mat'],
    level: 'Intermediate',
    benefits: ['Fat Burning', 'Endurance', 'Metabolic Boost']
  },
  'spin': {
    name: 'Spin Class',
    instructor: 'Emma Davis',
    time: '11:00 AM',
    duration: '50 min',
    capacity: 30,
    enrolled: 28,
    category: 'cardio',
    description: 'High-energy indoor cycling session with motivating music and challenging intervals.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    equipment: ['Spin Bike', 'Towel', 'Water Bottle'],
    level: 'All Levels',
    benefits: ['Cardiovascular Health', 'Leg Strength', 'Calorie Burn']
  },
  'strength': {
    name: 'Strength Training',
    instructor: 'John Martinez',
    time: '02:00 PM',
    duration: '60 min',
    capacity: 15,
    enrolled: 8,
    category: 'strength',
    description: 'Build muscle and improve strength with guided weight training exercises.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop',
    equipment: ['Barbells', 'Dumbbells', 'Resistance Bands'],
    level: 'Intermediate',
    benefits: ['Muscle Growth', 'Bone Density', 'Metabolism Boost']
  },
  'pilates': {
    name: 'Pilates Core',
    instructor: 'Lisa Chen',
    time: '04:00 PM',
    duration: '55 min',
    capacity: 18,
    enrolled: 15,
    category: 'pilates',
    description: 'Strengthen your core and improve posture with controlled Pilates movements.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    equipment: ['Pilates Mat', 'Pilates Ring', 'Resistance Band'],
    level: 'Beginner',
    benefits: ['Core Strength', 'Flexibility', 'Balance']
  },
  'boxing': {
    name: 'Boxing Fitness',
    instructor: 'Alex Rivera',
    time: '06:00 PM',
    duration: '45 min',
    capacity: 20,
    enrolled: 18,
    category: 'boxing',
    description: 'Learn boxing techniques while getting an amazing full-body workout.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop',
    equipment: ['Boxing Gloves', 'Hand Wraps', 'Punching Bag'],
    level: 'All Levels',
    benefits: ['Full Body Workout', 'Self Defense', 'Stress Relief']
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Extract class type from id (e.g., "yoga-2024-01-15" -> "yoga")
  const classType = id.split('-')[0]
  const details = classDetails[classType]
  
  if (!details) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }
  
  const seats = generateSeatLayout(id, details.capacity)
  
  const response = NextResponse.json({
    id,
    ...details,
    seats
  })
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
