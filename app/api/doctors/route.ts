import { NextResponse } from 'next/server'
import { getDoctorsServer } from '@/lib/supabase/server-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const doctors = await getDoctorsServer()

    return NextResponse.json({
      data: doctors,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const doctors = await getDoctorsServer()

    return NextResponse.json({
      data: doctors,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}
