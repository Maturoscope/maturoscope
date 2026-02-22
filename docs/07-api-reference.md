# 07 — API Reference

## 1. Swagger UI Access

The interactive API documentation is served by the NestJS application at runtime via `@nestjs/swagger`.

### Path rule (`apps/api/src/main.ts`)

```typescript
const swaggerPath = process.env.NODE_ENV === 'production' ? 'api-docs' : 'api';
```

| `NODE_ENV` value | Swagger path | Full local URL |
|---|---|---|
| `development` (or any non-`production` value) | `/api` | `http://localhost:8000/api` |
| `production` | `/api-docs` | `https://<host>/api-docs` |

> **`/api` is the development path only.**
> All deployed environments (staging and production) set `NODE_ENV=production`, so the path is always `/api-docs` in the cluster.

### Environment URLs

| Environment | Swagger UI URL |
|---|---|
| Local development | `http://localhost:8000/api` |
| Staging (OVH MKS GRA) | `https://api.staging.maturoscope.io/api-docs` |
| Production (OVH MKS GRA) | `https://api.maturoscope.com/api-docs` |

### Swagger UI Features

- `persistAuthorization: true` — JWT token is retained across page reloads
- `docExpansion: 'none'` — all sections collapsed by default
- `filter: true` — search box for filtering endpoints
- `showRequestDuration: true` — response time visible per request
- Syntax highlighting (Monokai theme)
- Custom site title: **Maturoscope API Docs**

---

## 2. Authentication in Swagger UI

Most endpoints require a valid Auth0 JWT. To authorise requests in Swagger:

1. Obtain a JWT — log in to the dashboard, open browser DevTools → Application → Cookies, copy the `token` value.
2. Click the **Authorize** button (lock icon, top right of the Swagger UI).
3. In the **BearerAuth (JWT-auth)** field, enter:
   ```
   Bearer <your-jwt-token>
   ```
4. Click **Authorize** then **Close**.

All subsequent requests from Swagger UI will include the `Authorization: Bearer <token>` header automatically.

---

## 3. API Modules & Endpoints

### Summary

| Module | Tag | Public endpoints | Authenticated endpoints |
|---|---|---|---|
| Users | `users` | 0 | 9 |
| Organizations | `organizations` | 3 | 9 |
| Services | `services` | 1 | 6 |
| Statistics | `statistics` | 3 | 2 |
| Readiness Assessment | `readiness-assessment` | 4 | 0 |
| Report | `report` | 1 | 0 |
| User Invitation | `user-invitation` | 2 | 2 |
| Auth0 Integration | `auth0` | 0 | 1 |
| **Total** | | **14** | **27** |

---

### 3.1 Users (`/users`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/users` | JWT | admin | Create user directly (admin only — normal flow uses `/user-invitation/invite`) |
| `GET` | `/users` | JWT | user | List all users |
| `GET` | `/users/organization/:organizationId` | JWT | user | List users by organisation |
| `GET` | `/users/email/:email` | JWT | user | Get user by email |
| `GET` | `/users/:id` | JWT | admin | Get user by ID |
| `PATCH` | `/users/:id` | JWT | user | Update user |
| `PATCH` | `/users/email/:email` | JWT | user | Update user by email |
| `DELETE` | `/users/:id` | JWT | user | Delete user |

---

### 3.2 Organizations (`/organizations`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/organizations` | Public | — | List organisations |
| `GET` | `/organizations/:id` | Public | — | Get organisation by ID |
| `GET` | `/organizations/key/:key` | Public | — | Get organisation by key |
| `POST` | `/organizations` | JWT | admin | Create organisation |
| `PATCH` | `/organizations/:id` | JWT | user | Update organisation |
| `DELETE` | `/organizations/:id` | JWT | user | Delete organisation |
| `PATCH` | `/organizations/avatar` | JWT | user | Upload avatar (multipart/form-data) |
| `DELETE` | `/organizations/avatar` | JWT | user | Remove avatar |
| `PATCH` | `/organizations/signature` | JWT | user | Upload signature (multipart/form-data) |
| `DELETE` | `/organizations/signature` | JWT | user | Remove signature |
| `PATCH` | `/organizations/language` | JWT | user | Update default language |
| `PATCH` | `/organizations/profile` | JWT | user | Update profile settings |

