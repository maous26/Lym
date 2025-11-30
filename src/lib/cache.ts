/**
 * Simple in-memory cache with TTL (Time To Live)
 * Pour réduire les coûts des appels IA répétitifs
 */

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    
    /**
     * Get a cached value
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        
        // Check if expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data as T;
    }
    
    /**
     * Set a cached value with TTL in seconds
     */
    set<T>(key: string, data: T, ttlSeconds: number = 300): void {
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiry });
    }
    
    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }
    
    /**
     * Delete a specific key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }
    
    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }
    
    /**
     * Get or set pattern - returns cached value or calls factory function
     */
    async getOrSet<T>(
        key: string, 
        factory: () => Promise<T>, 
        ttlSeconds: number = 300
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            console.log(`📦 Cache HIT: ${key}`);
            return cached;
        }
        
        console.log(`🔄 Cache MISS: ${key}`);
        const data = await factory();
        this.set(key, data, ttlSeconds);
        return data;
    }
}

// Singleton instances for different cache purposes
export const recipeCache = new SimpleCache();
export const mlPreferencesCache = new SimpleCache();
export const searchCache = new SimpleCache();

// Main application cache (general purpose)
export const appCache = new SimpleCache();

// Cache key prefixes
export const CACHE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    RECIPE_SEARCH: 'recipe_search',
    ML_RECOMMENDATIONS: 'ml_recommendations',
    SHOPPING_LIST: 'shopping_list',
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    RECIPE_SEARCH: 60 * 5,      // 5 minutes for recipe searches
    ML_PREFERENCES: 60 * 15,    // 15 minutes for ML preferences  
    USER_PROFILE: 60 * 30,      // 30 minutes for user profile context
    SHOPPING_LIST: 60 * 60,     // 1 hour for shopping lists
};

/**
 * Generate a cache key from search parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${JSON.stringify(params[key])}`)
        .join('|');
    return `${prefix}:${sortedParams}`;
}
