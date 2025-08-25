// In-memory rate limiter (single-instance). No external deps.
// Keyed by userId (if available) else IP, per-endpoint.
// Rule: 20 requests per 60s window.

type Identifier = string; // userId or ip

type Counter = {
  windowStartMs: number;
  count: number;
};

const WINDOW_MS = 60_000;
const LIMIT_PER_WINDOW = 20;

// Map key: `${endpoint}:${identifier}:${windowStartMs}`
const counters = new Map<string, Counter>();

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

export function checkRate(req: Request, ctx: RateLimitContext): RateLimitResult {
  const now = Date.now();
  const windowStartMs = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const reset = windowStartMs + WINDOW_MS - now;

  let id: Identifier | undefined = ctx.identifier;
  if (!id) id = getClientIp(req) || 'anonymous';

  const key = `${ctx.endpoint}:${id}:${windowStartMs}`;
  const current = counters.get(key) || { windowStartMs, count: 0 };
  current.count += 1;
  counters.set(key, current);

  const allowed = current.count <= LIMIT_PER_WINDOW;
  const remaining = Math.max(0, LIMIT_PER_WINDOW - current.count);

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
  const res = checkRate(req, ctx);
  if (!res.allowed) {
    return new Response(
      JSON.stringify({ error: 'rate_limited', message: 'Too many requests. Please try again shortly.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...buildRateHeaders(res) } }
    );
  }
  return null;
}