**File upload endpoints** (`avatar`, `signature`) use `Content-Type: multipart/form-data`.

---

### 3.3 Services (`/services`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/services/contact?organizationKey=X` | Public | — | Contact services (from assessment app) |
| `POST` | `/services` | JWT | user | Create service |
| `GET` | `/services` | JWT | user | List organisation services |
| `GET` | `/services/satisfaction-options` | JWT | user | Get satisfaction option values |
| `GET` | `/services/:id` | JWT | user | Get service by ID |
| `PATCH` | `/services/:id` | JWT | user | Update service |
| `DELETE` | `/services/:id` | JWT | user | Delete service |

---

### 3.4 Statistics (`/statistics`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/statistics/track-started?organizationKey=X` | Public | — | Track assessment started |
| `POST` | `/statistics/track-completed?organizationKey=X` | Public | — | Track assessment completed |
| `POST` | `/statistics/track-category?organizationKey=X` | Public | — | Track user category/level |
| `GET` | `/statistics/dashboard` | JWT | user | Dashboard analytics |
| `GET` | `/statistics/reports` | JWT | admin | Aggregated admin reports |

**Note:** Public tracking endpoints are called from `apps/app` without user authentication. They require `organizationKey` as a query parameter.

---

### 3.5 Readiness Assessment (`/readiness-assessment`)

All endpoints in this module are **public** — no JWT required. These are consumed by `apps/app`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/readiness-assessment/questions` | Public | All assessment questions (TRL + MkRL + MfRL) |
| `GET` | `/readiness-assessment/questions/:scale` | Public | Questions for a specific scale |
| `POST` | `/readiness-assessment/assess?organizationKey=X` | Public | Compute maturity level for a scale |
| `POST` | `/readiness-assessment/analyze-risk` | Public | Compute overall risk analysis |

**Scale values:** `TRL` · `MkRL` · `MfRL`

---

### 3.6 Report (`/report`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/report/:locale` | Public | Generate PDF report |

**Locale values:** `en` · `fr`

Response: `application/pdf` (binary). The PDF is rendered server-side via Puppeteer.

---

### 3.7 User Invitation (`/user-invitation`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/user-invitation/verify?token=X` | Public | — | Verify invitation token |
| `POST` | `/user-invitation/complete` | Public | — | Complete registration (set password via Auth0) |
| `POST` | `/user-invitation/invite` | JWT | user | Send invitation email to a new user |
| `POST` | `/user-invitation/resend` | JWT | user | Resend invitation to existing pending user |

---

### 3.8 Auth0 Integration (`/auth0`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/auth0/assign-role` | JWT | user | Assign a role to a user via Auth0 Management API |

Internal endpoint — used by the invitation flow, not called directly by frontend applications.

---

## 4. Public vs Authenticated Endpoints Reference

### Public Endpoints (14) — No JWT Required

Called from `apps/app` (public assessment tool) or during the invitation onboarding flow:

```
GET  /organizations
GET  /organizations/:id
GET  /organizations/key/:key
GET  /readiness-assessment/questions
GET  /readiness-assessment/questions/:scale
POST /readiness-assessment/assess?organizationKey=<key>
POST /readiness-assessment/analyze-risk
POST /report/:locale
POST /services/contact?organizationKey=<key>
POST /statistics/track-started?organizationKey=<key>
POST /statistics/track-completed?organizationKey=<key>
POST /statistics/track-category?organizationKey=<key>
GET  /user-invitation/verify?token=<token>
POST /user-invitation/complete
```

