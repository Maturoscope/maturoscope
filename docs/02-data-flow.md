# 02 — Data Flows

## 1. User Request Lifecycle

Standard authenticated API request from any client (app or dashboard):

```
Client
  │
  │  HTTPS request (Bearer JWT in Authorization header)
  ▼
OVH Load Balancer
  │
  ▼
Nginx Ingress (TLS termination)
  │
  ▼
Kubernetes Service (ClusterIP)
  │
  ▼
NestJS API Pod
  │
  ├─ JwtAuthGuard → validates JWT signature against Auth0 JWKS endpoint
  ├─ RolesGuard → checks role claim in JWT payload
  ├─ Controller → maps route, validates DTO via class-validator
  ├─ Service layer → business logic
  │
  ▼
TypeORM Repository
  │
  ▼
OVH Managed PostgreSQL (private vRack IP)
  │
  ▼
Response serialised → JSON → Client
```

**Latency notes:**
- JWKS public keys are cached in-process by `jwks-rsa`; no Auth0 round-trip on every request.
- Database connections are pooled via TypeORM's built-in connection pool.

---

## 2. Authentication Flow (Auth0)

### 2.1 Dashboard Login (Admin user)

```
User (browser)
  │
  │  1. GET /dashboard → redirect to Auth0 Universal Login
  ▼
Auth0 Universal Login Page
  │
  │  2. User submits credentials
  ▼
Auth0
  │
  │  3. Redirect back with authorization code
  ▼
dashboard (Next.js API route /api/auth/callback)
  │
  │  4. Exchange code for tokens (access_token, id_token, refresh_token)
  ▼
dashboard session (encrypted cookie via NextAuth or Auth0 SDK)
  │
  │  5. Subsequent API calls: access_token in Authorization header
  ▼
NestJS API
  │
  │  6. JwtAuthGuard → fetches JWKS from AUTH0_ISSUER_URL/.well-known/jwks.json
  │     Validates signature, audience, issuer, expiry
  ▼
Controller (request processed with user identity attached to request object)
```

### 2.2 Public App (No login required)

The `apps/app` public assessment tool does not require user authentication. Organisation context is resolved via a URL slug/key (`organizationId`). Assessment state is held in client-side session storage.

### 2.3 User Invitation Flow

```
Admin (dashboard)
  │
  │  POST /user-invitation { email, organizationId, role }
  ▼
NestJS API — UserInvitationModule
  │
  ├─ 1. Calls Auth0 Management API → creates Auth0 user
  ├─ 2. Assigns role (AUTH0_USER_ROLE or AUTH0_ADMIN_ROLE) via Auth0 API
  ├─ 3. Signs an invitation JWT (JWT_SECRET, INVITATION_TOKEN_EXPIRATION)
  ├─ 4. Stores user record in PostgreSQL users table (isActive: false)
  ├─ 5. Sends invitation email via Gmail OAuth2 (EJS template)
  │
  ▼
User (email received)
  │
  │  Clicks link → GET /complete-registration?token=<jwt>
  ▼
dashboard (Next.js)
  │
  │  Validates token → prompts user to set password via Auth0
  ▼
User activated in both Auth0 and PostgreSQL (isActive: true)
```

---

## 3. Email Sending Flow

All outbound email is sent through Gmail OAuth2 using Nodemailer. There is no SMTP password — authentication uses a long-lived refresh token.

```
NestJS MailModule
  │
  ├─ 1. Uses googleapis to obtain a short-lived access_token
  │     from GMAIL_REFRESH_TOKEN + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET
  │
  ├─ 2. Passes access_token to Nodemailer as OAuth2 transport credentials
  │
  ├─ 3. Renders EJS template (e.g. apps/api/src/modules/user-invitation/templates/)
  │
  └─ 4. Sends email from MAIL_FROM via Gmail SMTP (smtp.gmail.com:465)
```

**Failure handling:** Email send errors are caught and logged. The API returns a success response to the caller if the database write succeeded — email delivery failure does not roll back the invitation record. Retry logic must be handled operationally.

---

## 4. PDF Report Generation Flow

```
Client
  │
  │  POST /report (with assessment results payload)
  ▼
NestJS ReportModule
  │
  ├─ 1. Fetches organisation branding (theme, font, logo from OVH S3)
  ├─ 2. Renders report HTML via EJS template
  ├─ 3. Launches headless Chromium via Puppeteer
  ├─ 4. Puppeteer renders HTML → exports PDF buffer
  ├─ 5. Optionally uploads PDF to OVH S3 bucket
  │
  ▼
Response: PDF file download (application/pdf) or S3 presigned URL
```

