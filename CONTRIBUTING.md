# Contributing to Maturoscope

We welcome contributions to Maturoscope! This document provides guidelines and information for contributors.

If you want to contribute to Maturoscope, be sure to review these guidelines. This project adheres to Maturoscope's [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

We use [GitHub Issues](https://github.com/Maturoscope/maturoscope/issues) for tracking requests and bugs.

The Maturoscope project strives to abide by generally accepted best practices in open-source software development.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:
- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node.js version, browser)

### Suggesting Features

Feature requests are welcome. Please:
- Use a clear and descriptive title
- Describe the problem your feature would solve
- Describe the solution you'd like
- Consider alternative solutions

### Submitting Pull Requests

1. Fork the repository
2. Create your feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Ensure your code follows the project's coding standards
5. Run linting and type checks:
   ```bash
   yarn lint
   yarn check-types
   ```
6. Commit your changes using [Conventional Commits](#commit-message-convention)
7. Push to your fork and submit a pull request

## Development Setup

For a complete development setup guide, see [Initial Setup Guide](./docs/06-setup-initial.md).

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Maturoscope/maturoscope.git
cd maturoscope

# Install dependencies
yarn install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env files with your local configuration

# Start the database
cd apps/api && docker-compose up -d db

# Run migrations and seed data
yarn migration:run
yarn seed

# Start all applications
cd ../..
yarn dev
```

### Project Structure

This is a Turborepo monorepo with three applications:

- **`apps/api`** - NestJS backend API (Port 8000)
- **`apps/app`** - Next.js public frontend (Port 3000)
- **`apps/dashboard`** - Next.js admin dashboard (Port 3001)

## Coding Standards

### General

- Write code in **TypeScript**
- Follow the existing code patterns and conventions
- Keep changes focused and minimal — avoid unrelated changes in the same PR

### Linting & Formatting

We use ESLint and Prettier to maintain code quality:

```bash
# Lint all code
yarn lint

# Format code
yarn format

# Type check
yarn check-types
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, no logic change)
- `refactor:` — Code refactoring (no feature or bug fix)
- `test:` — Adding or updating tests
- `chore:` — Build process, dependencies, or tooling changes

**Examples:**
```
feat(api): add endpoint for exporting assessment results
fix(app): resolve PDF overflow when many services are present
docs: update contributing guidelines
chore: upgrade NestJS to v11
```

## Pull Request Process

### Before Submitting

- [ ] Your code builds without errors (`yarn build`)
- [ ] Linting passes (`yarn lint`)
- [ ] Type checks pass (`yarn check-types`)
- [ ] You have tested your changes locally
- [ ] You have added/updated documentation if needed

### PR Guidelines

- Keep PRs focused on a single change
- Write a clear title and description
- Reference related issues (e.g., `Closes #123`)
- Include screenshots for UI changes
- Respond to review feedback promptly

### Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## Branch Strategy

- `main` — Production-ready code
- `feature/*` — New features
- `fix/*` — Bug fixes
- `docs/*` — Documentation updates

Always create branches from `main` and submit PRs back to `main`.

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md). **Do not create a public issue for security vulnerabilities.**

## License

By contributing to Maturoscope, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

## Questions?

If you have questions about contributing, please open a [GitHub Discussion](https://github.com/Maturoscope/maturoscope/discussions) or contact us at **contact@nobatek.com**.


Thank you for contributing to Maturoscope!
