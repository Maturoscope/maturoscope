# 05 — Database

## 1. Database Architecture

The platform uses **PostgreSQL** managed by OVHcloud. There is a single database instance serving all three applications through the NestJS API — neither `apps/app` nor `apps/dashboard` connects directly to the database.

| Property | Value |
|---|---|
| Engine | PostgreSQL (OVH Managed) |
| Database name | `maturoscope` |
| ORM | TypeORM 0.3.x |
| Schema management | TypeORM migrations (version-controlled) |
| Connection | Private vRack IP (no public endpoint) |

### Schema Summary

The schema has 5 tables:

```
organizations
    │
    ├── users (N:1 → organizations)
    ├── services (N:1 → organizations)
    │       └── service_gap_coverages (N:1 → services, CASCADE delete)
    └── organization_statistics (1:1 → organizations)
```

---

## 2. Table Reference

### `organizations`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY |
| `key` | varchar(50) | UNIQUE, NOT NULL |
| `name` | text | NOT NULL |
| `email` | varchar(255) | UNIQUE, NOT NULL |
| `font` | text | NULLABLE |
| `theme` | text | NULLABLE |
| `signature` | text | NULLABLE |
| `language` | text | NULLABLE |
| `avatar` | text | NULLABLE (S3 URL) |
| `status` | enum(`active`,`inactive`) | NOT NULL, DEFAULT `active` |
| `createdAt` | timestamp | NOT NULL, DEFAULT `now()` |

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY |
| `organizationId` | uuid | NULLABLE, FK → organizations.id |
| `authId` | text | NULLABLE (Auth0 user ID) |
| `firstName` | text | NOT NULL |
| `lastName` | text | NOT NULL |
| `roles` | text[] | NULLABLE (simple-array: `admin`, `user`) |
| `email` | varchar(255) | UNIQUE, NOT NULL |
| `isActive` | boolean | NOT NULL, DEFAULT `true` |
| `createdAt` | timestamp | NOT NULL, DEFAULT `now()` |

### `services`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY |
| `organizationId` | uuid | NOT NULL, FK → organizations.id |
| `name` / `nameEn` / `nameFr` | varchar(255) | NULLABLE (multilingual) |
| `description` / `descriptionEn` / `descriptionFr` | text | NULLABLE (multilingual) |
| `url` | varchar(500) | NULLABLE |
| `mainContactFirstName/LastName/Email` | varchar | NULLABLE |
| `secondaryContactFirstName/LastName/Email` | varchar | NULLABLE |
| `createdAt` / `updatedAt` | timestamp | NOT NULL |

### `service_gap_coverages`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY |
| `serviceId` | uuid | NOT NULL, FK → services.id (CASCADE DELETE) |
| `questionId` | varchar(20) | NOT NULL |
| `level` | integer | NOT NULL (1–9) |
| `scaleType` | enum(`TRL`,`MkRL`,`MfRL`) | NOT NULL |
| `createdAt` | timestamp | NOT NULL |

**Unique constraint:** `(serviceId, questionId, level)` — prevents duplicate gap coverage mappings.

### `organization_statistics`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY |
| `organizationId` | uuid | NOT NULL, UNIQUE, FK → organizations.id |
| `startedAssessments` | integer | NOT NULL, DEFAULT `0` |
| `completedAssessments` | integer | NOT NULL, DEFAULT `0` |
| `contactedServices` | integer | NOT NULL, DEFAULT `0` |
| `usersByCategoryAndLevel` | jsonb | NOT NULL, DEFAULT `{"TRL":{}, "MkRL":{}, "MfRL":{}}` |
| `createdAt` / `updatedAt` | timestamp | NOT NULL |

---

## 3. Private Networking (vRack)

The PostgreSQL instance has **no public IP**. It is accessible only via the OVH vRack private network shared with the MKS cluster.

```
MKS pod (api) → vRack private subnet → OVH Managed PostgreSQL
                 10.x.x.x/xx
```

**Implications:**
- The database cannot be accessed directly from a developer's machine.
- All direct DB access (migrations, debugging, dumps) must go through the bastion host via SSH tunnel.
- The `DB_HOST` environment variable in production contains the private vRack IP of the PostgreSQL instance.

---

## 4. Bastion SSH Tunnel Guide

The bastion host is an OVH instance with a Floating IP. It is the only machine on the vRack with a public-facing IP. SSH access requires an authorised key pair.

### Prerequisites

- SSH private key added to your local `~/.ssh/` directory.
- Your public key registered on the bastion host.
- PostgreSQL private IP (obtain from OVH control panel or the team).

### Open an SSH Tunnel

```bash
ssh -N -L 5432:<DB_PRIVATE_IP>:5432 <BASTION_USER>@<BASTION_FLOATING_IP> -i ~/.ssh/maturoscope-bastion
```

| Parameter | Description |
|---|---|
| `-N` | Do not execute remote commands (tunnel only) |
| `-L 5432:<DB_PRIVATE_IP>:5432` | Forward local port 5432 to the DB private IP via bastion |
| `<BASTION_USER>` | SSH user on the bastion (e.g., `ubuntu`) |
| `<BASTION_FLOATING_IP>` | Public Floating IP of the bastion |

