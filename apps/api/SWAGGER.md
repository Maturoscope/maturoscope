# Maturoscope API Documentation

## Swagger/OpenAPI Access

The API documentation is available through Swagger UI:

### Local Development
- **URL:** `http://localhost:8000/api`
- **Environment:** Development

### Staging
- **URL:** `https://api-maturoscope.osc-fr1.scalingo.io/api-docs`
- **Environment:** Staging

### Production
- **URL:** `https://api.maturoscope.com/api-docs`
- **Environment:** Production

## Authentication

Most endpoints require JWT authentication obtained from Auth0. To use authenticated endpoints in Swagger:

1. Obtain a JWT token from Auth0:
   - Use the Auth0 login endpoint
   - Or use your dashboard application to get a token from browser dev tools

2. Click the **"Authorize"** button in Swagger UI (top right with a lock icon)

3. Enter your token in the following format:
   ```
   Bearer <your-jwt-token-here>
   ```

4. Click **"Authorize"** and then **"Close"**

5. All authenticated requests will now include the Authorization header automatically

## API Structure

### Modules

#### 🔐 **Users** (`/users`)
User management endpoints for creating, reading, updating, and deleting user accounts.
- **Authentication:** Required (except POST /users for registration)
- **Key endpoints:**
  - `GET /users` - List all users
  - `GET /users/organization/:organizationId` - Users by organization
  - `GET /users/email/:email` - User by email
  - `PATCH /users/:id` - Update user

#### 🏢 **Organizations** (`/organizations`)
Organization management including profiles, avatars, signatures, and settings.
- **Authentication:** Mixed (some public, most require authentication)
- **Key endpoints:**
  - `GET /organizations` - List organizations
  - `GET /organizations/key/:key` - Organization by key (PUBLIC)
  - `PATCH /organizations/avatar` - Update avatar (requires auth)
  - `PATCH /organizations/profile` - Update profile (requires auth)

#### 🛠️ **Services** (`/services`)
Service provider management and contact functionality.
- **Authentication:** Required (except POST /services/contact)
- **Key endpoints:**
  - `GET /services` - List organization services
  - `POST /services` - Create service
  - `POST /services/contact` - Contact services (PUBLIC)

#### 📊 **Statistics** (`/statistics`)
Analytics and tracking for assessments and user maturity levels.
- **Authentication:** Mixed (tracking endpoints are PUBLIC)
- **Key endpoints:**
  - `GET /statistics/dashboard` - Dashboard stats (requires auth)
  - `GET /statistics/reports` - Admin reports (requires admin role)
  - `POST /statistics/track-started` - Track assessment start (PUBLIC)
  - `POST /statistics/track-completed` - Track assessment completion (PUBLIC)
  - `POST /statistics/track-category` - Track user category/level (PUBLIC)

#### 📋 **Readiness Assessment** (`/readiness-assessment`)
Maturity assessment endpoints for TRL, MkRL, and MfRL scales.
- **Authentication:** PUBLIC (no authentication required)
- **Key endpoints:**
  - `GET /readiness-assessment/questions` - All questions (PUBLIC)
  - `GET /readiness-assessment/questions/:scale` - Questions by scale (PUBLIC)
  - `POST /readiness-assessment/assess` - Assess maturity level (PUBLIC)
  - `POST /readiness-assessment/analyze-risk` - Analyze overall risk (PUBLIC)

#### 📄 **Report** (`/report`)
PDF report generation for maturity assessments.
- **Authentication:** PUBLIC
- **Key endpoints:**
  - `POST /report/:locale` - Generate PDF report (PUBLIC)

#### 📧 **User Invitation** (`/user-invitation`)
User invitation and onboarding system.
- **Authentication:** Mixed
- **Key endpoints:**
  - `POST /user-invitation/invite` - Send invitation (requires auth)
  - `GET /user-invitation/verify` - Verify token (PUBLIC)
  - `POST /user-invitation/complete` - Complete registration (PUBLIC)
  - `POST /user-invitation/resend` - Resend invitation (requires auth)

#### 🔑 **Auth0** (`/auth0`)
Auth0 integration endpoints for role management.
- **Authentication:** Internal use
- **Key endpoints:**
  - `POST /auth0/assign-role` - Assign role to user

## Public vs Authenticated Endpoints

### Public Endpoints (No JWT Required)
These endpoints are designed to be called from the end-user application without authentication:

- `GET /organizations/key/:key` - Get organization by key
- `GET /readiness-assessment/questions` - Get all assessment questions
- `GET /readiness-assessment/questions/:scale` - Get questions by scale
- `POST /readiness-assessment/assess` - Assess maturity scale
- `POST /readiness-assessment/analyze-risk` - Analyze risk
- `POST /report/:locale` - Generate PDF report
- `POST /services/contact` - Contact services
- `POST /statistics/track-started` - Track assessment started
- `POST /statistics/track-completed` - Track assessment completed
- `POST /statistics/track-category` - Track user category/level
- `GET /user-invitation/verify` - Verify invitation token
- `POST /user-invitation/complete` - Complete invitation

### Authenticated Endpoints (JWT Required)
These endpoints require a valid JWT token from Auth0:

- All `/users` endpoints (except POST for registration)
- Most `/organizations` endpoints (avatar, signature, profile updates)
- All `/services` CRUD endpoints
- `/statistics/dashboard` and `/statistics/reports`
- `/user-invitation/invite` and `/user-invitation/resend`

### Admin-Only Endpoints
These endpoints require the `admin` role:

- `POST /organizations` - Create organization
- `GET /statistics/reports` - Get aggregated reports
- `GET /users/:id` - Get user by ID

## Environment Configuration

### Required Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=maturoscope
DB_SSL_CA_PATH=/path/to/ca-certificate.crt (optional)
DB_SSL_SERVERNAME=your-db-host.com (optional)

# Auth0
AUTH0_ISSUER_URL=https://your-domain.auth0.com/
AUTH0_AUDIENCE=https://your-api.com
AUTH0_USER_ROLE=rol_xxxxxxxxxxxxx
AUTH0_ADMIN_ROLE=rol_xxxxxxxxxxxxx
AUTH_DEBUG=false (set to 'true' for detailed auth logs)

# API
NODE_ENV=development|staging|production
PORT=8000
API_BASE_URL=http://localhost:8000

# OVH S3 Object Storage
OVH_S3_ENDPOINT=s3.gra.io.cloud.ovh.net
OVH_S3_REGION=gra
OVH_S3_ACCESS_KEY=your_access_key
OVH_S3_SECRET_KEY=your_secret_key
OVH_S3_BUCKET=your-bucket-name

# Gmail API (for sending emails)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
MAIL_USER=maturoscope@gmail.com
MAIL_FROM=maturoscope@gmail.com
APP_NAME=Maturoscope
```

### Swagger Path by Environment

- **Development:** `/api` (easier to access)
- **Production:** `/api-docs` (more professional)

This is automatically configured based on `NODE_ENV` in `main.ts`.

## Testing with Swagger

### 1. Testing Public Endpoints

Public endpoints can be tested directly without authentication:

1. Navigate to the endpoint in Swagger UI
2. Click "Try it out"
3. Fill in the required parameters
4. Click "Execute"

Example: Testing readiness assessment questions
```
GET /readiness-assessment/questions/TRL
```

### 2. Testing Authenticated Endpoints

1. **Get a JWT token** from your dashboard application:
   - Log in to the dashboard
   - Open browser developer tools (F12)
   - Go to Application > Cookies
   - Copy the `token` cookie value

2. **Authorize in Swagger:**
   - Click the "Authorize" button (lock icon)
   - Paste the token
   - Click "Authorize" then "Close"

3. **Test the endpoint:**
   - Navigate to any authenticated endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"

### 3. Testing with Organization Key

Many public endpoints require an `organizationKey` query parameter:

```
POST /readiness-assessment/assess?organizationKey=synopp
POST /services/contact?organizationKey=synopp
POST /statistics/track-started?organizationKey=synopp
```

Use the organization's unique key (e.g., "synopp") found in the organizations table.

## Response Codes

- **200 OK** - Successful GET/PATCH/DELETE request
- **201 Created** - Successful POST request (resource created)
- **204 No Content** - Successful DELETE request (no response body)
- **400 Bad Request** - Invalid input data or missing required fields
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Valid token but insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists
- **500 Internal Server Error** - Server error

## Best Practices

### For Frontend Developers

1. **Always handle errors gracefully** - Check for 401/403 and redirect to login
2. **Use organizationKey in public endpoints** - Get it from the URL or organization context
3. **Cache JWT tokens properly** - Store in httpOnly cookies for security
4. **Use correct Content-Type headers**:
   - `application/json` for most requests
   - `multipart/form-data` for file uploads (avatar, signature)

### For Backend Developers

1. **Add Swagger decorators** to all new endpoints
2. **Document all DTOs** with `@ApiProperty` and examples
3. **Use appropriate HTTP status codes** for responses
4. **Mark PUBLIC endpoints clearly** in the API description
5. **Add authentication guards** (`@Auth()`) to protected endpoints

## Support

For issues or questions about the API:
- **Email:** support@maturoscope.com
- **GitHub Issues:** (if applicable)
- **Slack:** #maturoscope-api (if internal)
