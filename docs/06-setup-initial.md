# 06 — Initial Setup Guide

Developer onboarding guide for local development of the Maturoscope platform.

---

## 1. Required Tools

Install the following before proceeding:

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| Yarn | 3.6.4 | `npm install -g yarn` then `yarn set version 3.6.4` |
| Docker + Docker Compose | Latest stable | [docker.com](https://www.docker.com/get-started) |
| Git | Any recent | [git-scm.com](https://git-scm.com/) |
| psql (optional) | Any | `brew install libpq` (macOS) |

Verify:

```bash
node --version     # >= 18.0.0
yarn --version     # 3.6.4
docker --version
git --version
```

---

## 2. Repository Setup

```bash
git clone https://github.com/Maturoscope/maturoscope.git
cd maturoscope
yarn install
```

This installs dependencies for all apps (`api`, `app`, `dashboard`) and shared packages in one step. Turborepo manages workspace hoisting.

---

## 3. Environment Variables

> **Note:** Real environment variable values are not stored in the repository. If you need working credentials for local development (Auth0 tenant, Gmail OAuth2 tokens, OVH S3 keys), contact the project administrator at **admin@synopp.io**.

Each application requires a `.env` file. Start by copying the example:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and fill in all required values. The full reference:

### apps/api/.env

```bash
# Database — local Docker container
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_local_password
DB_NAME=maturoscope

# API Server
PORT=8000
NODE_ENV=development

# Auth0
AUTH0_ISSUER_URL=https://<your-tenant>.auth0.com/
AUTH0_AUDIENCE=http://localhost:8000/
AUTH0_CLIENT_ID=<from Auth0 dashboard>
AUTH0_CLIENT_SECRET=<from Auth0 dashboard>
AUTH0_USER_ROLE=rol_<id>
AUTH0_ADMIN_ROLE=rol_<id>

# OVH Object Storage (optional for local dev)
OVH_S3_ENDPOINT=https://s3.eu-west-par.io.cloud.ovh.net
OVH_S3_PUBLIC_BASE_URL=https://<bucket>.s3.eu-west-par.io.cloud.ovh.net
OVH_S3_REGION=eu-west-par
OVH_S3_ACCESS_KEY=<key>
OVH_S3_SECRET_KEY=<secret>
OVH_S3_BUCKET=<bucket-name>

# Invitations & Email
JWT_SECRET=<min-32-char-random-string>
INVITATION_TOKEN_EXPIRATION=7d
INVITATION_EXPIRATION_DAYS=7
DASHBOARD_APP_URL=http://localhost:3001
APP_NAME=Maturoscope

# Gmail OAuth2
GMAIL_CLIENT_ID=<from Google Cloud Console>
GMAIL_CLIENT_SECRET=<from Google Cloud Console>
GMAIL_REFRESH_TOKEN=<from OAuth2 Playground>
MAIL_USER=<your-email@gmail.com>
MAIL_FROM=<your-email@gmail.com>
```

### apps/app/.env.local

```bash
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<min-32-char-random-string>
```

### apps/dashboard/.env.local

```bash
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
AUTH0_SECRET=<random-32-char>
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<dashboard-client-id>
AUTH0_CLIENT_SECRET=<dashboard-client-secret>
```

**Generating a secure random string:**

```bash
openssl rand -base64 32
```

---

## 4. Auth0 Setup (required for dashboard login)

1. Log in to [manage.auth0.com](https://manage.auth0.com/).
2. Create a **Regular Web Application** for the dashboard.
   - Allowed Callback URLs: `http://localhost:3001/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3001`
3. Create an **API** (Machine-to-Machine or Custom API):
   - Identifier (Audience): `http://localhost:8000/`
4. Create two **Roles**: `user` and `admin`. Copy their IDs into `AUTH0_USER_ROLE` and `AUTH0_ADMIN_ROLE`.
5. Enable the **Auth0 Management API** for your M2M application if you want the invitation flow to work locally.

---

## 5. Database Setup (Docker)

The local database runs in Docker. A `docker-compose.yml` is located in `apps/api/`.

```bash
cd apps/api

# Start PostgreSQL container
docker compose up -d db

# Verify it is running
docker ps | grep maturoscope
```

The container exposes PostgreSQL on `localhost:5432` with the credentials from your `.env` file.

### Run Migrations

```bash
cd apps/api
yarn migration:run
```

This applies all pending TypeORM migrations and creates the full schema.

### Seed Development Data

```bash
yarn seed
```

Creates sample organisations, users, services, gap coverages, and statistics. Idempotent — will not re-seed if data already exists.

### Verify

```bash
docker exec -it maturoscope psql -U postgres -d maturoscope -c "\dt"
```

You should see all 5 tables listed.

---

## 6. Running the Applications

### All Applications (recommended)

```bash
# From repository root
yarn dev
```

Turborepo starts all three apps concurrently:

| App | URL |
|---|---|
| API | http://localhost:8000 |
| App (assessment) | http://localhost:3000 |
| Dashboard | http://localhost:3001 |

### Individual Applications

```bash
# API only
cd apps/api && yarn dev

# Assessment app only
cd apps/app && yarn dev

# Dashboard only
cd apps/dashboard && yarn dev
```

---

## 7. API Health Check

```bash
curl http://localhost:8000/health
# Expected: { "status": "ok" }
```

Test that the API connects to the database and Auth0 is configured:

```bash
# Should return 401 (unauthenticated) — not 500
curl -I http://localhost:8000/organizations
```

---

## 8. Building for Production (local verification)

```bash
# Build all apps
yarn build

# Or build a specific app
yarn build --filter=api
yarn build --filter=app
yarn build --filter=dashboard
```

### Run API in production mode locally

```bash
cd apps/api
yarn start:prod
```

This runs `node dist/main.js` — the compiled output, not ts-node.

---

## 9. Code Quality

```bash
# Lint all workspaces
yarn lint

# TypeScript type check
yarn check-types

# Format all files
yarn format

# Run API unit tests
cd apps/api && yarn test

# Run tests in watch mode
cd apps/api && yarn test:watch

# Coverage report
cd apps/api && yarn test:cov
```

---

## 10. Useful Database Commands

```bash
cd apps/api

# Show migration status (applied vs pending)
yarn migration:show

# Generate a new migration from entity changes
yarn migration:generate src/migrations/YourMigrationName

# Revert last migration
yarn migration:revert

# Connect to local DB directly
docker exec -it maturoscope psql -U postgres -d maturoscope

# Stop and remove DB container
docker compose down

# Stop and remove DB container + wipe volume (full reset)
docker compose down -v
```

---

## 11. Troubleshooting

### `yarn install` fails — Yarn version mismatch

```bash
yarn set version 3.6.4
yarn install
```

### Port already in use

```bash
# Find what is using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Database connection refused

- Verify the Docker container is running: `docker ps`
- Verify `DB_HOST=localhost` and `DB_PORT=5432` in `apps/api/.env`
- Restart the container: `docker compose restart db`

### Migrations fail — relation does not exist

The database is likely empty. Run `docker compose up -d db` first, wait 5 seconds, then run `yarn migration:run`.

### Auth0 401 on every request

- Verify `AUTH0_ISSUER_URL` ends with a trailing slash: `https://tenant.auth0.com/`
- Verify `AUTH0_AUDIENCE` matches exactly what is configured in the Auth0 API settings.
- Verify the JWT is being passed as `Authorization: Bearer <token>`.

### `AUTH0_USER_ROLE` or `AUTH0_ADMIN_ROLE` — role not applied

Role IDs look like `rol_AbCdEfGhIjKlMnOp`. Get them from Auth0 Dashboard → User Management → Roles → copy the ID from the URL.

### Gmail emails not sending

- Verify `GMAIL_REFRESH_TOKEN` is still valid (tokens can be revoked).
- Regenerate via [Google OAuth2 Playground](https://developers.google.com/oauthplayground) if needed.
- Check that `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are from the same Google Cloud project.

### Puppeteer / PDF generation fails locally

On Linux, install Chromium dependencies:

```bash
sudo apt-get install -y chromium-browser libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

On macOS, Puppeteer downloads Chromium automatically during `yarn install`. If it fails:

```bash
cd apps/api && node node_modules/puppeteer/install.js
```

### `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` error

This key must be exactly 32 bytes (Base64-encoded). Generate one:

```bash
openssl rand -base64 32
```

### Dashboard shows blank page / redirect loop

- Verify `AUTH0_BASE_URL=http://localhost:3001` matches the port your dashboard is running on.
- Clear browser cookies and retry.
- Check that the Auth0 callback URL is registered in the Auth0 application settings.
