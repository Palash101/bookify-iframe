import { NextRequest, NextResponse } from 'next/server'

// Mock data - replace with your actual database
const generateClasses = (date: string) => {
  const classes = [
    {
      id: `yoga-${date}`,
      name: 'Morning Yoga',
      instructor: 'Sarah Johnson',
      time: '07:00 AM',
      duration: '60 min',
      capacity: 20,
      enrolled: 12,
      category: 'yoga',
      description: 'Start your day with a peaceful yoga session focusing on flexibility and mindfulness.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'
    },
    {
      id: `hiit-${date}`,
      name: 'HIIT Cardio Blast',
      instructor: 'Mike Thompson',
      time: '09:00 AM',
      duration: '45 min',
      capacity: 25,
      enrolled: 20,
      category: 'cardio',
      description: 'High-intensity interval training to burn calories and boost your metabolism.',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop'
    },
    {
      id: `spin-${date}`,
      name: 'Spin Class',
      instructor: 'Emma Davis',
      time: '11:00 AM',
      duration: '50 min',
      capacity: 30,
      enrolled: 28,
      category: 'cardio',
      description: 'High-energy indoor cycling session with motivating music and challenging intervals.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
    },
    {
      id: `strength-${date}`,
      name: 'Strength Training',
      instructor: 'John Martinez',
      time: '02:00 PM',
      duration: '60 min',
      capacity: 15,
      enrolled: 8,
      category: 'strength',
      description: 'Build muscle and improve strength with guided weight training exercises.',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'
    },
    {
      id: `pilates-${date}`,
      name: 'Pilates Core',
      instructor: 'Lisa Chen',
      time: '04:00 PM',
      duration: '55 min',
      capacity: 18,
      enrolled: 15,
      category: 'pilates',
      description: 'Strengthen your core and improve posture with controlled Pilates movements.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop'
    },
    {
      id: `boxing-${date}`,
      name: 'Boxing Fitness',
      instructor: 'Alex Rivera',
      time: '06:00 PM',
      duration: '45 min',
      capacity: 20,
      enrolled: 18,
      category: 'boxing',
      description: 'Learn boxing techniques while getting an amazing full-body workout.',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop'
    }
  ]
  
  return classes
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  
  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
  }
  
  const classes = generateClasses(date)
  
  // Add CORS headers for iframe embedding
  const response = NextResponse.json({ classes, date })
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
