// Optional crash reporting. Enabled only when EXPO_PUBLIC_SENTRY_DSN is set
// at build time (create a free project at sentry.io, then export the env var
// before `npm run build:web`). With no DSN this is a no-op.
import { Platform } from 'react-native';

export function initMonitoring(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || Platform.OS !== 'web') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/browser') as typeof import('@sentry/browser');
    Sentry.init({
      dsn,
      release: 'thaiapp@1.0.0',
      // Learning app, no PII needed — keep payloads lean.
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
  } catch {
    // Sentry is best-effort; never let monitoring break the app.
  }
}
