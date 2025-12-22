import { NextResponse } from 'next/server'
import { getDoctorsServer } from '@/lib/supabase/server-actions'
import { getRedis, CACHE_CONFIG, CACHE_KEYS } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const redis = getRedis()

    // Try to get from cache first
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEYS.DOCTORS)
        if (cached) {
          console.log('Cache hit for doctors')
          return NextResponse.json({
            data: cached,
            cached: true,
            timestamp: Date.now(),
          })
        }
      } catch (cacheError) {
        console.warn('Cache read error:', cacheError)
      }
    }

    // Cache miss or Redis unavailable, fetch from Supabase
    console.log('Cache miss for doctors, fetching from Supabase')
    const doctors = await getDoctorsServer()

    // Store in cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.DOCTORS, doctors, {
          ex: CACHE_CONFIG.DOCTORS_TTL,
        })
        console.log('Doctors cached successfully')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: doctors,
      cached: false,
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

// Endpoint to refresh cache
export async function POST() {
  try {
    const redis = getRedis()
    
    // Fetch fresh data from Supabase
    const doctors = await getDoctorsServer()

    // Update cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.DOCTORS, doctors, {
          ex: CACHE_CONFIG.DOCTORS_TTL,
        })
        console.log('Doctors cache refreshed')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: doctors,
      refreshed: true,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error refreshing doctors cache:', error)
    return NextResponse.json(
      { error: 'Failed to refresh doctors cache' },
      { status: 500 }
    )
  }
}