**Note:** Puppeteer runs inside the API container. The Docker image must include Chromium dependencies. Memory limits on the API pods must account for Puppeteer's Chromium footprint (~150–300 MB per render).

---

## 5. CI/CD Flow

```
Developer
  │
  │  git push → feature branch or main
  ▼
GitHub Actions (CI)
  │
  ├─ 1. Checkout repository
  ├─ 2. yarn install + lint + type-check + test
  ├─ 3. Docker build (multi-stage) for api / app / dashboard
  ├─ 4. Tag image: registry.example.com/maturoscope/<app>:<git-sha>
  ├─ 5. Push image to Harbor private registry
  ├─ 6. Harbor runs vulnerability scan on pushed image
  ├─ 7. Update image tag in infra repository (kustomize overlay)
  │      → opens PR or commits directly to infra/overlays/staging or production
  │
  ▼
Argo CD (watching infra repository)
  │
  ├─ 8. Detects diff in overlay image tag
  ├─ 9. Syncs Kubernetes resources to cluster (kubectl apply)
  ├─ 10. Kubernetes performs rolling update (zero-downtime)
  │
  ▼
New container version running in cluster
```

See `04-cicd-and-deployment.md` for full pipeline detail.

---

## 6. Secrets Flow

```
GitHub Actions
  │
  ├─ Reads secrets from GitHub repository secrets store
  │   (HARBOR_USERNAME, HARBOR_PASSWORD, KUBECONFIG, etc.)
  │
  ├─ At deploy step: writes Kubernetes Secrets via kubectl or
  │   updates sealed-secrets / external-secrets manifests in infra repo
  │
  ▼
Kubernetes Secrets (base64-encoded, encrypted at rest in etcd)
  │
  ▼
Mounted as environment variables into API / app / dashboard pods
  │
  ▼
NestJS ConfigModule reads process.env at startup
```

**Secret categories:**

| Secret | Injected into |
|---|---|
| `DB_HOST`, `DB_PASS`, `DB_USER`, `DB_NAME` | `api` pod |
| `AUTH0_*` | `api` pod, `dashboard` pod |
| `OVH_S3_*` | `api` pod |
| `GMAIL_*`, `MAIL_*`, `JWT_SECRET` | `api` pod |
| `NEXT_PUBLIC_GATEWAY_URL` | `app` + `dashboard` build args |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | `dashboard` pod |

---

## 7. Inter-Service Communication

| From | To | Method |
|---|---|---|
| `apps/app` (Next.js Server Actions) | `apps/api` | HTTP REST (internal cluster DNS) |
| `apps/dashboard` (Next.js API routes) | `apps/api` | HTTP REST (internal cluster DNS) |
| `apps/api` | Auth0 Management API | HTTPS (external) |
| `apps/api` | OVH S3 | HTTPS via AWS SDK v3 (external) |
| `apps/api` | Gmail SMTP | HTTPS OAuth2 + SMTP (external) |
| `apps/api` | PostgreSQL | TCP 5432 (private vRack) |

No message queue or event bus is used. All communication is synchronous request/response.

---

## 8. Failure Scenarios & Handling

| Scenario | Impact | Handling |
|---|---|---|
| Auth0 JWKS endpoint unreachable | All authenticated API requests fail | `jwks-rsa` caches keys; short-term outage tolerated. Alert on sustained failures. |
| PostgreSQL connection lost | API returns 500 on DB-dependent routes | TypeORM retries with exponential backoff on connection. Pods restart on repeated failure (liveness probe). |
| Harbor registry unavailable | New deployments blocked | Existing running pods are unaffected. CI pipeline fails gracefully with error. |
| Argo CD sync failure | Cluster state not updated | Argo CD marks application as `OutOfSync`. No automatic rollback. Operator manually resolves. |
| Gmail OAuth2 token expired | Invitation emails fail | Operator must rotate `GMAIL_REFRESH_TOKEN` and update Kubernetes Secret. |
| OVH S3 unreachable | PDF uploads fail; file downloads fail | API returns error to client. Core assessment flow (non-PDF) unaffected. |
| Puppeteer crash during PDF render | 500 returned to client | Puppeteer is launched per-request; crash does not affect other requests. Pod restart not triggered unless process exits. |
| Pod OOMKilled (Puppeteer) | API pod restarts | Increase memory limits on `api` Deployment. Puppeteer concurrency should be limited. |
| Node pool maintenance (OVH) | Rolling pod eviction | PodDisruptionBudget ensures minimum 1 replica available. Rolling update handles gracefully. |
