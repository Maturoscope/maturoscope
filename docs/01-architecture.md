# 01 — System Architecture

## 1. System Overview

Maturoscope is a multi-tenant technology readiness assessment platform. It allows organisations to evaluate their innovation projects against TRL (Technology Readiness Level), MkRL (Market Readiness Level), and MfRL (Manufacturing Readiness Level) scales, generate PDF reports, and connect users with relevant expert services.

The platform is composed of three applications sharing a single NestJS API backend:

| Application | Purpose | Default Port |
|---|---|---|
| `apps/api` | REST API — NestJS 11, TypeORM | 8000 |
| `apps/app` | Public assessment tool — Next.js 15 | 3000 |
| `apps/dashboard` | Admin dashboard — Next.js 15 | 3001 |

All applications are deployed as containerised workloads on **OVHcloud Managed Kubernetes Service (MKS)** in the **GRA (Gravelines)** region.

---

## 2. Infrastructure Components

| Component | Technology | Role |
|---|---|---|
| Kubernetes cluster | OVH MKS — GRA region | Container orchestration |
| Container registry | Harbor (OVH Managed) | Private image storage & scanning |
| GitOps controller | Argo CD | Declarative deployment |
| Database | OVH Managed PostgreSQL | Persistent data store |
| Private network | OVH vRack | Isolated DB/cluster connectivity |
| Bastion host | OVH instance + Floating IP | Secure DB access gateway |
| Ingress controller | Nginx Ingress | HTTP/HTTPS routing |
| TLS | cert-manager + Let's Encrypt | Automated certificate provisioning |
| CI pipeline | GitHub Actions | Build, test, push images |
| Authentication | Auth0 | Identity provider (JWT/JWKS) |
| Object storage | OVH S3 (eu-west-par) | File uploads, report assets |
| Email | Gmail OAuth2 via Nodemailer | Transactional email |

---

## 3. Kubernetes Architecture

The cluster runs in OVH MKS GRA region. Each application is deployed as an independent Kubernetes `Deployment` with its own `Service` and `HorizontalPodAutoscaler`.

```
Namespace: maturoscope-production
Namespace: maturoscope-staging
```

### Workloads per namespace

| Workload | Kind | Replicas (prod) |
|---|---|---|
| `api` | Deployment | 2 |
| `app` | Deployment | 2 |
| `dashboard` | Deployment | 2 |

### Supporting resources

- **ConfigMaps** — non-sensitive runtime configuration
- **Secrets** — environment credentials (managed via sealed-secrets or external-secrets)
- **Ingress** — Nginx Ingress with TLS termination
- **PodDisruptionBudgets** — ensure minimum availability during node maintenance
- **HPA** — scale `api` based on CPU/memory metrics

---

## 4. Networking Model

### 4.1 vRack (Private Network)

The PostgreSQL managed database and the MKS cluster nodes are connected via **OVH vRack**, a private Layer 2 network. Database traffic never traverses the public internet. The API pods communicate with PostgreSQL exclusively over this private subnet.

```
MKS Node Pool → vRack private subnet → OVH Managed PostgreSQL
```

### 4.2 Bastion Host

A dedicated OVH instance with a **Floating IP** acts as the sole SSH entry point for database administration (migrations, emergency access, pgdump). It has no other services running. Access is restricted by SSH key and firewall rules on the vRack subnet.

```
Developer → SSH → Bastion (Floating IP) → SSH tunnel → PostgreSQL (private IP)
```

### 4.3 Ingress

All public traffic enters through a single Nginx Ingress controller. TLS termination is handled at the Ingress level using Let's Encrypt certificates managed by cert-manager.

```
Internet → Load Balancer (OVH) → Nginx Ingress → Kubernetes Services
```

Ingress routing rules:

| Host | Backend Service |
|---|---|
| `api.maturoscope.io` | `api:8000` |
| `app.maturoscope.io` | `app:3000` |
| `dashboard.maturoscope.io` | `dashboard:3001` |

