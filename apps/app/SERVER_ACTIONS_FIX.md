# Solución para "Failed to find Server Action" en producción

## Problema
En producción con múltiples pods/instancias, Next.js genera una clave de encriptación diferente para cada pod, causando que las Server Actions fallen con el error:
```
Failed to find Server Action "x". This request might be from an older or newer deployment.
```

Seguido de errores `403 Forbidden` en todas las peticiones.

## Solución
Configurar la misma clave de encriptación en todas las instancias usando la variable de entorno `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.

## Cambios aplicados

### 1. Dockerfile (`apps/app/dockerfile`)
- Agregada variable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` en la fase INSTALLER (build time)
- Agregada variable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` en la fase RUNNER (runtime)

### 2. Configuración de infraestructura

#### Para Kubernetes:

```yaml
env:
- name: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
  value: "TU-CLAVE-AQUI"  # Genera con: openssl rand -base64 32
```

#### Para Docker Compose:

```yaml
environment:
  - NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=TU-CLAVE-AQUI
```

#### Para Docker run:

```bash
docker run -e NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="TU-CLAVE-AQUI" ...
```

## Generar una clave

```bash
openssl rand -base64 32
```

Ejemplo de salida:
```
Zt8oRoRLx1eT+2BBWBWydbwUl1xdpdHEhVLj8vGyDbE=
```

## ⚠️ IMPORTANTE

1. **USA LA MISMA CLAVE** en todas las instancias/pods
2. **NO CAMBIES LA CLAVE** entre despliegues
3. **GUARDA LA CLAVE** de forma segura (Kubernetes Secret, etc.)
4. **NO LA COMMITS** al repositorio

## Referencias
- [Next.js Server Actions Documentation](https://nextjs.org/docs/messages/failed-to-find-server-action)