Keep this terminal open while working with the database.

### Connect to PostgreSQL (in a new terminal)

```bash
psql -h localhost -p 5432 -U postgres -d maturoscope
```

Or using environment variables:

```bash
PGPASSWORD=<DB_PASS> psql -h localhost -p 5432 -U <DB_USER> -d maturoscope
```

### Run Migrations via Tunnel

```bash
# Terminal 1: open tunnel
ssh -N -L 5432:<DB_PRIVATE_IP>:5432 ubuntu@<BASTION_FLOATING_IP> -i ~/.ssh/maturoscope-bastion

# Terminal 2: run migrations (pointing to localhost:5432)
cd apps/api
DB_HOST=localhost DB_PORT=5432 yarn migration:run
```

### Dump the Database

```bash
# With tunnel open
pg_dump -h localhost -p 5432 -U postgres -d maturoscope -F c -f maturoscope_$(date +%Y%m%d).dump
```

### Restore a Dump

```bash
pg_restore -h localhost -p 5432 -U postgres -d maturoscope -F c maturoscope_20260101.dump
```

---

## 5. Migration Strategy

TypeORM CLI is used for all schema changes. Migrations are stored in `apps/api/src/migrations/` and version-controlled in Git.

### Migration Workflow

```bash
cd apps/api

# 1. Make changes to an entity file

# 2. Generate migration (compares entity state vs DB state)
yarn migration:generate src/migrations/<MigrationName>

# 3. Review the generated migration file — verify it is correct

# 4. Apply locally
yarn migration:run

# 5. Commit the migration file with the entity change in the same commit
git add src/migrations/ src/modules/<feature>/entities/
git commit -m "feat: add avatar column to organizations"
```

### Production Migration

Migrations run automatically in production at container startup via `run-migrations.ts`. The API process does not start until all pending migrations succeed.

```
Container starts
  → node dist/run-migrations.js   ← runs all pending TypeORM migrations
  → node dist/main.js             ← starts NestJS server
```

**If a migration fails in production**, the container exits with a non-zero code. Kubernetes restarts the pod. The previous Deployment revision (with the old image) must be rolled back (see `04-cicd-and-deployment.md`).

### Migration Commands Reference

```bash
yarn migration:run       # Apply all pending migrations
yarn migration:revert    # Revert the most recent migration
yarn migration:show      # List applied and pending migrations
yarn migration:generate  # Generate migration from entity diff
yarn migration:create    # Create an empty migration file
```

---

## 6. Backup & Recovery Strategy

OVH Managed PostgreSQL includes automated daily backups with a configurable retention period. In addition:

### Automated Backups (OVH)

- Daily snapshots managed by OVH.
- Retention: configure in the OVH control panel (default: 7 days, recommended: 14+ days for production).
- Point-in-time recovery available within the retention window.
- Restore via OVH control panel → Databases → your cluster → Backups.

### Manual Backup (via Bastion Tunnel)

Run before any significant schema migration or data operation:

```bash
# Open tunnel first (see Section 4)

# Create compressed dump
pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d maturoscope \
  -F c \
  -f "maturoscope_manual_$(date +%Y%m%d_%H%M%S).dump"
```

Store manual dumps in OVH S3:

```bash
aws s3 cp maturoscope_manual_*.dump s3://<backup-bucket>/db-dumps/ \
  --endpoint-url https://s3.eu-west-par.io.cloud.ovh.net
```

### Recovery Procedure

1. **Minor issues** (data error, bad migration): revert migration via `yarn migration:revert` + fix data manually via psql tunnel.
2. **Major issues** (data corruption): restore from OVH snapshot via control panel, then reapply any migrations that post-date the snapshot.
3. **Point-in-time recovery**: contact OVH support for WAL-based PITR if available for your cluster plan.

---

## 7. Security Model

| Control | Implementation |
|---|---|
| No public endpoint | PostgreSQL bound to vRack private IP only |
| Access via bastion | SSH key authentication; password auth disabled |
| DB credentials | Stored as Kubernetes Secret; never in Git |
| Least privilege | API uses a single DB user with DML rights; no DDL rights in production |
| Encryption at rest | OVH Managed PostgreSQL encrypts data at rest by default |
| Encryption in transit | TLS enforced between API pods and PostgreSQL |
| Audit logging | PostgreSQL `log_connections` and `log_disconnections` enabled |
| Bastion hardening | Fail2ban, no password auth, minimal installed packages |

---

## 8. Environment Variables

All database configuration is injected via environment variables. No connection strings are hardcoded.

| Variable | Description | Example (local) |
|---|---|---|
| `DB_HOST` | PostgreSQL hostname or private IP | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASS` | Database password | `<secure-value>` |
| `DB_NAME` | Database name | `maturoscope` |

In production, these are populated from the Kubernetes Secret named `maturoscope-db-secret` in the `maturoscope-production` namespace.

```bash
# Inspect (base64-decoded) — requires cluster access
kubectl get secret maturoscope-db-secret \
  -n maturoscope-production \
  -o jsonpath='{.data.DB_PASS}' | base64 -d
```
