import { NextResponse } from 'next/server'
import { getDepartmentsServer } from '@/lib/supabase/server-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const departments = await getDepartmentsServer()

    return NextResponse.json({
      data: departments,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const departments = await getDepartmentsServer()

    return NextResponse.json({
      data: departments,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
