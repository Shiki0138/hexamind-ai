// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring (lower for edge functions)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    
    // Debug
    debug: process.env.NODE_ENV === 'development',
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Edge-specific context
    initialScope: {
      tags: {
        component: 'edge',
        feature: 'ai-board-meeting',
        runtime: 'edge',
      },
    },
  });
}