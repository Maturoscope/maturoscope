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

### **Secrets Compartidos:**
```
WORKFLOW_DISPATCH_TOKEN=ghp_xxxxxxxxxxxxx (Personal Access Token con permisos workflow + repo)
```

### **Secrets para Staging:**
```
# Harbor Registry Staging
HARBOR_USERNAME=your-staging-harbor-username
HARBOR_PASSWORD=your-staging-harbor-password

# App (Next.js) Staging
STAGING_GOOGLE_MAPS_API_KEY=your-staging-google-maps-key
STAGING_GATEWAY_URL=https://api.staging.yourapp.com
STAGING_NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=64-character-hex-string

# Dashboard Staging
STAGING_AUTH0_CLIENT_SECRET=your-staging-auth0-client-secret
STAGING_AUTH0_SECRET=your-staging-auth0-secret
STAGING_END_USER_URL=https://app.staging.yourapp.com
```

### **Secrets para Production:**
```
# Harbor Registry Production
PROD_HARBOR_USERNAME=your-production-harbor-username
PROD_HARBOR_PASSWORD=your-production-harbor-password

# App (Next.js) Production
PROD_GOOGLE_MAPS_API_KEY=your-production-google-maps-key
PROD_NEXT_PUBLIC_GATEWAY_URL=https://api.yourapp.com
PROD_NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=64-character-hex-string

# Dashboard Production
PROD_AUTH0_CLIENT_SECRET=your-production-auth0-client-secret
PROD_AUTH0_SECRET=your-production-auth0-secret
PROD_NEXT_PUBLIC_END_USER_URL=https://app.yourapp.com
```

### **Notas Importantes:**
- `PROD_NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` debe tener exactamente 64 caracteres hexadecimales (32 bytes)
- `WORKFLOW_DISPATCH_TOKEN` es compartido entre staging y producción
- Las credenciales de Harbor son diferentes para staging y producción
- Staging usa registry: `bv630390.c1.de1.container-registry.ovh.net`
- Production usa registry: `c8781u0i.eu-west-par.container-registry.ovh.net`


## 📦 Imágenes generadas

**Nota:** Los nombres de repositorio se convierten automáticamente a minúsculas para cumplir con los requisitos de Docker.

### **Staging (rama: develop, staging):**
Registry: `bv630390.c1.de1.container-registry.ovh.net`
- `bv630390.c1.de1.container-registry.ovh.net/maturoscope-api/api:staging-{timestamp}-{commit-sha}`
- `bv630390.c1.de1.container-registry.ovh.net/maturoscope-app/app:staging-{timestamp}-{commit-sha}`
- `bv630390.c1.de1.container-registry.ovh.net/maturoscope-dashboard/dashboard:staging-{timestamp}-{commit-sha}`

### **Production (rama: main):**
Registry: `c8781u0i.eu-west-par.container-registry.ovh.net`
- `c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-api/api:prod-{timestamp}-{commit-sha}`
- `c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-app/app:prod-{timestamp}-{commit-sha}`
- `c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-dashboard/dashboard:prod-{timestamp}-{commit-sha}`

## 🎯 Uso de las imágenes

### **Pull de imágenes:**
```bash
# Staging
docker pull bv630390.c1.de1.container-registry.ovh.net/maturoscope-api/api:staging-20260118-120000-abc123
docker pull bv630390.c1.de1.container-registry.ovh.net/maturoscope-app/app:staging-20260118-120000-abc123
docker pull bv630390.c1.de1.container-registry.ovh.net/maturoscope-dashboard/dashboard:staging-20260118-120000-abc123

# Production
docker pull c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-api/api:prod-20260118-120000-abc123
docker pull c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-app/app:prod-20260118-120000-abc123
docker pull c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-dashboard/dashboard:prod-20260118-120000-abc123
```

### **Ejecutar contenedores:**
```bash
# API
docker run -p 8000:8000 c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-api/api:prod-20260118-120000-abc123

# App
docker run -p 3000:3000 c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-app/app:prod-20260118-120000-abc123

# Dashboard
docker run -p 3001:3001 c8781u0i.eu-west-par.container-registry.ovh.net/maturoscope-dashboard/dashboard:prod-20260118-120000-abc123
```

## 🔄 Triggers

El workflow se ejecuta en:
- ✅ Push a `main` → Build + Push Production (Registry de producción)
- ✅ Push a `develop` → Build Staging (Registry de staging)
- ✅ Push a `staging` → Build Staging (Registry de staging)
- ✅ Pull Request a `main` → Build Staging
- ✅ Pull Request a `develop` → Build Staging
- ✅ Pull Request a `staging` → Build Staging

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
