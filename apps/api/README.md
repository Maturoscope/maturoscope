<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Maturoscope API

This is the NestJS API backend for Maturoscope project.

## 🚀 Quick Setup

### Prerequisites

- Node.js >= 18
- Yarn 3.6.4
- Docker and Docker Compose
- PostgreSQL (via Docker)

### 1. Environment Variables Setup

**IMPORTANT:** Before starting the application, you must create the required environment variables.

Create a `.env` file in this directory (`apps/api/`) with the following content:

```bash
# Database Configuration
DB_PASSWORD=your_secure_password_here
DB_NAME=maturoscope_db
```

**⚠️ Security Notes:**

- Replace `your_secure_password_here` with a strong, secure password
- Never commit the `.env` file to version control
- The database name `maturoscope_db` will be created automatically

### 2. Database Setup

Start the PostgreSQL database using Docker Compose:

```bash
# Navigate to the API directory
cd apps/api

# Start the database container
docker-compose up -d db

# Verify the database is running
docker ps
```

You should see a container named `maturoscope-db` running on port 5432.

### 3. Install Dependencies

```bash
yarn install
```

### 4. Start Development Server

```bash
# Start in development mode with hot reload
yarn dev

# Or start in watch mode
yarn start:dev
```

The API will be available at `http://localhost:3000` (or the configured port).

## 🗄️ Database Management

### Start Database

```bash
docker-compose up -d db
```

### Stop Database

```bash
docker-compose down
```

### View Database Logs

```bash
docker-compose logs db
```

### Reset Database (⚠️ This will delete all data)

```bash
docker-compose down -v
docker-compose up -d db
```

### Connect to Database Directly

```bash
# Using psql (if you have PostgreSQL client installed)
psql -h localhost -p 5432 -U postgres -d maturoscope_db

# Or using Docker
docker exec -it maturoscope-db psql -U postgres -d maturoscope_db
```

## 📝 Available Scripts

```bash
# Development
yarn dev              # Start in development mode
yarn start:dev        # Start in watch mode
yarn start:debug      # Start in debug mode

# Production
yarn build           # Build the application
yarn start           # Start production server
yarn start:prod      # Start production server

# Testing
yarn test            # Run unit tests
yarn test:watch      # Run tests in watch mode
yarn test:cov        # Run tests with coverage
yarn test:e2e        # Run end-to-end tests

# Code Quality
yarn lint            # Lint code
yarn format          # Format code with Prettier
```

## 🔧 Configuration

### Database Connection

The API connects to PostgreSQL using the following configuration:

- **Host**: localhost
- **Port**: 5432
- **Database**: `maturoscope_db` (from DB_NAME env var)
- **Username**: postgres
- **Password**: From `DB_PASSWORD` environment variable

### Environment Variables Reference

| Variable      | Required | Description         | Default          |
| ------------- | -------- | ------------------- | ---------------- |
| `DB_PASSWORD` | ✅       | PostgreSQL password | -                |
| `DB_NAME`     | ✅       | Database name       | `maturoscope_db` |

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run end-to-end tests
yarn test:e2e
```

## 🐛 Troubleshooting

### Database Connection Issues

1. **Check if Docker is running:**

   ```bash
   docker --version
   ```

2. **Check if database container is up:**

   ```bash
   docker ps | grep maturoscope-db
   ```

3. **Check database logs:**

   ```bash
   docker-compose logs db
   ```

4. **Verify environment variables:**

   ```bash
   cat .env
   ```

5. **Test database connection:**
   ```bash
   docker exec -it maturoscope-db psql -U postgres -d maturoscope_db -c "SELECT 1;"
   ```

### Port Conflicts

If port 5432 is already in use:

1. Stop other PostgreSQL instances
2. Or modify the port in `docker-compose.yaml`

### Build Issues

1. **Clear node_modules:**

   ```bash
   rm -rf node_modules
   yarn install
   ```

2. **Clear build cache:**
   ```bash
   rm -rf dist
   yarn build
   ```

## 📁 Project Structure

```
src/
├── app.controller.ts    # Main controller
├── app.service.ts       # Main service
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📄 License

This project is private and unlicensed.
