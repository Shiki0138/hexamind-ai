/**
 * Gemini-specific rate limiter
 * Ensures compliance with Gemini's strict rate limits
 */

interface RateLimitBucket {
  count: number;
  windowStart: number;
  dailyCount: number;
  dailyWindowStart: number;
}

class GeminiRateLimiter {
  private buckets: Map<string, RateLimitBucket> = new Map();
  
  // Rate limits for different Gemini models (free tier)
  private readonly limits = {
    'gemini-2.0-flash-exp': { rpm: 15, rpd: 1500 },
    'gemini-2.0-flash': { rpm: 15, rpd: 1500 },
    'gemini-1.5-flash': { rpm: 15, rpd: 1500 },
    'gemini-1.5-pro': { rpm: 2, rpd: 50 },
  };
  
  /**
   * Check if a request is allowed under rate limits
   */
  async checkLimit(model: string): Promise<{ allowed: boolean; waitTime?: number }> {
    const now = Date.now();
    const limits = this.limits[model] || this.limits['gemini-2.0-flash'];
    const bucket = this.getBucket(model, now);
    
    // Check minute limit
    const minuteWindowElapsed = now - bucket.windowStart;
    if (minuteWindowElapsed >= 60000) {
      // Reset minute window
      bucket.count = 0;
      bucket.windowStart = now;
    }
    
    // Check daily limit
    const dailyWindowElapsed = now - bucket.dailyWindowStart;
    if (dailyWindowElapsed >= 86400000) { // 24 hours
      // Reset daily window
      bucket.dailyCount = 0;
      bucket.dailyWindowStart = now;
    }
    
    // Check if we're within limits
    if (bucket.count >= limits.rpm) {
      const waitTime = 60000 - minuteWindowElapsed;
      return { allowed: false, waitTime: Math.ceil(waitTime / 1000) };
    }
    
    if (bucket.dailyCount >= limits.rpd) {
      const waitTime = 86400000 - dailyWindowElapsed;
      return { allowed: false, waitTime: Math.ceil(waitTime / 1000) };
    }
    
    return { allowed: true };
  }
  
  /**
   * Record a request
   */
  recordRequest(model: string): void {
    const now = Date.now();
    const bucket = this.getBucket(model, now);
    bucket.count++;
    bucket.dailyCount++;
  }
  
  private getBucket(model: string, now: number): RateLimitBucket {
    if (!this.buckets.has(model)) {
      this.buckets.set(model, {
        count: 0,
        windowStart: now,
        dailyCount: 0,
        dailyWindowStart: now,
      });
    }
    return this.buckets.get(model)!;
  }
  
  /**
   * Get current usage stats
   */
  getUsageStats(model: string): { minuteUsage: number; dailyUsage: number; limits: any } {
    const bucket = this.buckets.get(model);
    const modelLimits = this.limits[model] || this.limits['gemini-2.0-flash'];
    
    return {
      minuteUsage: bucket?.count || 0,
      dailyUsage: bucket?.dailyCount || 0,
      limits: modelLimits,
    };
  }
}

// Singleton instance
export const geminiRateLimiter = new GeminiRateLimiter();

/**
 * Wrapper function to enforce Gemini rate limits
 */
export async function withGeminiRateLimit<T>(
  model: string,
  operation: () => Promise<T>
): Promise<T> {
  const check = await geminiRateLimiter.checkLimit(model);
  
  if (!check.allowed) {
    throw new Error(
      `Gemini rate limit exceeded. Please wait ${check.waitTime} seconds before trying again. ` +
      `Current usage: ${JSON.stringify(geminiRateLimiter.getUsageStats(model))}`
    );
  }
  
  try {
    const result = await operation();
    geminiRateLimiter.recordRequest(model);
    return result;
  } catch (error) {
    // Don't count failed requests against the limit
    throw error;
  }
}