/**
 * @fileoverview Unit tests for EfficientCache (lib/cache.ts).
 * Validates SHA-256 deterministic hashing, get/set operations,
 * TTL expiration, LRU capacity eviction, and hit/miss telemetry.
 */

import { EfficientCache } from "../../lib/cache";

describe("EfficientCache", () => {
  let cache: EfficientCache<string>;

  beforeEach(() => {
    // 3 items max, 1000ms TTL for testing
    cache = new EfficientCache<string>(3, 1000);
  });

  describe("deterministic hashing", () => {
    it("should produce the same SHA-256 hash for identical string inputs", () => {
      const hash1 = EfficientCache.hash("Hello Legal Document");
      const hash2 = EfficientCache.hash("Hello Legal Document");
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it("should produce the same SHA-256 hash for identical Buffer inputs", () => {
      const buf1 = Buffer.from([1, 2, 3, 4, 5]);
      const buf2 = Buffer.from([1, 2, 3, 4, 5]);
      expect(EfficientCache.hash(buf1)).toBe(EfficientCache.hash(buf2));
    });

    it("should produce different hashes for different inputs", () => {
      const hashA = EfficientCache.hash("Contract A");
      const hashB = EfficientCache.hash("Contract B");
      expect(hashA).not.toBe(hashB);
    });
  });

  describe("get and set operations", () => {
    it("should return null for non-existent key (cache miss)", () => {
      expect(cache.get("non-existent")).toBeNull();
      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
    });

    it("should store and retrieve data correctly (cache hit)", () => {
      cache.set("key1", "analysis result 1");
      expect(cache.get("key1")).toBe("analysis result 1");
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
      expect(stats.hitRatio).toBe(1);
    });

    it("should confirm existence with has()", () => {
      cache.set("keyA", "dataA");
      expect(cache.has("keyA")).toBe(true);
      expect(cache.has("keyB")).toBe(false);
    });

    it("should delete keys successfully", () => {
      cache.set("key1", "data1");
      expect(cache.delete("key1")).toBe(true);
      expect(cache.get("key1")).toBeNull();
      expect(cache.delete("key1")).toBe(false);
    });

    it("should clear the entire cache and reset stats", () => {
      cache.set("k1", "v1");
      cache.set("k2", "v2");
      cache.get("k1"); // 1 hit
      cache.clear();

      expect(cache.get("k1")).toBeNull();
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1); // from get("k1") after clear
    });
  });

  describe("LRU eviction", () => {
    it("should evict the oldest unaccessed item when capacity is exceeded", () => {
      cache.set("k1", "v1");
      cache.set("k2", "v2");
      cache.set("k3", "v3");

      // Now at capacity (3). Adding k4 must evict k1 (oldest)
      cache.set("k4", "v4");

      expect(cache.get("k1")).toBeNull(); // evicted
      expect(cache.get("k2")).toBe("v2");
      expect(cache.get("k3")).toBe("v3");
      expect(cache.get("k4")).toBe("v4");
    });

    it("should refresh LRU order on get() access", () => {
      cache.set("k1", "v1");
      cache.set("k2", "v2");
      cache.set("k3", "v3");

      // Access k1 so it becomes freshest, making k2 the oldest
      cache.get("k1");

      // Adding k4 should now evict k2, NOT k1
      cache.set("k4", "v4");

      expect(cache.get("k1")).toBe("v1"); // preserved
      expect(cache.get("k2")).toBeNull(); // evicted!
      expect(cache.get("k3")).toBe("v3");
      expect(cache.get("k4")).toBe("v4");
    });
  });

  describe("TTL expiration", () => {
    it("should expire items after custom TTL", async () => {
      // 50ms TTL
      cache.set("temp", "volatile data", 50);
      expect(cache.get("temp")).toBe("volatile data");

      // Wait 70ms for expiration
      await new Promise((r) => setTimeout(r, 70));

      expect(cache.get("temp")).toBeNull();
      expect(cache.has("temp")).toBe(false);
    });
  });

  describe("telemetry and stats", () => {
    it("should accurately track hit ratio", () => {
      cache.set("a", "1");
      cache.get("a"); // hit
      cache.get("a"); // hit
      cache.get("b"); // miss
      cache.get("b"); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRatio).toBe(0.5);
    });
  });
});
