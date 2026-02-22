# 09 — Multi-Tenancy

This document describes how multi-tenancy works in the Maturoscope platform: how tenants (organizations) are identified, how the public assessment app is scoped per tenant, and how the dashboard provides tenant-specific links.

---

## 1. Overview

The platform is **multi-tenant**. A **tenant** is an **organization** (e.g. a client or company). Each organization has a unique **key** (e.g. `synopp`) stored in the database. The same deployed applications serve all tenants; tenant isolation is achieved by passing the organization key in the URL and using it to scope API calls and UI (theme, branding).

| Application | Multi-tenant? | How tenant is determined |
|-------------|----------------|---------------------------|
| **apps/app** (public assessment) | Yes | `key` query parameter + optional cookie `organization-key` |
| **apps/dashboard** | Yes (per user) | Logged-in user belongs to one organization; dashboard shows that org’s data and link |
| **apps/api** | Yes | Request body or query: `organizationKey` (or org from JWT / path) |

There is a **single codebase and a single deployment** of each app. No separate instances per tenant.

---

## 2. Organization Key

- Stored in the `organizations` table as **`key`** (unique, not null).
- Short, URL-safe string (e.g. `synopp`, `acme-corp`). Used in URLs and API calls.
- Set when the organization is created (dashboard or API). Often derived from the organization name (e.g. slug).
- **Do not expose internal IDs (UUID)** in the public assessment URL; the key is the public tenant identifier.

---

## 3. Public Assessment App (apps/app) — URL and Middleware

### 3.1 Required URL format

Every request to the assessment app (except the 404 page) must identify the tenant. The tenant is provided by the **organization key** in the URL:

```
{APP_BASE_URL}/{locale}?key={organizationKey}
{APP_BASE_URL}/{locale}/begin?key={organizationKey}
{APP_BASE_URL}/{locale}/form?key={organizationKey}
{APP_BASE_URL}/{locale}/results?key={organizationKey}
...
```

Examples:

- `https://app.example.com/en?key=synopp`
- `https://app.example.com/fr/begin?key=synopp`

**Locale** is part of the path (`en`, `fr`). **Key** is always in the query string as `key`.

### 3.2 Middleware behavior (`apps/app/src/middleware.ts`)

1. **Read key**  
   - From query: `request.nextUrl.searchParams.get("key")`  
   - Or from cookie: `organization-key`  
   - Resolved as: `key = keyFromUrl || keyFromCookie`.

2. **No key**  
   - Redirect to `/{locale}/404` (no key in URL or cookie).

3. **Validate key**  
   - `GET {API}/organizations/key/{key}` (and optional `?organizationKey=...` for consistency).  
   - If the response is not OK or not a valid organization object → redirect to `/{locale}/404`.

4. **Key in cookie but not in URL**  
   - Redirect to the same path with `?key={key}` added so the key is visible in the URL and the link remains shareable.  
   - Cookie `organization-key` is set (or refreshed) with 7-day expiry.

5. **Key in URL**  
   - Set cookie `organization-key` so subsequent requests (e.g. form submissions) can use it even if the user navigates to a path without the query string.  
   - Cookie expiry: 7 days.

6. **Locale**  
   - If the path has no locale, redirect to `/{locale}{path}` (e.g. `/` → `/en`, `/begin` → `/en/begin`) preserving all query params (including `key`).

So: **key must be in the URL for the first request** (or already in the cookie from a previous visit). Invalid or missing key → 404.

### 3.3 Cookie and API usage

- **Cookie name:** `organization-key`  
- **Purpose:** Persist the tenant so server actions and API calls can send `organizationKey` without reading the URL on every request.  
- All assessment-related API calls (assess, contact, report, statistics) send `organizationKey` (from cookie or URL) so the backend can scope data to that organization.

---

## 4. Dashboard — Generating the Tenant-Specific Link

The dashboard does **not** deploy separate apps per tenant. It **builds the assessment URL** for the logged-in user’s organization and displays it in **Settings**.

**Logic (e.g. in `apps/dashboard/src/app/dashboard/settings/page.tsx`):**

- Base URL: `process.env.NEXT_PUBLIC_END_USER_URL` (public assessment app base).
- Organization: `user.organization.key` and `user.organization.language`.
- Resulting URL:  
  `{NEXT_PUBLIC_END_USER_URL}/{language}?key={user.organization.key}`  

Example: `https://app.example.com/en?key=synopp`.

The administrator **copies this link** and shares it (email, website, etc.). Anyone opening the link gets the assessment scoped to that organization (branding, services, statistics).

---

## 5. API Scoping by Organization

| Endpoint / area | How organization is passed |
|------------------|----------------------------|
| `GET /organizations/key/:key` | Path: identifies the org to load (public). |
| `POST /readiness-assessment/assess?organizationKey=` | Query: scope assessment and stats. |
| `POST /services/contact?organizationKey=` | Query: scope contact and services. |
| `POST /report/:locale` (body or query) | organizationKey: scope report branding and data. |
| `POST /statistics/track-started|track-completed|track-category?organizationKey=` | Query: attribute events to that org. |
| Dashboard-authenticated endpoints | User’s org from JWT / session; no `key` in public URL. |

The API uses `organizationKey` to filter and attribute data (e.g. organization theme, services, statistics) so that each tenant only sees and affects their own data.

---

## 6. Flow Summary

```
1. Admin opens Dashboard → Settings.
2. Dashboard shows: "Assessment link" = {END_USER_URL}/{language}?key={org.key}.
3. Admin copies link and shares it (e.g. https://app.example.com/en?key=synopp).
4. User opens link → App middleware reads key from URL.
5. Middleware validates key via GET /organizations/key/synopp.
6. If valid: key is stored in cookie; app loads theme/services for that org; user completes assessment.
7. All assessment API calls include organizationKey (from cookie or URL); backend scopes by org.
```

---

## 7. Environment Variables

| Variable | Application | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_END_USER_URL` | Dashboard | Base URL of the public assessment app (used to build the link with `?key=...`). |
| `NEXT_PUBLIC_API_URL` | App | API base URL (used by middleware and server actions to validate key and call assess/report/etc.). |

Production and staging must set `NEXT_PUBLIC_END_USER_URL` to the real assessment app URL (e.g. `https://app.maturoscope.com`).

---

## 8. Security and Isolation

- **No cross-tenant data:** API and app scope all reads/writes by `organizationKey` (or by the authenticated user’s organization in the dashboard).
- **Key is not secret:** The key is in the URL and is the tenant identifier. It does not grant access to other tenants’ data; the backend enforces scoping.
- **Invalid key:** Middleware redirects to 404; no organization data is shown.
- **Dashboard:** Users only see and manage their own organization; org is fixed by their account.

