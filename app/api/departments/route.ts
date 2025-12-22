import { NextResponse } from 'next/server'
import { getDepartmentsServer } from '@/lib/supabase/server-actions'
import { getRedis, CACHE_CONFIG, CACHE_KEYS } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const redis = getRedis()

    // Try to get from cache first
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEYS.DEPARTMENTS)
        if (cached) {
          console.log('Cache hit for departments')
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
    console.log('Cache miss for departments, fetching from Supabase')
    const departments = await getDepartmentsServer()

    // Store in cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.DEPARTMENTS, departments, {
          ex: CACHE_CONFIG.DEPARTMENTS_TTL,
        })
        console.log('Departments cached successfully')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: departments,
      cached: false,
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

// Endpoint to refresh cache
export async function POST() {
  try {
    const redis = getRedis()
    
    // Fetch fresh data from Supabase
    const departments = await getDepartmentsServer()

    // Update cache
    if (redis) {
      try {
        await redis.set(CACHE_KEYS.DEPARTMENTS, departments, {
          ex: CACHE_CONFIG.DEPARTMENTS_TTL,
        })
        console.log('Departments cache refreshed')
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError)
      }
    }

    return NextResponse.json({
      data: departments,
      refreshed: true,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Error refreshing departments cache:', error)
    return NextResponse.json(
      { error: 'Failed to refresh departments cache' },
      { status: 500 }
    )
  }
}

