// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    
    // Debug
    debug: process.env.NODE_ENV === 'development',
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Server-side Error Filtering
    beforeSend(event, hint) {
      // Filter server-side errors
      const error = hint.originalException;
      
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        
        // Filter out common API rate limiting messages
        if (
          message.includes('rate limit') ||
          message.includes('too many requests') ||
          message.includes('quota exceeded')
        ) {
          // Still log but with lower priority
          event.level = 'info';
        }
        
        // Filter out OpenAI API errors that aren't our fault
        if (
          message.includes('openai api error') ||
          message.includes('anthropic api error')
        ) {
          // Keep these as warnings
          event.level = 'warning';
        }
      }
      
      return event;
    },
    
    // Server-side context
    initialScope: {
      tags: {
        component: 'server',
        feature: 'ai-board-meeting',
      },
      contexts: {
        runtime: {
          name: 'node',
          version: process.version,
        },
      },
    },
  });
} else if (process.env.NODE_ENV === 'development') {
  // Non-breaking: warn developers in local/dev only
  // eslint-disable-next-line no-console
  console.warn('Sentry DSN not found. Server-side error tracking will be disabled.');
}
