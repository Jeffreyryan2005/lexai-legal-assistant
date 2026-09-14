/**
 * @fileoverview High-performance in-memory LRU cache with SHA-256 document hashing and TTL.
 * Prevents redundant LLM API calls and text extractions for duplicate or identical documents.
 * Dramatically improves response latency, server efficiency, and token cost.
 */

import { createHash } from "crypto";

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRatio: number;
}

export class EfficientCache<T = unknown> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private hitCount = 0;
  private missCount = 0;

  /**
   * @param maxEntries - Maximum number of cached items before LRU eviction (default: 200)
   * @param defaultTtlMs - Time-to-live in milliseconds (default: 1 hour)
   */
  constructor(maxEntries: number = 200, defaultTtlMs: number = 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic SHA-256 hash for a given buffer or string content.
   * Used as the cache key for documents and prompts.
   */
  static hash(content: Buffer | string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  /**
   * Retrieves an item from the cache.
   * If expired, removes it and returns null.
   * Updates LRU ordering on hit.
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }

    // Cache hit: bump stats and re-insert for LRU freshness
    entry.hits++;
    this.hitCount++;
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.data;
  }

  /**
   * Stores an item in the cache with LRU eviction and TTL.
   */
  set(key: string, data: T, ttlMs?: number): void {
    // Evict oldest item if at capacity (Map keys iteration gives insertion order)
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTtlMs);

    this.store.set(key, {
      data,
      createdAt: now,
      expiresAt,
      hits: 0,
    });
  }

  /**
   * Checks if a key exists and is unexpired without triggering an LRU re-order.
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Removes a specific key from cache.
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears the entire cache and resets counters.
   */
  clear(): void {
    this.store.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Returns cache health metrics for monitoring and evaluation.
   */
  getStats(): CacheStats {
    const total = this.hitCount + this.missCount;
    return {
      size: this.store.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRatio: total > 0 ? Number((this.hitCount / total).toFixed(4)) : 0,
    };
  }
}

/** Global cache singleton for document analysis results */
export const analysisCache = new EfficientCache<unknown>(150, 60 * 60 * 1000);

/** Global cache singleton for contract comparison results */
export const comparisonCache = new EfficientCache<unknown>(150, 60 * 60 * 1000);
