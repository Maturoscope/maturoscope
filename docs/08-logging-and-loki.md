# 08 — Logging and Loki/Grafana

## 1. Overview

Applications emit **structured JSON logs** to stdout/stderr for collection by a log agent (e.g. Promtail) and ingestion into **Loki**. Only **errors** and **key business events** are logged to avoid filling storage with noise.

## 2. Log Format

Each log line is a single JSON object (one line per event).

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 |
| `level` | `error` \| `warn` \| `info` \| `debug` | Severity |
| `message` | string | Short description |
| `context` | string | Module/route (e.g. `UserInvitationService`, `auth/login`) |
| `app` | string | `api` \| `dashboard` \| `app` |
| `requestId` | string | (API only) When available from `x-request-id` |
| `error` | object | For errors: `message`, `stack`, `code`, `statusCode` |
| `meta` | object | Optional context: `organizationId`, `status`, etc. (no PII) |

**Example (API error):**
```json
{"timestamp":"2025-02-22T12:00:00.000Z","level":"error","message":"S3 upload failed","context":"OvhS3Service","app":"api","error":{"message":"AccessDenied","stack":"..."},"meta":{"key":"org/123/avatar.png"}}
```

**Example (success):**
```json
{"timestamp":"2025-02-22T12:00:01.000Z","level":"info","message":"User invitation sent","context":"UserInvitationService","app":"api","meta":{"organizationId":"..."}}
```

## 3. What Is Logged

### API (`app: "api"`)

- **Errors:** Unhandled HTTP errors (global filter), DB/validation, S3 upload, email send, Auth0 token, invitation verify/complete, report PDF generation, service contact tracking, organization registration status, gap description, statistics increments.
- **Success (only important):** API startup, migrations (run-migrations), PDF report generated, user invitation sent/completed/resent.

### Dashboard (`app: "dashboard"`)

- **Errors:** All API route failures: auth (login, verify-invitation, me, change-password, register, complete-registration), users (members, invite, resend-invitation), user PATCH/GET, statistics (dashboard, reports), services (list, create, get, update, delete, contact, satisfaction-options), readiness-assessment (questions, assess), organizations (list, get, update, create, profile, language, resend-invitation, signature upload/remove, avatar upload/remove). Also API base URL not configured, timeouts, unauthorized.
- **Success:** Login success, registration completed.

### App (`app: "app"`)

- **Errors:** Organization key validation failure in middleware. Server actions: theme fetch, assessment submit, request contact, organization signature/name fetch, report PDF generation.

## 4. Loki / Grafana

- **Collect:** Configure Promtail (or equivalent) to read container stdout/stderr and push to Loki. Use a pipeline stage to parse JSON and set labels from `app`, `level`, `context`.
- **Query (LogQL):** e.g. `{app="api", level="error"}` or `{app="api"} | json | context="ReportService"`.
- **Request correlation:** In the API, set header `x-request-id` (or use the one from the client); it is added to error logs in the exception filter and can be used to trace a request across logs.

## 5. Implementation Notes

- **API:** `StructuredLoggerService` in `common/logger`; global `HttpExceptionFilter` logs all unhandled exceptions; `requestIdMiddleware` sets `x-request-id`.
- **Dashboard / App:** `createStructuredLogger(context)` in `lib/structured-logger.ts`; dashboard uses stdout/stderr, app uses `console` (Edge-compatible).
- **Migrations:** `writeStructuredLog()` in `run-migrations.ts` for startup and migration success/failure.
