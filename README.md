# Maturoscope

A comprehensive technology readiness assessment platform built with Turborepo monorepo architecture.

## 🚀 Quick Start

**New to the project?** Start here: [Initial Setup Guide](./docs/06-setup-initial.md)

The setup guide will walk you through:
- Installing all prerequisites
- Setting up the database
- Configuring environment variables
- Running the applications
- Seeding initial data

## 📚 Documentation

| File | Description |
|---|---|
| [01-architecture.md](./docs/01-architecture.md) | System overview, infrastructure, networking, security model |
| [02-data-flow.md](./docs/02-data-flow.md) | Request lifecycle, auth flow, CI/CD flow, failure handling |
| [03-project-structure.md](./docs/03-project-structure.md) | Monorepo layout, module patterns, architectural conventions |
| [04-cicd-and-deployment.md](./docs/04-cicd-and-deployment.md) | CI pipeline, Docker strategy, Argo CD, rollback |
| [05-database.md](./docs/05-database.md) | Schema, bastion tunnel guide, migrations, backup & recovery |
| [06-setup-initial.md](./docs/06-setup-initial.md) | Developer onboarding — local setup, env vars, troubleshooting |
| [07-api-reference.md](./docs/07-api-reference.md) | API endpoints, auth, Swagger UI access, response codes |
| [DATABASE_DIAGRAM.dbml](./docs/DATABASE_DIAGRAM.dbml) | Visual ER diagram (paste into dbdiagram.io) |

## 🏗️ Project Structure

This is a Turborepo monorepo containing:

### Applications

- **`apps/api`** - NestJS backend API server (Port 8000)
- **`apps/app`** - Next.js frontend application (Port 3000)
- **`apps/dashboard`** - Next.js admin dashboard (Port 3001)

### Packages

- Shared packages and configurations (if any)

## 🛠️ Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.x
- **Yarn** 3.6.4
- **Docker** and **Docker Compose**
- **Git**

See the [Setup Guide](./docs/SETUP.md) for detailed installation instructions.

## ⚡ Quick Commands

### Install Dependencies

```bash
yarn install
```

### Run All Applications

```bash
yarn dev
```

This starts:
- API: http://localhost:8000
- App: http://localhost:3000
- Dashboard: http://localhost:3001

### Run Individual Applications

```bash
# API only
cd apps/api && yarn dev

# App only
cd apps/app && yarn dev

# Dashboard only
cd apps/dashboard && yarn dev
```

### Database Management

```bash
cd apps/api

# Start database
docker-compose up -d db

# Run migrations
yarn migration:run

# Seed database (creates sample data)
yarn seed
```

## 📖 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maturoscope
   ```

2. **Follow the [Setup Guide](./docs/SETUP.md)**
   - Install prerequisites
   - Configure environment variables
   - Set up the database
   - Run migrations and seed data

3. **Start developing**
   ```bash
   yarn dev
   ```

## 🔧 Development

### Code Quality

```bash
# Lint all code
yarn lint

# Format code
yarn format

# Type check
yarn check-types
```

### Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
cd apps/api && yarn test:watch
```

## 📝 Environment Variables

Each application requires specific environment variables. See:

- **API**: `apps/api/.env.example`
- **App**: Check `apps/app/` for environment requirements
- **Dashboard**: Check `apps/dashboard/` for environment requirements

Copy `.env.example` to `.env` and fill in the required values.

## 🗄️ Database

The project uses PostgreSQL managed via Docker. See:

- **[Database Documentation](./docs/DATABASE.md)** - Complete schema documentation
- **[Database Diagram](./docs/DATABASE_DIAGRAM.dbml)** - Visual ER diagram

### Database Commands

```bash
cd apps/api

# Start database
docker-compose up -d db

# Run migrations
yarn migration:run

# Seed with sample data
yarn seed

# Connect to database
docker exec -it maturoscope psql -U postgres -d maturoscope
```

## 🐛 Troubleshooting

Common issues and solutions are documented in the [Setup Guide](./docs/06-setup-initial.md#11-troubleshooting).

## 📦 Build

```bash
# Build all applications
yarn build

# Build specific application
yarn build --filter=api
yarn build --filter=app
yarn build --filter=dashboard
```

## 🤝 Contributing

1. Read the [Setup Guide](./docs/SETUP.md) to get your environment ready
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and unlicensed.

## 🔗 Useful Links

- [Turborepo Documentation](https://turborepo.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Need help?** Check the [Setup Guide](./docs/SETUP.md) or contact the team.