### 4.4 Internal Service Communication

All inter-service traffic within the cluster uses Kubernetes DNS (`service-name.namespace.svc.cluster.local`). No service mesh is used; communication is plain HTTP over the cluster network.

---

## 5. Security Model

| Layer | Mechanism |
|---|---|
| Identity | Auth0 — JWKS-signed JWTs validated on every request |
| API authorisation | NestJS Guards (`JwtAuthGuard`, role-based decorators) |
| Network segmentation | vRack isolates DB traffic; no public DB endpoint |
| DB access | Only via bastion tunnel or from cluster nodes |
| Image provenance | All images pulled from private Harbor registry; scanning enabled |
| Secrets at rest | Kubernetes Secrets (encrypted at rest in etcd); populated by CI |
| TLS | Enforced end-to-end at Ingress; internal cluster HTTP only |
| Container privileges | Non-root containers; read-only root filesystem where possible |
| RBAC | Kubernetes RBAC — Argo CD service account has minimal deploy permissions |

---

## 6. External Services

| Service | Provider | Usage |
|---|---|---|
| Identity Provider | Auth0 | User authentication, JWT issuance, role management |
| Object Storage | OVH S3 (eu-west-par) | Report PDFs, organisation avatars, file uploads |
| Email | Gmail OAuth2 / Nodemailer | User invitations, transactional notifications |
| Container Registry | Harbor (OVH Managed) | Docker image storage and vulnerability scanning |
| DNS | Configured externally | Domain resolution for public endpoints |

### Auth0 Configuration

The API validates JWTs using Auth0's JWKS endpoint. Two roles are defined:

- `AUTH0_USER_ROLE` — standard organisation user
- `AUTH0_ADMIN_ROLE` — platform administrator (full dashboard access)

The `integration-auth0` module handles Auth0 Management API calls (user creation, role assignment during invitation flow).

---

## 7. Design Decisions

| Decision | Rationale |
|---|---|
| Turborepo monorepo | Shared tooling, unified CI pipeline, consistent dependency management across all three apps |
| NestJS for API | Strong DI container, decorator-based module architecture, first-class TypeORM integration |
| Auth0 (external IdP) | Offloads auth complexity (MFA, password resets, social login) from the platform |
| OVH MKS GRA | French data residency, EU GDPR compliance, managed control plane |
| vRack for DB | Eliminates public DB exposure; private L2 network with no internet routing |
| Argo CD GitOps | Declarative state management; cluster state is always reconciled from Git |
| Harbor private registry | Image scanning at push time; no dependency on public Docker Hub in production |
| TypeORM migrations | Version-controlled schema evolution; migrations run at container startup in production |
| Puppeteer for PDF | Server-side PDF generation of assessment reports without a third-party SaaS |
| Gmail OAuth2 | Avoids SMTP password rotation; OAuth2 refresh token is long-lived and revocable |

---

## 8. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │  OVH Load   │
                    │  Balancer   │
                    └──────┬──────┘
                           │
              ┌────────────▼─────────────┐
              │    Nginx Ingress (TLS)    │
              └──┬──────────┬────────────┘
                 │          │          │
          ┌──────▼──┐  ┌────▼────┐  ┌──▼──────┐
          │   app   │  │   api   │  │dashboard│
          │ :3000   │  │  :8000  │  │  :3001  │
          └─────────┘  └────┬────┘  └─────────┘
                            │
              ┌─────────────▼──────────────┐
              │   OVH vRack (private L2)   │
              └─────────────┬──────────────┘
                            │
                   ┌────────▼────────┐
                   │  OVH Managed    │
                   │  PostgreSQL     │
                   └─────────────────┘

  Auth0 ◄──── JWT validation ────► api
  OVH S3 ◄───── S3 SDK ──────────► api
  Gmail ◄──── OAuth2/SMTP ────────► api

  GitHub Actions → Harbor → Argo CD → MKS GRA
  Bastion (Floating IP) → SSH tunnel → PostgreSQL
```
