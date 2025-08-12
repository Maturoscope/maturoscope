# GitHub Actions CI/CD Setup

Este workflow construye automáticamente todas las imágenes Docker del monorepo cuando se hace push a las ramas `main` o `develop`.

## 🚀 Flujo de trabajo

### **Staging (rama `develop` o Pull Requests)**
- ✅ Construye todas las imágenes Docker
- ✅ Usa variables de entorno de staging
- ✅ **NO** hace push al registry (solo build local)

### **Production (rama `main`)**
- ✅ Construye todas las imágenes Docker
- ✅ Usa variables de entorno de production
- ✅ Hace push al GitHub Container Registry
- ✅ Crea tags con commit SHA y `latest`

## 🔐 Configuración de Secrets

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

### **Secrets para Staging:**
```
STAGING_DATABASE_URL=postgresql://user:pass@staging-host:5432/db
STAGING_JWT_SECRET=your-staging-secret-key
STAGING_GOOGLE_MAPS_API_KEY=your-staging-google-maps-key
STAGING_GATEWAY_URL=https://staging-api.yourapp.com
```

### **Secrets para Production:**
```
PROD_DATABASE_URL=postgresql://user:pass@prod-host:5432/db
PROD_JWT_SECRET=your-production-secret-key
PROD_GOOGLE_MAPS_API_KEY=your-production-google-maps-key
PROD_GATEWAY_URL=https://api.yourapp.com
```

## 📦 Imágenes generadas

**Nota:** Los nombres de repositorio se convierten automáticamente a minúsculas para cumplir con los requisitos de Docker.

### **Staging:**
- `ghcr.io/maturoscope/maturoscope/api:staging-{commit-sha}`
- `ghcr.io/maturoscope/maturoscope/app:staging-{commit-sha}`
- `ghcr.io/maturoscope/maturoscope/dashboard:staging-{commit-sha}`

### **Production:**
- `ghcr.io/maturoscope/maturoscope/api:production-{commit-sha}` + `:latest`
- `ghcr.io/maturoscope/maturoscope/app:production-{commit-sha}` + `:latest`
- `ghcr.io/maturoscope/maturoscope/dashboard:production-{commit-sha}` + `:latest`

## 🎯 Uso de las imágenes

### **Pull de imágenes:**
```bash
# Staging
docker pull ghcr.io/maturoscope/maturoscope/api:staging-abc123
docker pull ghcr.io/maturoscope/maturoscope/app:staging-abc123
docker pull ghcr.io/maturoscope/maturoscope/dashboard:staging-abc123

# Production
docker pull ghcr.io/maturoscope/maturoscope/api:latest
docker pull ghcr.io/maturoscope/maturoscope/app:latest
docker pull ghcr.io/maturoscope/maturoscope/dashboard:latest
```

### **Ejecutar contenedores:**
```bash
# API
docker run -p 8000:8000 ghcr.io/maturoscope/maturoscope/api:latest

# App
docker run -p 3000:3000 ghcr.io/maturoscope/maturoscope/app:latest

# Dashboard
docker run -p 3001:3001 ghcr.io/maturoscope/maturoscope/dashboard:latest
```

## 🔄 Triggers

El workflow se ejecuta en:
- ✅ Push a `main` → Build + Push Production
- ✅ Push a `develop` → Build Staging
- ✅ Pull Request a `main` → Build Staging
- ✅ Pull Request a `develop` → Build Staging

## 📊 Monitoreo

Puedes ver el estado de los builds en:
- GitHub → Actions → CI - Docker Build Monorepo
- Cada job muestra el progreso paso a paso
- Los logs incluyen información detallada de cada build

## 📁 Estructura de archivos

```
apps/
├── api/
│   └── Dockerfile          # API Dockerfile
├── app/
│   └── Dockerfile          # App Dockerfile
└── dashboard/
    └── Dockerfile          # Dashboard Dockerfile
```

## 🔧 Configuración automática

El workflow convierte automáticamente el nombre del repositorio a minúsculas:
- `Maturoscope/maturoscope` → `maturoscope/maturoscope`
- Esto cumple con los requisitos de Docker para nombres de repositorio
