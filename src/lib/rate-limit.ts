// In-memory rate limiter (single-instance). No external deps.
// Keyed by userId (if available) else IP, per-endpoint.
// Rule: 20 requests per 60s window.

import { selectStore } from './rate-limit-store';

type Identifier = string; // userId or ip

const WINDOW_MS = 60_000;
const LIMIT_PER_WINDOW = 1000; // 200→1000に大幅緩和（サーバーレス環境対応）
const store = selectStore();

function getClientIp(req: Request): string | undefined {
  try {
    const hdr = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    if (hdr) return hdr.split(',')[0].trim();
  } catch {}
  return undefined;
}

export type RateLimitContext = {
  endpoint: string;
  identifier?: string; // prefer userId if known
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number; // ms until reset
  limit: number;
};

export async function checkRate(req: Request, ctx: RateLimitContext): Promise<RateLimitResult> {
  const now = Date.now();
  let id: Identifier | undefined = ctx.identifier;
  if (!id) id = getClientIp(req) || 'anonymous';
  const key = `${ctx.endpoint}:${id}`;
  const { count, resetAt } = await store.incr(key, WINDOW_MS);
  const allowed = count <= LIMIT_PER_WINDOW;
  const remaining = Math.max(0, LIMIT_PER_WINDOW - count);
  const reset = Math.max(0, resetAt - now);
  return { allowed, remaining, reset, limit: LIMIT_PER_WINDOW };
}

export function buildRateHeaders(res: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(res.limit),
    'X-RateLimit-Remaining': String(res.remaining),
    'X-RateLimit-Reset': String(Math.ceil(res.reset / 1000)),
    ...(res.allowed ? {} : { 'Retry-After': String(Math.ceil(res.reset / 1000)) }),
  };
}

export async function enforceRateLimit(req: Request, ctx: RateLimitContext) {
  // デバッグ: 環境変数の状態を確認
  console.log('[Rate Limit] 環境変数チェック:', {
    NODE_ENV: process.env.NODE_ENV,
    DISABLE_RATE_LIMIT: process.env.DISABLE_RATE_LIMIT,
    isDisabled: process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true'
  });
  
  // 開発中はレート制限をスキップ
  if (process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return null;
  }
  
  const res = await checkRate(req, ctx);
  if (!res.allowed) {
    return new Response(
      JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Please try again shortly.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...buildRateHeaders(res) } }
    );
  }
  return null;
}
