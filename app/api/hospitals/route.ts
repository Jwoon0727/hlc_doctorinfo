import { NextResponse } from 'next/server'
import { getHospitalsServer } from '@/lib/supabase/server-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hospitals = await getHospitalsServer()

    return NextResponse.json({
      data: hospitals,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const hospitals = await getHospitalsServer()

    return NextResponse.json({
      data: hospitals,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    )
  }
}
