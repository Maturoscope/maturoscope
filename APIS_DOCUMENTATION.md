# 📚 Documentación de APIs - Services y Readiness Assessment

## 🔐 APIs de Servicios (Autenticadas - Para Administradores)

Todas estas APIs requieren autenticación mediante token en las cookies. La organización se identifica automáticamente desde el token del usuario.

---

### 1. **Listar Todos los Servicios**

**Endpoint:** `GET /api/services`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:** Ninguno

**Response:**

```json
[
  {
    "id": "uuid-del-servicio",
    "name": "Innovation Readiness Check",
    "description": "Service that helps with TRL levels 1-3",
    "url": "https://example.com/service",
    "mainContact": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "secondaryContact": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "scales": [
      {
        "type": "TRL",
        "levels": [1, 2, 3]
      },
      {
        "type": "MkRL",
        "levels": [4, 5, 6]
      }
    ]
  }
]
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services");
const services = await response.json();
```

---

### 2. **Obtener un Servicio por ID**

**Endpoint:** `GET /api/services/:id`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:**

- `id` (path parameter): UUID del servicio

**Response:**

```json
{
  "id": "uuid-del-servicio",
  "name": "Innovation Readiness Check",
  "description": "Service that helps with TRL levels 1-3",
  "url": "https://example.com/service",
  "mainContactFirstName": "John",
  "mainContactLastName": "Doe",
  "mainContactEmail": "john@example.com",
  "secondaryContactFirstName": "Jane",
  "secondaryContactLastName": "Smith",
  "secondaryContactEmail": "jane@example.com",
  "gapCoverages": [
    {
      "questionId": "TRL_Q1",
      "level": 1,
      "scaleType": "TRL"
    },
    {
      "questionId": "TRL_Q1",
      "level": 2,
      "scaleType": "TRL"
    }
  ]
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services/uuid-del-servicio");
const service = await response.json();
```

---

### 3. **Crear un Nuevo Servicio**

**Endpoint:** `POST /api/services`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:** Ninguno

**Body:**

```json
{
  "name": "Innovation Readiness Check",
  "description": "Service that helps organizations assess their technology readiness levels",
  "url": "https://example.com/service",
  "mainContactFirstName": "John",
  "mainContactLastName": "Doe",
  "mainContactEmail": "john@example.com",
  "secondaryContactFirstName": "Jane",
  "secondaryContactLastName": "Smith",
  "secondaryContactEmail": "jane@example.com",
  "gapCoverages": [
    {
      "questionId": "TRL_Q1",
      "level": 1,
      "scaleType": "TRL"
    },
    {
      "questionId": "TRL_Q1",
      "level": 2,
      "scaleType": "TRL"
    },
    {
      "questionId": "TRL_Q1",
      "level": 3,
      "scaleType": "TRL"
    },
    {
      "questionId": "MkRL_Q1",
      "level": 4,
      "scaleType": "MkRL"
    }
  ]
}
```

**Validaciones:**

- `name`: Requerido, 1-255 caracteres
- `description`: Requerido, mínimo 1 carácter
- `url`: Requerido, debe ser una URL válida, máximo 500 caracteres
- `mainContactFirstName`: Requerido, 1-100 caracteres
- `mainContactLastName`: Requerido, 1-100 caracteres
- `mainContactEmail`: Requerido, email válido, máximo 255 caracteres
- `secondaryContactFirstName`: Requerido, 1-100 caracteres
- `secondaryContactLastName`: Requerido, 1-100 caracteres
- `secondaryContactEmail`: Requerido, email válido, máximo 255 caracteres
- `gapCoverages`: Requerido, array con mínimo 1 elemento
  - `questionId`: String (ej: "TRL_Q1")
  - `level`: Número entero entre 1-9
  - `scaleType`: Enum ("TRL", "MkRL", "MfRL")

**Response:**

