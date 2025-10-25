// src/utils/responseCache.ts

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CacheEntry {
  value: string;
  expires: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100; // Per FR-44a memory management

// ============================================
// CACHE STORAGE
// ============================================

const cache = new Map<string, CacheEntry>();
let hits = 0;
let misses = 0;

// ============================================
// KEY NORMALIZATION
// ============================================

/**
 * Normalize cache key (lowercase, trim whitespace)
 * @param key - Original key
 * @returns Normalized key
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

// ============================================
// CACHE OPERATIONS
// ============================================

/**
 * Get cached value
 * @param key - Cache key
 * @returns Cached value or null
 */
export function get(key: string): string | null {
  const normalizedKey = normalizeKey(key);
  const entry = cache.get(normalizedKey);

  if (!entry) {
    misses++;
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expires) {
    cache.delete(normalizedKey);
    misses++;
    return null;
  }

  // Update last accessed time
  entry.lastAccessed = Date.now();

  hits++;
  return entry.value;
}

/**
 * Set cached value
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in milliseconds (default 24 hours)
 */
export function set(key: string, value: string, ttl: number = DEFAULT_TTL): void {
  const normalizedKey = normalizeKey(key);

  // Check cache size limit
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(normalizedKey)) {
    evictLRU();
  }

  const entry: CacheEntry = {
    value,
    expires: Date.now() + ttl,
    lastAccessed: Date.now(),
  };

  cache.set(normalizedKey, entry);
}

/**
 * Check if key exists in cache
 * @param key - Cache key
 * @returns True if key exists and not expired
 */
export function has(key: string): boolean {
  return get(key) !== null;
}

/**
 * Clear all cached values
 */
export function clear(): void {
  cache.clear();
  hits = 0;
  misses = 0;
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get cache statistics
 * @returns Stats object
 */
export function getStats(): CacheStats {
  return {
    hits,
    misses,
    size: cache.size,
  };
}

/**
 * Get cache hit rate
 * @returns Hit rate (0.0 to 1.0)
 */
export function getHitRate(): number {
  const total = hits + misses;

  if (total === 0) {
    return 0;
  }

  return hits / total;
}

// ============================================
// MEMORY MANAGEMENT
// ============================================

/**
 * Evict least recently used entry
 */
function evictLRU(): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  cache.forEach((entry, key) => {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  });

  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

/**
 * Clean up expired entries
 * Run this periodically to free memory
 */
export function cleanupExpired(): void {
  const now = Date.now();

  cache.forEach((entry, key) => {
    if (now > entry.expires) {
      cache.delete(key);
    }
  });
}

// ============================================
// PERIODIC CLEANUP
// ============================================

// Run cleanup every hour
setInterval(cleanupExpired, 60 * 60 * 1000);
