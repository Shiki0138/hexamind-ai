# Hardening Changes (No Feature/UX Impact)

Purpose: improve security and reliability without changing features or menus.

## 1) Env file handling
- Update `.gitignore` to ignore env files while keeping examples tracked:
  - Added rules to ignore `.env.local`, `.env.*` and keep `!.env.example`, `!.env.local.example`.
- Rationale: avoid accidental commits of secrets while preserving documentation examples.

## 2) Runtime env sanity logging (non-breaking)
- Added `src/lib/env-sanity.ts` to log warnings when important environment variables are missing.
- Behavior: logs warnings only; does not crash or change runtime behavior. Auto-runs on server import.
- Keys checked: `NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SENTRY_DSN`, `CLAUDE_API_KEY`, `GOOGLE_AI_API_KEY`.

## 3) Sentry dev-friendly warning
- `sentry.server.config.ts`: add explicit warning (dev only) when DSN is not set. No behavior change in production.

## 4) Stable React list keys
- `src/components/screens/ResultsScreen.tsx`: replace `key={index}` with stable keys derived from item content for `keyPoints` and `actionItems`.
- Rationale: prevent subtle re-render artifacts while keeping UI/logic identical.

## 5) Server-side rate limiting (in-memory)
- Added `src/lib/rate-limit.ts`: single-instance, fixed-window limiter set to 20 requests per 60 seconds per endpoint and identifier (userId or IP).
- Integrated into `src/app/api/ai/discussion/route.ts` without changing API shape; returns HTTP 429 with standard rate headers when exceeded.
- Designed for Stage A (<= ~5 users). Future migration path: swap storage to Redis/KV without touching API handler logic.

## 6) Reasoning quality templates (non-breaking)
- Added role/debate/output helpers:
  - `src/lib/agent-templates.ts` (Researcher, Finance, DTC Ops, Retail, Media, Legal, CMO)
  - `src/lib/debate-protocol.ts` (rounds + rubric, synthesis flow)
  - `src/lib/output-specs.ts` (preferred final sections)
  - `src/lib/research-hints.ts` (non-networked RAG hints)
- Updated `src/lib/ai-agents.ts` to expose `composeDebatePrompts()` helper for internal use. No changes to routes, UI, or API contracts.

## 7) Phase 2 hardening
- KV-ready rate limit store:
  - Added `src/lib/rate-limit-store.ts` with `MemoryRateLimitStore` and `RedisRateLimitStore` (placeholder interface).
  - Refactored `src/lib/rate-limit.ts` to use a pluggable store; auto-selects Redis when `RATE_LIMIT_REDIS_URL` is set.
- CSP enforcement:
  - Updated `vercel.json` to include a conservative `Content-Security-Policy`. Adjust `connect-src` if additional domains are needed (e.g., Stripe).
- Env schema warnings (prod):
  - Enhanced `src/lib/env-sanity.ts` to emit an extra production warning when required env vars are missing (non-breaking).

## Notes
- No changes to routes, APIs, configurations, or menus. All adjustments are internal quality improvements.
- Next steps (optional, separate PRs): server-side rate limiting, CSP header, stronger env validation with schema, provider typing.
