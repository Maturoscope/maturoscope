# Security Policy

## Reporting a Vulnerability

The Maturoscope team takes security issues seriously. We appreciate your efforts to responsibly disclose your findings.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to **communication@nobatek.com** with the subject line: `[SECURITY] Maturoscope - <brief description>`.

### What to include in your report

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours of receiving your report
- **Initial Assessment**: Within 5 business days
- **Resolution**: Depending on severity, we aim to resolve critical issues within 30 days

### What to expect

1. You will receive an acknowledgment email confirming receipt of your report
2. We will investigate and validate the vulnerability
3. We will work on a fix and coordinate disclosure timing with you
4. We will credit you in the security advisory (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | Yes                |

## Scope

This security policy applies to the Maturoscope platform, including:

- `apps/api` - Backend API
- `apps/app` - Public assessment application
- `apps/dashboard` - Admin dashboard

## Best Practices for Contributors

- Never commit secrets, API keys, or credentials to the repository
- Use environment variables for all sensitive configuration
- Follow the `.env.example` files for guidance on required variables
- Report any accidentally exposed credentials immediately
