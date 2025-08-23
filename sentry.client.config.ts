// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Release Health
    autoSessionTracking: true,
    
    // Debug
    debug: process.env.NODE_ENV === 'development',
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Error Filtering
    beforeSend(event, hint) {
      // Filter out common non-critical errors
      const error = hint.originalException;
      
      if (error && typeof error === 'object') {
        // Filter out network errors that aren't actionable
        if ('message' in error && typeof error.message === 'string') {
          const message = error.message.toLowerCase();
          if (
            message.includes('network error') ||
            message.includes('failed to fetch') ||
            message.includes('load failed') ||
            message.includes('non-error promise rejection')
          ) {
            return null; // Don't send to Sentry
          }
        }
        
        // Filter out bot traffic errors
        if ('name' in error && error.name === 'BotDetectorError') {
          return null;
        }
      }
      
      return event;
    },
    
    // Integrations
    integrations: [
      // Browser-specific integrations
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture replays on errors only in production
        maskAllText: process.env.NODE_ENV === 'production',
        blockAllMedia: process.env.NODE_ENV === 'production',
      }),
    ],
    
    // Session Replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Tags
    initialScope: {
      tags: {
        component: 'client',
        feature: 'ai-board-meeting',
      },
    },
  });
} else if (process.env.NODE_ENV === 'development') {
  console.warn('Sentry DSN not found. Error tracking will be disabled.');
}