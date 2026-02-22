# 03 — Project Structure

## 1. Monorepo Overview

The repository is managed with **Turborepo 2.x** and **Yarn 3.6.4** workspaces. All applications share the root `node_modules` for common tooling (TypeScript, ESLint, Prettier) while maintaining their own application-level dependencies.

```
maturoscope/
├── apps/
│   ├── api/              # NestJS REST API
│   ├── app/              # Next.js public assessment tool
│   └── dashboard/        # Next.js admin dashboard
├── packages/             # Shared packages (future use)
├── docs/                 # Project documentation
├── turbo.json            # Turborepo task pipeline
├── package.json          # Root workspace config
└── yarn.lock
```

Root `turbo.json` defines task dependencies — `build` respects `^build` ordering (packages before apps), `dev` runs all apps concurrently with persistent processes.

---

## 2. apps/api — NestJS Backend

```
apps/api/
├── src/
│   ├── main.ts                     # Bootstrap (NestFactory, port 8000)
│   ├── app.module.ts               # Root AppModule
│   ├── data-source.ts              # TypeORM DataSource (CLI migrations)
│   ├── run-migrations.ts           # Programmatic migration runner (prod startup)
│   │
│   ├── common/
│   │   ├── auth-module/
│   │   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/       # Auth-related interceptors
│   │   │   ├── interfaces/         # IAuthUser, IRequestWithUser
│   │   │   └── strategy/           # JwtStrategy (passport-jwt + jwks-rsa)
│   │   ├── decorators/             # @Roles(), @CurrentUser(), etc.
│   │   ├── mail/                   # MailModule (Gmail OAuth2 / Nodemailer)
│   │   ├── schema-init/            # DB schema bootstrap utilities
│   │   ├── storage/                # OVH S3 storage service (AWS SDK v3)
│   │   └── types/                  # Shared TypeScript types
│   │
│   ├── modules/
│   │   ├── integration-auth0/      # Auth0 Management API (user creation, role assignment)
│   │   │   └── dto/
│   │   ├── organizations/          # Organisation CRUD
│   │   │   ├── dto/
│   │   │   └── entities/           # organization.entity.ts
│   │   ├── readiness-assessment/   # Assessment logic (TRL / MkRL / MfRL)
│   │   │   ├── data/               # Static assessment question data
│   │   │   └── dto/
│   │   ├── report/                 # PDF report generation (Puppeteer)
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   └── pdf/                # EJS templates + PDF render logic
│   │   ├── services/               # Service & gap coverage management
│   │   │   ├── dto/
│   │   │   ├── entities/           # service.entity.ts, service-gap-coverage.entity.ts
│   │   │   └── templates/          # EJS email templates for services
│   │   ├── statistics/             # Organisation statistics
│   │   │   ├── dto/
│   │   │   └── entities/           # organization-statistics.entity.ts
│   │   ├── user-invitation/        # Invitation flow (token + email)
│   │   │   ├── dto/
│   │   │   └── templates/          # EJS email template for invitations
│   │   └── users/                  # User CRUD
│   │       ├── dto/
│   │       ├── entities/           # user.entity.ts
│   │       └── helpers/
│   │
│   ├── migrations/                 # TypeORM migration files (auto-generated)
│   ├── seeds/                      # seed.ts — development data seeder
│   └── types/                      # Global type declarations
│
├── test/                           # E2E tests (jest-e2e.json)
├── Dockerfile                      # Multi-stage Docker build
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### Module Pattern

Each feature module under `src/modules/` follows the same structure:

```
<feature>/
├── <feature>.module.ts     # NestJS module definition, imports, providers
├── <feature>.controller.ts # Route handlers, DTO validation, auth guards
├── <feature>.service.ts    # Business logic, TypeORM repository calls
├── dto/                    # Request/response DTOs (class-validator decorators)
└── entities/               # TypeORM entity classes
```

---

## 3. apps/app — Public Assessment Tool (Next.js 15)

```
apps/app/
├── src/
│   ├── app/
│   │   ├── [lang]/                 # Internationalised routing (en / fr)
│   │   │   ├── page.tsx            # Homepage
│   │   │   ├── begin/              # Assessment start page
│   │   │   ├── form/               # Assessment questionnaire
│   │   │   ├── results/            # Assessment results
│   │   │   └── review/[stage]/     # Answer review by stage
│   │   └── api/
│   │       ├── health/             # GET /api/health
│   │       └── ready/              # GET /api/ready
│   ├── actions/                    # Next.js Server Actions (API calls)
│   ├── animations/                 # Framer Motion / CSS animations
│   ├── components/
│   │   ├── common/                 # Generic UI components (Input, Modal, Header, etc.)
│   │   └── custom/                 # Feature-specific components
│   │       ├── BeginPage/
│   │       ├── FormPage/           # Question, ProgressTopBar, CheckpointScreen
│   │       ├── ResultsPage/        # Overview, DetailedReport, ServiceAccordion
│   │       └── ReviewPage/
│   ├── context/                    # React context providers
│   ├── dictionaries/               # i18n translation files (en, fr)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # API client, utilities
│   ├── types/                      # TypeScript type definitions
│   └── utils/
├── Dockerfile
└── package.json
```

This app does not require user authentication. Organisation context is resolved from a URL parameter (`org key`). Assessment state is managed in browser session storage and submitted to the API on completion.

---

## 4. apps/dashboard — Admin Dashboard (Next.js 15)

```
apps/dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/
│   │   │   ├── complete-registration/
│   │   │   └── reset-password/
│   │   ├── api/                    # Next.js API routes (BFF layer)
│   │   │   ├── auth/               # Auth0 callback, session management
│   │   │   ├── organizations/
│   │   │   ├── readiness-assessment/
│   │   │   ├── services/
│   │   │   ├── statistics/
│   │   │   ├── user/
│   │   │   └── users/
│   │   └── dashboard/              # Protected admin pages
│   │       ├── members/
│   │       ├── organizations/
│   │       ├── overview/
│   │       ├── reports/
│   │       ├── services/
│   │       ├── settings/
│   │       └── settingsUser/
│   ├── actions/                    # Server Actions
│   ├── components/
│   │   ├── navigation/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── toolSettings/
│   │   └── ui/
│   ├── constants/
│   ├── hooks/
│   │   └── contexts/
│   ├── lib/                        # API client wrappers
│   ├── services/                   # Client-side service abstractions
│   ├── types/
│   └── utils/
├── Dockerfile
└── package.json
```

The dashboard communicates with the NestJS API using JWTs obtained from Auth0. The Next.js API route layer (`/api/*`) acts as a Backend-for-Frontend (BFF), forwarding requests to the NestJS API with the user's access token.

---

## 5. Infra Repository Structure (Kustomize)

The infrastructure is managed in a **separate Git repository** (e.g., `maturoscope-infra`) consumed by Argo CD. This separation keeps application code and deployment manifests in distinct Git histories.

```
maturoscope-infra/
├── base/
│   ├── api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   ├── app/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   └── dashboard/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── kustomization.yaml
│
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml      # patches: image tags, replicas, env vars
│   │   ├── api-patch.yaml
│   │   └── ingress.yaml
│   └── production/
│       ├── kustomization.yaml      # patches: image tags, replicas, env vars
│       ├── api-patch.yaml
│       └── ingress.yaml
│
└── argocd/
    ├── app-staging.yaml            # Argo CD Application manifest
    └── app-production.yaml         # Argo CD Application manifest
```

Argo CD watches `overlays/staging` and `overlays/production`. CI updates the image tag in the appropriate overlay after a successful build and push.

---

## 6. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| NestJS modules | camelCase directory, PascalCase class | `user-invitation/`, `UserInvitationModule` |
| TypeORM entities | PascalCase class, snake_case table name | `Organization`, `organizations` |
| DTOs | `<Action><Resource>Dto` | `CreateOrganizationDto`, `UpdateUserDto` |
| Kubernetes resources | kebab-case | `api-deployment`, `dashboard-service` |
| Docker images | `<registry>/<app>:<git-sha>` | `registry.example.com/maturoscope/api:a1b2c3d` |
| Branches | `feature/<ticket>-description`, `fix/<ticket>` | `feature/42-user-invitation` |
| Env vars | `SCREAMING_SNAKE_CASE` | `AUTH0_ISSUER_URL`, `OVH_S3_BUCKET` |

---

## 7. Environment Separation

| Environment | Kubernetes Namespace | Argo CD App | Branch |
|---|---|---|---|
| Staging | `maturoscope-staging` | `maturoscope-staging` | `staging` (auto-deploy) |
| Production | `maturoscope-production` | `maturoscope-production` | `main` (auto-deploy) |

Environment-specific configuration is isolated in Kustomize overlays. Secrets are never committed; they are injected via Kubernetes Secrets managed outside the infra repository (e.g., via sealed-secrets or a manual apply step from a secure secrets store).

---

## 8. Key Architectural Patterns

### Layered Architecture (API)

The NestJS API enforces a strict three-layer architecture:

```
Controller (HTTP boundary)
    ↓ validated DTO
Service (business logic, no HTTP awareness)
    ↓ TypeORM entity / query
Repository (data access via TypeORM)
```

Controllers never contain business logic. Services never import HTTP types. This makes services independently testable.

### DTO Pattern

All inbound data is validated through DTOs using `class-validator` and `class-transformer`. Global `ValidationPipe` with `whitelist: true` strips undeclared fields, preventing mass assignment vulnerabilities.

```typescript
// Example
@Post()
create(@Body() dto: CreateOrganizationDto) { ... }
```

### Dependency Injection

NestJS's IoC container manages all module dependencies. Services are injected into controllers; repositories are injected into services. No service instantiates another service directly.

### GitOps Pattern

Cluster state is the authoritative representation of Git state in the infra repository. No `kubectl apply` is ever run manually in production. All changes flow through:

```
Git commit → Argo CD sync → Kubernetes reconciliation
```

### Immutable Container Tagging

Images are tagged with the Git commit SHA at build time. Tags are never mutated or reused. Rollback = reverting the image tag in the Kustomize overlay.

```
registry.example.com/maturoscope/api:a1b2c3d4  ← immutable
registry.example.com/maturoscope/api:latest     ← not used in production
```

### Twelve-Factor Principles Applied

| Factor | Implementation |
|---|---|
| Config | All config via environment variables; no hardcoded values |
| Backing services | DB, S3, Gmail treated as attached resources via env vars |
| Build/release/run | Docker build (build) → image push (release) → k8s pod (run) — strictly separated |
| Processes | Stateless API pods; no local disk state |
| Port binding | Each app binds to its own port via `PORT` env var |
| Logs | Written to stdout/stderr; collected by cluster logging agent |
| Dev/prod parity | Same Docker image runs locally (via compose) and in production |
