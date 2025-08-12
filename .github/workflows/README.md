# GitHub Actions CI/CD Setup

Este workflow construye automáticamente las imágenes Docker del monorepo de forma inteligente, similar a GitLab CI/CD.

## 🚀 Características del Workflow Inteligente

### **Detección de Cambios:**
- ✅ **Análisis automático:** Detecta qué aplicaciones cambiaron
- ✅ **Builds selectivos:** Solo construye lo que necesita actualización
- ✅ **Optimización:** Ahorra tiempo y recursos de CI/CD

### **Jobs Separados:**
- 🔍 **`check-changes`** - Analiza qué archivos cambiaron
- 🏗️ **`build-api`** - Construye API solo si cambió
- 🏗️ **`build-app`** - Construye App solo si cambió  
- 🏗️ **`build-dashboard`** - Construye Dashboard solo si cambió
- 📋 **`summary`** - Resumen final de lo que se construyó

### **Comportamiento Inteligente:**

#### **Si solo cambias la API:**
```
✅ check-changes
✅ build-api (se ejecuta)
⏭️ build-app (se salta)
⏭️ build-dashboard (se salta)
✅ summary
```

#### **Si cambias solo el dashboard:**
```
✅ check-changes
⏭️ build-api (se salta)
⏭️ build-app (se salta)
✅ build-dashboard (se ejecuta)
✅ summary
```

#### **Si cambias packages compartidos:**
```
✅ check-changes
✅ build-api (se ejecuta - depende de packages)
✅ build-app (se ejecuta - depende de packages)
✅ build-dashboard (se ejecuta - depende de packages)
✅ summary
```

## 🔐 Configuración de Secrets

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

### **Secrets para Production:**
```
PROD_DATABASE_URL=postgresql://user:pass@prod-host:5432/db
PROD_JWT_SECRET=your-production-secret-key
PROD_GOOGLE_MAPS_API_KEY=your-production-google-maps-key
PROD_GATEWAY_URL=https://api.yourapp.com
```

### **Secrets para Staging (opcionales):**
```
STAGING_DATABASE_URL=postgresql://user:pass@staging-host:5432/db
STAGING_JWT_SECRET=your-staging-secret-key
STAGING_GOOGLE_MAPS_API_KEY=your-staging-google-maps-key
STAGING_GATEWAY_URL=https://staging-api.yourapp.com
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
- GitHub → Actions → CI - Smart Docker Build
- Cada job muestra el progreso paso a paso
- Los logs incluyen información detallada de cada build
- Resumen final muestra qué se construyó y qué se saltó

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

## 🎯 Ventajas del Sistema Inteligente

1. **⚡ Velocidad:** Solo construye lo necesario
2. **💰 Economía:** Ahorra recursos de CI/CD
3. **👁️ Visibilidad:** Jobs separados como GitLab
4. **🧠 Inteligencia:** Detección automática de cambios
5. **🔄 Flexibilidad:** Se adapta a diferentes tipos de cambios