### Authenticated Endpoints (27) — JWT Required

Called from `apps/dashboard` with Auth0 access token:

```
POST   /users                               ← admin only (direct creation, bypass invitation flow)
GET    /users
GET    /users/organization/:organizationId
GET    /users/email/:email
GET    /users/:id                           ← admin only
PATCH  /users/:id
PATCH  /users/email/:email
DELETE /users/:id

POST   /organizations                       ← admin only
PATCH  /organizations/:id
DELETE /organizations/:id
PATCH  /organizations/avatar
DELETE /organizations/avatar
PATCH  /organizations/signature
DELETE /organizations/signature
PATCH  /organizations/language
PATCH  /organizations/profile

POST   /services
GET    /services
GET    /services/satisfaction-options
GET    /services/:id
PATCH  /services/:id
DELETE /services/:id

GET    /statistics/dashboard
GET    /statistics/reports                  ← admin only

POST   /user-invitation/invite
POST   /user-invitation/resend

POST   /auth0/assign-role
```

---

## 5. HTTP Response Codes

| Code | Meaning | Common cause |
|---|---|---|
| `200 OK` | Success | GET / PATCH |
| `201 Created` | Resource created | POST |
| `204 No Content` | Success, no body | DELETE |
| `400 Bad Request` | Validation failed | Missing field, wrong type |
| `401 Unauthorized` | Missing or invalid JWT | Expired token, wrong audience |
| `403 Forbidden` | Insufficient role | `user` role calling an `admin`-only endpoint |
| `404 Not Found` | Resource not found | Wrong UUID or key |
| `409 Conflict` | Duplicate resource | Email or key already exists |
| `500 Internal Server Error` | Unhandled server error | Check API logs |

---

## 6. Key Query Parameters

| Parameter | Type | Used by | Description |
|---|---|---|---|
| `organizationKey` | string | `/readiness-assessment/assess`, `/services/contact`, `/statistics/track-*` | Organisation slug (e.g., `synopp`) |
| `token` | string | `/user-invitation/verify` | Signed JWT invitation token |
| `locale` | path param | `/report/:locale` | Report language: `en` or `fr` |
| `scale` | path param | `/readiness-assessment/questions/:scale` | Scale type: `TRL`, `MkRL`, or `MfRL` |

---

## 7. Content-Type Reference

| Endpoint | Request Content-Type | Response Content-Type |
|---|---|---|
| Most POST / PATCH | `application/json` | `application/json` |
| `PATCH /organizations/avatar` | `multipart/form-data` | `application/json` |
| `PATCH /organizations/signature` | `multipart/form-data` | `application/json` |
| `POST /report/:locale` | `application/json` | `application/pdf` |

---

## 8. Swagger Implementation Notes

The Swagger setup is in `apps/api/src/main.ts`. Key implementation details:

- **Package:** `@nestjs/swagger` (installed as a production dependency)
- **Path:** `/api` when `NODE_ENV !== 'production'`, `/api-docs` when `NODE_ENV === 'production'`
- **Auth scheme:** `BearerAuth` named `JWT-auth`, applied per-endpoint via `@ApiBearerAuth('JWT-auth')`
- **Tags:** 8 tags corresponding to the 8 NestJS feature modules
- **DTO documentation:** `@ApiProperty` decorators on all DTO classes provide field descriptions and examples in the Swagger UI schema
- **Body size:** Increased to 5 MB to support base64-encoded PDF attachments (`json({ limit: '5mb' })`)

### Adding Swagger Decorators to New Endpoints

When adding a new endpoint, the minimum required decorators are:

```typescript
@ApiTags('module-name')
@ApiOperation({ summary: 'Brief description' })
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
// For authenticated endpoints:
@ApiBearerAuth('JWT-auth')
```

For DTOs, annotate each property:

```typescript
@ApiProperty({ description: 'Unique organisation key', example: 'synopp' })
key: string;
```
