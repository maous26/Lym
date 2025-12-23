import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy - only connects when used)
// Falls back gracefully if env vars not set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SUGGESTIONS: 60 * 60,           // 1 hour
  PRESET_RECIPES: 60 * 60 * 24,   // 24 hours
  COMMUNITY_TOP: 60 * 30,         // 30 minutes
  WEEKLY_PLAN: 60 * 60 * 24 * 7,  // 7 days
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  suggestions: (userId: string) => `suggestions:${userId}`,
  presetRecipes: (profile: string) => `recipes:preset:${profile}`,
  communityTop: () => 'recipes:community:top',
  weeklyPlan: (planId: string) => `weekly-plan:${planId}`,
} as const;

/**
 * Get cached data by key
 * Returns null if cache miss or Redis not configured
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('[Redis] Get error:', error);
    return null;
  }
}

/**
 * Set data in cache with TTL
 * Silently fails if Redis not configured
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = CACHE_TTL.SUGGESTIONS): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error('[Redis] Set error:', error);
    return false;
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('[Redis] Delete error:', error);
    return false;
  }
}

/**
 * Invalidate cache by pattern (use sparingly - expensive operation)
 * Pattern example: "suggestions:*" to clear all user suggestions
 */
export async function invalidateByPattern(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.error('[Redis] Invalidate pattern error:', error);
    return 0;
  }
}

/**
 * Check if Redis is configured and available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

/**
 * Helper to wrap a function with caching
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache (fire and forget)
  setCache(key, data, ttl);

  return data;
}
