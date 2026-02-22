/**
 * Structured JSON logger for Loki/Grafana (dashboard app).
 * Use for API routes: errors (always) and key success events only.
 */

const APP_NAME = 'dashboard';

type LogLevel = 'error' | 'warn' | 'info';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: string;
  app: string;
  error?: { message: string; stack?: string; code?: string };
  meta?: Record<string, string | number | boolean | undefined>;
}

function write(payload: LogPayload): void {
  const line = JSON.stringify(payload) + '\n';
  if (payload.level === 'error') {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

function serializeError(err: unknown): LogPayload['error'] | undefined {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      code: (err as { code?: string }).code,
    };
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return { message: String((err as { message: unknown }).message) };
  }
  return err !== undefined ? { message: String(err) } : undefined;
}

export function createStructuredLogger(context: string) {
  return {
    error(message: string, error?: unknown, meta?: Record<string, string | number | boolean | undefined>): void {
      write({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        context,
        app: APP_NAME,
        ...(error !== undefined && { error: serializeError(error) }),
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      });
    },
    warn(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
      write({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        context,
        app: APP_NAME,
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      });
    },
    info(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
      write({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context,
        app: APP_NAME,
        ...(meta && Object.keys(meta).length > 0 && { meta }),
      });
    },
  };
}
