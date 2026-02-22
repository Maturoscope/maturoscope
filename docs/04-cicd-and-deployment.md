# 04 — CI/CD and Deployment

## 1. Branching Strategy

| Branch | Purpose | Deployment |
|---|---|---|
| `main` | Stable, production-ready code | Auto-deploys to staging; manual sync to production |
| `feature/<ticket>-<description>` | Feature development | No auto-deploy |
| `fix/<ticket>-<description>` | Bug fixes | No auto-deploy |
| `hotfix/<description>` | Critical production fixes | Merges directly to `main`; triggers full pipeline |

**Rules:**
- `main` is protected — no direct pushes; all changes via pull request.
- PRs require passing CI checks (lint, type-check, tests) before merge.
- `main` always represents a deployable state.

---

## 2. CI Pipeline Stages (GitHub Actions)

The pipeline runs on every push to `main` and on pull requests targeting `main`.

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
├────────────┬────────────┬────────────┬───────────────────────┤
│   quality  │    test    │   build    │       deploy          │
├────────────┼────────────┼────────────┼───────────────────────┤
│ yarn lint  │ yarn test  │ docker     │ push to Harbor        │
│ type-check │ (unit)     │ build      │ update kustomize tag  │
│            │            │ (api/app/  │ Argo CD auto-sync     │
│            │            │  dashboard)│ (staging only)        │
└────────────┴────────────┴────────────┴───────────────────────┘
```

### Stage Details

**quality**
```yaml
- run: yarn install --frozen-lockfile
- run: yarn lint
- run: yarn check-types
```

**test**
```yaml
- run: cd apps/api && yarn test
```

**build** (runs only on `main` or tagged commits)
```yaml
- uses: docker/login-action → Harbor registry
- run: docker build -f apps/api/Dockerfile -t <registry>/maturoscope/api:<sha> .
- run: docker build -f apps/app/Dockerfile -t <registry>/maturoscope/app:<sha> .
- run: docker build -f apps/dashboard/Dockerfile -t <registry>/maturoscope/dashboard:<sha> .
- run: docker push (all three images)
```

**deploy** (runs only on `main`)
```yaml
- Checkout infra repository
- Update image tag in overlays/staging/kustomization.yaml
- Commit and push → triggers Argo CD sync
```

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `HARBOR_REGISTRY` | Registry hostname |
| `HARBOR_USERNAME` | Harbor robot account username |
| `HARBOR_PASSWORD` | Harbor robot account token |
| `INFRA_REPO_TOKEN` | PAT or deploy key for infra repository |
| `KUBECONFIG` | (Optional) direct kubectl access for emergency use |

---

## 3. Docker Build Strategy (Multi-Stage)

Each application uses a multi-stage Dockerfile to produce a minimal production image.

### apps/api (NestJS)

```dockerfile
# Stage 1 — Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json apps/api/
RUN yarn install --frozen-lockfile
COPY apps/api/ apps/api/
WORKDIR /app/apps/api
RUN yarn build

# Stage 2 — Runner
FROM node:20-alpine AS runner
WORKDIR /app
# Install Chromium for Puppeteer
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json .
RUN yarn install --production --frozen-lockfile
CMD ["node", "dist/run-migrations.js && node dist/main"]
```

**Notes:**
- Chromium is installed via Alpine `apk` — not via Puppeteer's bundled Chromium — to keep image size minimal.
- `run-migrations.js` ensures migrations run before the server starts on each deployment.

### apps/app and apps/dashboard (Next.js)

```dockerfile
# Stage 1 — Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build --filter=app   # or --filter=dashboard

# Stage 2 — Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/app/.next/standalone ./
COPY --from=builder /app/apps/app/.next/static ./.next/static
COPY --from=builder /app/apps/app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Next.js `output: 'standalone'` mode is required for minimal Docker images.

---

## 4. Image Tagging Strategy

Images are tagged using the **Git commit SHA** (short, 7 characters). No `latest` tag is used in any environment.

```
registry.example.com/maturoscope/api:a1b2c3d
registry.example.com/maturoscope/app:a1b2c3d
registry.example.com/maturoscope/dashboard:a1b2c3d
```

**Rationale:**
- Tags are immutable — a SHA uniquely identifies a build.
- Any deployment is traceable to a specific commit.
- Rollback = updating the tag in Kustomize to a previous SHA.
- No cache invalidation issues caused by mutable `latest` tags.

