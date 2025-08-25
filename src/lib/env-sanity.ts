// Lightweight runtime env sanity logger (non-breaking)
// Does not change behavior; only warns in console if important envs are missing.

type EnvKey = {
  name: string;
  requiredInProd: boolean;
};

const KEYS: EnvKey[] = [
  { name: 'NEXTAUTH_SECRET', requiredInProd: true },
  { name: 'OPENAI_API_KEY', requiredInProd: true },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', requiredInProd: false },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', requiredInProd: false },
  { name: 'SENTRY_DSN', requiredInProd: false },
  { name: 'CLAUDE_API_KEY', requiredInProd: false },
  { name: 'GOOGLE_AI_API_KEY', requiredInProd: false },
];

export function logEnvSanity() {
  const isProd = process.env.NODE_ENV === 'production';
  try {
    const missing: string[] = [];
    for (const k of KEYS) {
      const v = process.env[k.name];
      if (!v && (!isProd || (isProd && k.requiredInProd))) {
        missing.push(k.name);
      }
    }
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn(
        '[env] Missing environment variables:',
        missing.join(', '),
        `| NODE_ENV=${process.env.NODE_ENV}`
      );
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[env] sanity check failed:', e);
  }
}

// Optionally auto-run when imported from server contexts
if (typeof window === 'undefined') {
  logEnvSanity();
}

