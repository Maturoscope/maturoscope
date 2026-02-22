/**
 * Structured log payload for Loki/Grafana.
 * All fields are indexed-friendly; avoid PII in message when possible.
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface StructuredError {
  code?: string;
  message: string;
  stack?: string;
  statusCode?: number;
}

export interface StructuredLogPayload {
  timestamp: string; // ISO 8601
  level: LogLevel;
  message: string;
  context: string;
  app: string;
  requestId?: string;
  error?: StructuredError;
  /** Optional business context (userId, organizationId, etc.) - avoid PII */
  meta?: Record<string, string | number | boolean | undefined>;
}