---

## 5. Harbor Usage & Image Scanning

Harbor is the private container registry provided by OVH. It is the sole source of images for all Kubernetes deployments.

**Configuration:**
- One project per environment (or a single project with tag-based separation).
- Robot accounts used by GitHub Actions — no personal credentials in CI.
- Image pull secrets configured in each Kubernetes namespace.

**Vulnerability Scanning:**
- Harbor's built-in Trivy scanner runs automatically on every pushed image.
- A scan policy can be configured to block deployments of images with `CRITICAL` vulnerabilities.
- Scan results are visible in the Harbor UI and via the Harbor API.

```bash
# Verify scan status via Harbor API
curl -u robot$ci:<token> \
  https://<harbor-host>/api/v2.0/projects/maturoscope/repositories/api/artifacts/<sha>/scan
```

---

## 6. GitOps Deployment Flow (Argo CD)

Argo CD is the continuous delivery controller. It watches the infra repository and reconciles the cluster state.

```
infra repo (overlays/staging/kustomization.yaml)
  │
  │  image tag updated by CI
  ▼
Argo CD detects diff (polling interval: 3 min, or webhook)
  │
  ▼
Argo CD applies Kustomize-rendered manifests to cluster
  │
  ▼
Kubernetes performs rolling update:
  - New pods scheduled
  - Readiness probe must pass before old pods are terminated
  - Zero-downtime if min replicas ≥ 2
```

### Argo CD Application Manifest (example)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: maturoscope-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/maturoscope-infra
    targetRevision: main
    path: overlays/staging
  destination:
    server: https://kubernetes.default.svc
    namespace: maturoscope-staging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

---

## 7. Argo CD Sync Model

| Environment | Sync Mode | Trigger |
|---|---|---|
| Staging | **Automated** (`automated.prune: true`) | Argo CD detects diff → syncs immediately |
| Production | **Manual** | Operator clicks "Sync" in Argo CD UI or via CLI |

**selfHeal:** Enabled in staging — if someone manually modifies cluster state, Argo CD reverts to the desired Git state within the polling interval.

**prune:** Enabled — resources removed from Git are deleted from the cluster on sync.

---

## 8. Rollback Strategy

Because images are tagged immutably by Git SHA, rollback is a Git operation:

```bash
# 1. Identify the last good SHA
git log --oneline apps/api/

# 2. In the infra repository, revert the image tag
# overlays/production/kustomization.yaml
images:
  - name: registry.example.com/maturoscope/api
    newTag: <previous-sha>    # ← revert this value

# 3. Commit and push
git commit -m "rollback: revert api to <previous-sha>"
git push

# 4. Trigger Argo CD sync (production: manual)
argocd app sync maturoscope-production
```

**Database rollback:** If a migration was applied with the bad deployment, it must be reverted separately:

```bash
# Via bastion tunnel (see docs/05-database.md)
ssh -L 5432:<db-private-ip>:5432 user@<bastion-floating-ip>

# In a separate terminal
cd apps/api
yarn migration:revert   # reverts the most recent migration
```

---

## 9. Production Safety Mechanisms

| Mechanism | Purpose |
|---|---|
| Manual Argo CD sync for production | No accidental auto-deployment to production |
| PodDisruptionBudget (minAvailable: 1) | Ensures availability during node pool maintenance |
| Readiness probes on all pods | Rolling updates only proceed when new pods are healthy |
| Liveness probes on all pods | Unhealthy pods are automatically restarted |
| Harbor vulnerability scanning | Blocks deployment of images with known critical CVEs |
| Immutable image tags | Prevents silent tag mutation; every deploy is auditable |
| Migration before startup | `run-migrations.js` runs before `main.js`; server never starts on a mismatched schema |
| Resource limits on pods | Prevents a single pod from consuming all node resources (especially Puppeteer) |
| Separate staging environment | All changes validated in staging before production promotion |

### Health Check Endpoints

| App | Endpoint | Purpose |
|---|---|---|
| `apps/api` | `GET /health` | Kubernetes liveness probe |
| `apps/app` | `GET /api/health` | Kubernetes liveness probe |
| `apps/app` | `GET /api/ready` | Kubernetes readiness probe |
| `apps/dashboard` | `GET /api/health` | Kubernetes liveness probe |
