import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
let redis: Redis | null = null

export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      console.warn('Upstash Redis credentials not found. Caching will be disabled.')
      return null
    }

    redis = new Redis({
      url,
      token,
    })
  }

  return redis
}

// Cache configuration
export const CACHE_CONFIG = {
  DOCTORS_TTL: 300, // 5 minutes in seconds
  HOSPITALS_TTL: 3600, // 1 hour in seconds
  DEPARTMENTS_TTL: 3600, // 1 hour in seconds
}

// Cache key prefixes
export const CACHE_KEYS = {
  DOCTORS: 'doctors:all',
  HOSPITALS: 'hospitals:all',
  DEPARTMENTS: 'departments:all',
}

