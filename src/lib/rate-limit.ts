// In-memory rate limiter (single-instance). No external deps.
// Keyed by userId (if available) else IP, per-endpoint.
// Rule: 20 requests per 60s window.

import { selectStore } from './rate-limit-store';

type Identifier = string; // userId or ip

const WINDOW_MS = 60_000;
// Temporarily relax to 60/min to mitigate false positives; adjust later.
const LIMIT_PER_WINDOW = 60;
const store = selectStore();

function getClientIp(req: Request): string | undefined {
  try {
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const xrip = req.headers.get('x-real-ip');
    if (xrip) return xrip.trim();
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
  if (!id) {
    const ip = getClientIp(req);
    if (ip) {
      id = ip;
    } else {
      const ua = req.headers.get('user-agent') || 'ua';
      id = `anon:${ua.slice(0,32)}:${Math.floor(now / WINDOW_MS)}`;
    }
  }
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
