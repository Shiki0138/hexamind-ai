export interface RateLimitStore {
  incr(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
  get(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

// In-memory implementation (default)
export class MemoryRateLimitStore implements RateLimitStore {
  private map = new Map<string, { count: number; resetAt: number }>();

  async incr(key: string, windowMs: number) {
    const now = Date.now();
    const bucketStart = Math.floor(now / windowMs) * windowMs;
    const resetAt = bucketStart + windowMs;
    const mapKey = `${key}:${bucketStart}`;
    const current = this.map.get(mapKey) || { count: 0, resetAt };
    current.count += 1;
    current.resetAt = resetAt;
    this.map.set(mapKey, current);
    return { count: current.count, resetAt };
  }
  
  async get(key: string, windowMs: number) {
    const now = Date.now();
    const bucketStart = Math.floor(now / windowMs) * windowMs;
    const resetAt = bucketStart + windowMs;
    const mapKey = `${key}:${bucketStart}`;
    const current = this.map.get(mapKey) || { count: 0, resetAt };
    return { count: current.count, resetAt };
  }
}

// Redis-compatible implementation (no network calls here; placeholder interface)
// When RATE_LIMIT_REDIS_URL is set in production, you can wire an actual Redis client.
export class RedisRateLimitStore implements RateLimitStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private redisUrl: string, private namespace = 'rate-limit') {}

  async incr(key: string, windowMs: number) {
    // Placeholder that behaves like memory for local dev without Redis.
    // Replace with real Redis logic (INCR + EXPIRE) when providing a client.
    if (!globalThis.__redisFallback) {
      // @ts-ignore
      globalThis.__redisFallback = new MemoryRateLimitStore();
    }
    // @ts-ignore
    return globalThis.__redisFallback.incr(`${this.namespace}:${key}`, windowMs);
  }
  
  async get(key: string, windowMs: number) {
    // Placeholder that behaves like memory for local dev without Redis.
    if (!globalThis.__redisFallback) {
      // @ts-ignore
      globalThis.__redisFallback = new MemoryRateLimitStore();
    }
    // @ts-ignore
    return globalThis.__redisFallback.get(`${this.namespace}:${key}`, windowMs);
  }
}

export function selectStore(): RateLimitStore {
  const url = process.env.RATE_LIMIT_REDIS_URL;
  const ns = process.env.RATE_LIMIT_NAMESPACE || 'ai';
  if (url) return new RedisRateLimitStore(url, ns);
  return new MemoryRateLimitStore();
}

