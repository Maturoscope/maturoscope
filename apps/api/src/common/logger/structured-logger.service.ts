import { Injectable } from '@nestjs/common';
import type { LogLevel, StructuredLogPayload, StructuredError } from './logger.types';

const APP_NAME = 'api';

/**
 * Structured logger for Loki/Grafana.
 * Outputs JSON to stdout. Log only what matters: errors (always) and key business success events.
 */
@Injectable()
export class StructuredLoggerService {
  constructor(private readonly context: string) {}

  private serializeError(err: unknown): StructuredError | undefined {
    if (err instanceof Error) {
      return {
        message: err.message,
        code: (err as { code?: string }).code,
        stack: err.stack,
        statusCode: (err as { statusCode?: number }).statusCode,
      };
    }
    if (typeof err === 'object' && err !== null) {
      return { message: String((err as Record<string, unknown>).message ?? err) };
    }
    return { message: String(err) };
  }

  private write(level: LogLevel, message: string, error?: unknown, meta?: Record<string, string | number | boolean | undefined>): void {
    const payload: StructuredLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      app: APP_NAME,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
      ...(error !== undefined ? { error: this.serializeError(error) } : {}),
    };
    const line = JSON.stringify(payload);
    if (level === 'error') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }

  error(message: string, error?: unknown, meta?: Record<string, string | number | boolean | undefined>): void {
    this.write('error', message, error, meta);
  }

  warn(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
    this.write('warn', message, undefined, meta);
  }

  info(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
    this.write('info', message, undefined, meta);
  }

  debug(message: string, meta?: Record<string, string | number | boolean | undefined>): void {
    if (process.env.NODE_ENV === 'development') {
      this.write('debug', message, undefined, meta);
    }
  }

  /**
   * Create a child logger with a specific context (e.g. service/module name).
   */
  child(context: string): StructuredLoggerService {
    return new StructuredLoggerService(context);
  }
}

/**
 * Standalone JSON logger for non-Nest contexts (e.g. run-migrations script).
 * Writes one JSON object per line to stdout/stderr.
 */
export function writeStructuredLog(
  level: LogLevel,
  message: string,
  error?: unknown,
  meta?: Record<string, string | number | boolean | undefined>,
): void {
  const payload: StructuredLogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: 'migrations',
    app: APP_NAME,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    ...(error !== undefined
      ? {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  code: (error as { code?: string }).code,
                  stack: error.stack,
                  statusCode: (error as { statusCode?: number }).statusCode,
                }
              : { message: String(error) },
        }
      : {}),
  };
  const line = JSON.stringify(payload) + '\n';
  if (level === 'error') {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}
