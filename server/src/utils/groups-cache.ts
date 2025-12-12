/**
 * Groups Cache Utility
 * 
 * Provides caching functionality for Groups API to improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class GroupsCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const groupsCache = new GroupsCache();

/**
 * Cache key generators
 */
export const CacheKeys = {
  groupInfo: (groupId: string) => `group:info:${groupId}`,
  groupList: (phoneNumberId: string) => `group:list:${phoneNumberId}`,
  groupParticipants: (groupId: string) => `group:participants:${groupId}`,
  groupJoinRequests: (groupId: string) => `group:joinrequests:${groupId}`,
  inviteLink: (groupId: string) => `group:invitelink:${groupId}`,
};

/**
 * Cache invalidation helpers
 */
export const CacheInvalidation = {
  /**
   * Invalidate all cache for a specific group
   */
  invalidateGroup: (groupId: string) => {
    groupsCache.delete(CacheKeys.groupInfo(groupId));
    groupsCache.delete(CacheKeys.groupParticipants(groupId));
    groupsCache.delete(CacheKeys.groupJoinRequests(groupId));
    groupsCache.delete(CacheKeys.inviteLink(groupId));
  },

  /**
   * Invalidate group list cache for a phone number
   */
  invalidateGroupList: (phoneNumberId: string) => {
    groupsCache.delete(CacheKeys.groupList(phoneNumberId));
  },

  /**
   * Invalidate all group-related cache for a phone number
   */
  invalidatePhoneNumber: (phoneNumberId: string) => {
    groupsCache.invalidatePattern(`group:.*:${phoneNumberId}`);
  },

  /**
   * Invalidate all cache
   */
  invalidateAll: () => {
    groupsCache.clear();
  },
};

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = groupsCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  groupsCache.set(key, data, ttl);

  return data;
}

/**
 * Batch cache operations
 */
export class BatchCache {
  private operations: Array<() => void> = [];

  /**
   * Add set operation to batch
   */
  set<T>(key: string, data: T, ttl?: number): this {
    this.operations.push(() => groupsCache.set(key, data, ttl));
    return this;
  }

  /**
   * Add delete operation to batch
   */
  delete(key: string): this {
    this.operations.push(() => groupsCache.delete(key));
    return this;
  }

  /**
   * Execute all batched operations
   */
  execute(): void {
    for (const operation of this.operations) {
      operation();
    }
    this.operations = [];
  }
}

/**
 * Cache middleware for Express
 */
export function cacheMiddleware(keyGenerator: (req: any) => string, ttl?: number) {
  return async (req: any, res: any, next: any) => {
    const key = keyGenerator(req);
    const cached = groupsCache.get(key);

    if (cached !== null) {
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data: any) => {
      groupsCache.set(key, data, ttl);
      return originalJson(data);
    };

    next();
  };
}
