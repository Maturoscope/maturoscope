/**
 * Structured JSON logger for Loki/Grafana (public app).
 * Uses console so it works in Edge (middleware) and Node. One JSON object per line.
 */

const APP_NAME = 'app';

type LogLevel = 'error' | 'warn' | 'info';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: string;
  app: string;
  error?: { message: string; stack?: string };
  meta?: Record<string, string | number | boolean | undefined>;
}

function serializeError(err: unknown): LogPayload['error'] | undefined {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return err !== undefined ? { message: String(err) } : undefined;
}

export function createStructuredLogger(context: string) {
  return {
    error(message: string, error?: unknown, meta?: Record<string, string | number | boolean | undefined>): void {
      const payload: LogPayload = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        context,
        app: APP_NAME,
        ...(error !== undefined && { error: serializeError(error) }),
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      };
      console.error(JSON.stringify(payload));
    },
    warn(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
      const payload: LogPayload = {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        context,
        app: APP_NAME,
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      };
      console.warn(JSON.stringify(payload));
    },
    info(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
      const payload: LogPayload = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context,
        app: APP_NAME,
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      };
      console.log(JSON.stringify(payload));
    },
  };
}
