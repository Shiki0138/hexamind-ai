/**
 * Provider-specific rate limits configuration
 * Based on official documentation and real-world testing
 */

export interface ProviderRateLimit {
  rpm: number; // Requests per minute
  tpm: number; // Tokens per minute
  rpd: number; // Requests per day
  burstLimit?: number; // Max requests in a short burst
  minDelay: number; // Minimum delay between requests in ms
}

export const PROVIDER_RATE_LIMITS: Record<string, ProviderRateLimit> = {
  // Gemini models (Free tier)
  'gemini-2.0-flash-exp': {
    rpm: 15,
    tpm: 1_000_000,
    rpd: 1500,
    burstLimit: 2, // Conservative burst limit
    minDelay: 12000 // 12秒間隔（1分に5リクエスト = 安全マージン）
  },
  'gemini-2.0-flash': {
    rpm: 15,
    tpm: 1_000_000,
    rpd: 1500,
    burstLimit: 2,
    minDelay: 12000 // 12秒間隔（1分に5リクエスト = 安全マージン）
  },
  'gemini-1.5-flash': {
    rpm: 15,
    tpm: 1_000_000,
    rpd: 1500,
    burstLimit: 2,
    minDelay: 12000 // 12秒間隔（1分に5リクエスト = 安全マージン）
  },
  'gemini-1.5-pro': {
    rpm: 2, // Even more restrictive for Pro on free tier
    tpm: 32_000,
    rpd: 50,
    burstLimit: 1,
    minDelay: 31000 // 31 seconds between requests
  },
  
  // OpenAI models (API tier)
  'gpt-4o-mini': {
    rpm: 500,
    tpm: 200_000,
    rpd: 10_000,
    burstLimit: 10,
    minDelay: 200 // 0.2 seconds
  },
  'gpt-3.5-turbo': {
    rpm: 3500,
    tpm: 90_000,
    rpd: 200_000,
    burstLimit: 20,
    minDelay: 50
  },
  'gpt-4': {
    rpm: 500,
    tpm: 40_000,
    rpd: 10_000,
    burstLimit: 10,
    minDelay: 200
  },
  'gpt-4o': {
    rpm: 500,
    tpm: 30_000,
    rpd: 10_000,
    burstLimit: 10,
    minDelay: 200
  }
};

/**
 * Get rate limit configuration for a specific model
 */
export function getProviderRateLimit(model: string): ProviderRateLimit | null {
  return PROVIDER_RATE_LIMITS[model] || null;
}

/**
 * Calculate required delay between requests for a model
 */
export function calculateRequiredDelay(model: string): number {
  const limits = getProviderRateLimit(model);
  if (!limits) {
    // Default conservative delay
    return 2000;
  }
  
  // Use the configured minimum delay
  return limits.minDelay;
}

/**
 * Check if a model is rate-limited (has restrictive limits)
 */
export function isRateLimitedModel(model: string): boolean {
  const limits = getProviderRateLimit(model);
  return limits ? limits.rpm < 100 : false;
}