```json
{
  "id": "uuid-generado",
  "name": "Innovation Readiness Check",
  "description": "Service that helps organizations assess their technology readiness levels",
  "url": "https://example.com/service",
  "mainContactFirstName": "John",
  "mainContactLastName": "Doe",
  "mainContactEmail": "john@example.com",
  "secondaryContactFirstName": "Jane",
  "secondaryContactLastName": "Smith",
  "secondaryContactEmail": "jane@example.com",
  "gapCoverages": [...]
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Innovation Readiness Check",
    description:
      "Service that helps organizations assess their technology readiness levels",
    url: "https://example.com/service",
    mainContactFirstName: "John",
    mainContactLastName: "Doe",
    mainContactEmail: "john@example.com",
    secondaryContactFirstName: "Jane",
    secondaryContactLastName: "Smith",
    secondaryContactEmail: "jane@example.com",
    gapCoverages: [
      { questionId: "TRL_Q1", level: 1, scaleType: "TRL" },
      { questionId: "TRL_Q1", level: 2, scaleType: "TRL" },
    ],
  }),
});
const newService = await response.json();
```

---

### 4. **Actualizar un Servicio**

**Endpoint:** `PATCH /api/services/:id`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:**

- `id` (path parameter): UUID del servicio

**Body:** (Todos los campos son opcionales)

```json
{
  "name": "Updated Service Name",
  "description": "Updated description",
  "url": "https://updated-url.com",
  "mainContactFirstName": "Updated",
  "mainContactLastName": "Name",
  "mainContactEmail": "updated@example.com",
  "secondaryContactFirstName": "Updated",
  "secondaryContactLastName": "Name",
  "secondaryContactEmail": "updated@example.com",
  "gapCoverages": [
    {
      "questionId": "TRL_Q1",
      "level": 5,
      "scaleType": "TRL"
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid-del-servicio",
  "name": "Updated Service Name",
  "description": "Updated description"
  // ... resto de campos actualizados
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services/uuid-del-servicio", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Updated Service Name",
    description: "Updated description",
  }),
});
const updatedService = await response.json();
```

---

### 5. **Eliminar un Servicio**

**Endpoint:** `DELETE /api/services/:id`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:**

- `id` (path parameter): UUID del servicio

**Response:**

```json
{
  "success": true
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services/uuid-del-servicio", {
  method: "DELETE",
});
const result = await response.json();
```

---

### 6. **Obtener Opciones de Satisfacción (Satisfaction Options)**

**Endpoint:** `GET /api/services/satisfaction-options`

**Autenticación:** ✅ Requerida (token en cookie)

**Parámetros:** Ninguno

**Response:**

```json
{
  "TRL_Q1": {
    "1": {
      "en": "The concept is only described informally.",
      "fr": "Le concept n'est décrit que de manière informelle."
    },
    "2": {
      "en": "A brief formalization is available...",
      "fr": "Une formalisation brève est disponible..."
    }
  },
  "TRL_Q2": {
    "1": { "en": "...", "fr": "..." },
    "2": { "en": "...", "fr": "..." }
  }
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/services/satisfaction-options");
const options = await response.json();
```

---

## 🌐 APIs de Readiness Assessment (Públicas - Para Usuarios Finales)

Estas APIs son **públicas** y no requieren autenticación. Se usan para evaluar el readiness de usuarios finales.

---

### 7. **Obtener Todas las Preguntas**

**Endpoint:** `GET /api/readiness-assessment/questions`

**Autenticación:** ❌ No requerida (público)

**Parámetros:** Ninguno

**Response:**

```json
{
  "TRL": {
    "name": {
      "en": "Technology Readiness Level",
      "fr": "Niveau de maturité technologique"
    },
    "abbreviation": "TRL",
    "questions": [
      {
        "id": "TRL_Q1",
        "question": {
          "en": "Is the technical concept formulated?",
          "fr": "Le concept technique est-il formulé ?"
        },
        "levels": {
          "1": {
            "en": "The concept is only described informally.",
            "fr": "Le concept n'est décrit que de manière informelle."
          },
          "2": {
            "en": "A brief formalization is available...",
            "fr": "Une formalisation brève est disponible..."
          }
        }
      }
    ]
  },
  "MkRL": { ... },
  "MfRL": { ... }
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch("/api/readiness-assessment/questions");
const questions = await response.json();
```

---

### 8. **Evaluar una Escala (Assess Scale)**

**Endpoint:** `POST /api/readiness-assessment/assess?organizationKey=synoop`

**Autenticación:** ❌ No requerida (público)

**Parámetros:**

- `organizationKey` (query parameter): Key única de la organización (ej: "synoop", "nobatek")

**Body:**

