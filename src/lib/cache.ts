import "server-only";
import Redis from "ioredis";
import { LRUCache } from "lru-cache";

// ============================================================
// Redis Client (L3 Cache)
// ============================================================

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || "redis://localhost:6379";

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected successfully");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ============================================================
// In-Memory LRU Cache (L2 Cache)
// ============================================================

const globalForLRU = globalThis as unknown as {
  lruCache: LRUCache<string, any> | undefined;
};

export const lruCache =
  globalForLRU.lruCache ??
  new LRUCache<string, any>({
    max: 10_000, // Max 10K entries
    ttl: 1000 * 60 * 5, // Default 5 minutes
    allowStale: true, // Return stale data while refreshing
    updateAgeOnGet: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForLRU.lruCache = lruCache;
}

// ============================================================
// Unified Cache Interface
// ============================================================

export interface CacheOptions {
  /** Time-to-live in seconds */
  ttl?: number;
  /** Cache namespace/prefix */
  prefix?: string;
  /** Whether to use L2 (in-memory) cache */
  useMemory?: boolean;
  /** Whether to use L3 (Redis) cache */
  useRedis?: boolean;
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  ttl: 300, // 5 minutes
  prefix: "gsr",
  useMemory: true,
  useRedis: true,
};

function buildKey(prefix: string, key: string): string {
  return `${prefix}:${key}`;
}

/**
 * Get a value from cache, checking L2 (memory) first, then L3 (Redis).
 */
export async function cacheGet<T>(
  key: string,
  options?: CacheOptions
): Promise<T | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullKey = buildKey(opts.prefix, key);

  // L2: In-memory check
  if (opts.useMemory) {
    const memoryValue = lruCache.get(fullKey);
    if (memoryValue !== undefined) {
      return memoryValue as T;
    }
  }

  // L3: Redis check
  if (opts.useRedis) {
    try {
      const redisValue = await redis.get(fullKey);
      if (redisValue !== null) {
        const parsed = JSON.parse(redisValue) as T;

        // Backfill L2
        if (opts.useMemory) {
          lruCache.set(fullKey, parsed, { ttl: opts.ttl * 1000 });
        }

        return parsed;
      }
    } catch (err) {
      console.error("[Cache] Redis get error:", err);
    }
  }

  return null;
}

/**
 * Set a value in cache (both L2 and L3).
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullKey = buildKey(opts.prefix, key);

  // L2: In-memory
  if (opts.useMemory) {
    lruCache.set(fullKey, value, { ttl: opts.ttl * 1000 });
  }

  // L3: Redis
  if (opts.useRedis) {
    try {
      await redis.setex(fullKey, opts.ttl, JSON.stringify(value));
    } catch (err) {
      console.error("[Cache] Redis set error:", err);
    }
  }
}

/**
 * Delete a value from all cache layers.
 */
export async function cacheDel(
  key: string,
  options?: CacheOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullKey = buildKey(opts.prefix, key);

  if (opts.useMemory) {
    lruCache.delete(fullKey);
  }

  if (opts.useRedis) {
    try {
      await redis.del(fullKey);
    } catch (err) {
      console.error("[Cache] Redis del error:", err);
    }
  }
}

/**
 * Invalidate all keys matching a pattern (Redis only).
 * Use sparingly — SCAN can be slow on large datasets.
 */
export async function cacheInvalidatePattern(
  pattern: string,
  options?: CacheOptions
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullPattern = buildKey(opts.prefix, pattern);

  try {
    const stream = redis.scanStream({ match: fullPattern, count: 100 });
    const pipeline = redis.pipeline();
    let count = 0;

    for await (const keys of stream) {
      for (const key of keys as string[]) {
        pipeline.del(key);
        // Also remove from L2
        lruCache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      await pipeline.exec();
    }
  } catch (err) {
    console.error("[Cache] Pattern invalidation error:", err);
  }
}

/**
 * Cache-aside pattern: get from cache, or compute + store.
 * This is the primary function to use for cached data fetching.
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cached = await cacheGet<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await cacheSet(key, value, options);
  return value;
}

// ============================================================
// Request Deduplication (Singleflight Pattern)
// ============================================================

const inflightRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicates concurrent requests for the same key.
 * If a request is already in flight, returns the same promise.
 */
export async function singleflight<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}
