import { NextResponse } from 'next/server'
import { getHospitalsServer } from '@/lib/supabase/server-actions'
import { getRedis, CACHE_CONFIG, CACHE_KEYS } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const redis = getRedis()

    // Try to get from cache first
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEYS.HOSPITALS)
        if (cached) {
          console.log('Cache hit for hospitals')
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
    console.log('Cache miss for hospitals, fetching from Supabase')
    const hospitals = await getHospitalsServer()

    // Store in cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.HOSPITALS, hospitals, {
          ex: CACHE_CONFIG.HOSPITALS_TTL,
        })
        console.log('Hospitals cached successfully')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: hospitals,
      cached: false,
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

// Endpoint to refresh cache
export async function POST() {
  try {
    const redis = getRedis()
    
    // Fetch fresh data from Supabase
    const hospitals = await getHospitalsServer()

    // Update cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.HOSPITALS, hospitals, {
          ex: CACHE_CONFIG.HOSPITALS_TTL,
        })
        console.log('Hospitals cache refreshed')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: hospitals,
      refreshed: true,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error refreshing hospitals cache:', error)
    return NextResponse.json(
      { error: 'Failed to refresh hospitals cache' },
      { status: 500 }
    )
  }
}