```json
{
  "scale": "TRL",
  "answers": {
    "TRL_Q1": "5",
    "TRL_Q2": "4",
    "TRL_Q3": "6",
    "TRL_Q4": "3",
    "TRL_Q5": "5",
    "TRL_Q6": "4",
    "TRL_Q7": "5"
  }
}
```

**Validaciones:**

- `scale`: Enum requerido ("TRL", "MkRL", "MfRL")
- `answers`: Objeto requerido con todas las preguntas de la escala respondidas
  - Keys: IDs de preguntas (ej: "TRL_Q1", "TRL_Q2")
  - Values: Niveles seleccionados como strings (ej: "1", "2", "3", ..., "9")

**Response:**

```json
{
  "scale": "TRL",
  "readinessLevel": 3,
  "lowestLevels": [
    {
      "questionId": "TRL_Q4",
      "questionText": {
        "en": "Is the technical concept validated?",
        "fr": "Le concept technique est-il validé ?"
      },
      "selectedLevel": "3"
    }
  ],
  "developmentPhase": {
    "phase": 1,
    "phaseName": {
      "en": "Conceptualization & Research",
      "fr": "Conceptualisation et recherche"
    },
    "focusGoal": {
      "en": "Validate concept and basic principles",
      "fr": "Valider le concept et les principes de base"
    },
    "scaleRange": "1-3"
  },
  "gaps": [
    {
      "questionId": "TRL_Q4",
      "level": 3,
      "gapDescription": {
        "en": "The concept needs further validation...",
        "fr": "Le concept nécessite une validation supplémentaire..."
      },
      "hasServices": true,
      "recommendedServices": [
        {
          "id": "uuid-del-servicio",
          "name": "Innovation Readiness Check",
          "description": "Service that helps with TRL levels 1-3",
          "url": "https://example.com/service",
          "mainContact": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com"
          },
          "secondaryContact": {
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@example.com"
          }
        }
      ]
    }
  ]
}
```

**Ejemplo de uso:**

```typescript
const response = await fetch(
  "/api/readiness-assessment/assess?organizationKey=synoop",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scale: "TRL",
      answers: {
        TRL_Q1: "5",
        TRL_Q2: "4",
        TRL_Q3: "6",
        TRL_Q4: "3",
        TRL_Q5: "5",
        TRL_Q6: "4",
        TRL_Q7: "5",
      },
    }),
  }
);
const result = await response.json();
```

**Notas importantes:**

- El `readinessLevel` es el **mínimo** valor seleccionado entre todas las respuestas
- Los `gaps` se generan automáticamente basados en el nivel más bajo
- Los `recommendedServices` son servicios de la organización especificada que cubren esos gaps
- Si `hasServices: false`, significa que no hay servicios disponibles para ese gap específico

---

## 📝 Resumen de Endpoints

### Servicios (Autenticados)

| Método | Endpoint                             | Descripción                      |
| ------ | ------------------------------------ | -------------------------------- |
| GET    | `/api/services`                      | Listar todos los servicios       |
| GET    | `/api/services/:id`                  | Obtener un servicio por ID       |
| POST   | `/api/services`                      | Crear un nuevo servicio          |
| PATCH  | `/api/services/:id`                  | Actualizar un servicio           |
| DELETE | `/api/services/:id`                  | Eliminar un servicio             |
| GET    | `/api/services/satisfaction-options` | Obtener opciones de satisfacción |

### Readiness Assessment (Públicos)

| Método | Endpoint                                               | Descripción                 |
| ------ | ------------------------------------------------------ | --------------------------- |
| GET    | `/api/readiness-assessment/questions`                  | Obtener todas las preguntas |
| POST   | `/api/readiness-assessment/assess?organizationKey=xxx` | Evaluar una escala          |

---

## 🔑 Autenticación

### APIs Autenticadas (Servicios)

Las APIs de servicios requieren un token JWT en las cookies. El token se obtiene al hacer login en el dashboard.

**Ejemplo de headers automáticos:**

```typescript
// Next.js maneja las cookies automáticamente
const response = await fetch("/api/services");
```

### APIs Públicas (Readiness Assessment)

No requieren autenticación. Solo necesitan el `organizationKey` como query parameter.

---

## ⚠️ Códigos de Error Comunes

- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o faltante (solo APIs autenticadas)
- **403 Forbidden**: Usuario no tiene permisos o no pertenece a la organización
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Nombre de servicio duplicado en la organización
- **500 Internal Server Error**: Error del servidor

