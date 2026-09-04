# Documentación del proyecto

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Estado:** En desarrollo  
**Última actualización:** 03/09/2026

---

## 1. Fuentes de verdad

Cada documento tiene una responsabilidad específica y constituye la fuente principal para un tipo determinado de información.

| Documento                      | Responsabilidad                                    |
|--------------------------------|----------------------------------------------------|
| `requirements.md`              | Qué necesita el sistema                            |
| `open-questions.md`            | Qué todavía no está definido                       |
| `organizational-model.md`      | Qué conceptos existen en la organización           |
| `business-rules.md`            | Qué reglas rigen el comportamiento                 |
| `permissions-matrix.md`        | Quién puede hacer qué y con qué alcance            |
| `architecture-decisions.md`    | Por qué se tomó una decisión técnica               |
| `system-architecture.md`       | Cómo está estructurado el sistema                  |
| `authorization.md`             | Cómo se implementa técnicamente el control de acceso |
| `data-architecture.md`         | Cómo se organiza técnicamente el acceso a datos    |
| `data-model.md`                | Cómo se representan los datos                      |

Un documento puede referenciar información perteneciente a otro, pero no debe convertirse innecesariamente en una segunda fuente de verdad.

---

## 2. Propósito

Este directorio centraliza y organiza la documentación utilizada durante el análisis, diseño, implementación y evolución del sistema.

La documentación se considera parte integral del diseño del sistema y debe mantenerse alineada con la implementación.

**La documentación debe permitir responder rápidamente:**

- Qué necesita el sistema.
- Qué reglas gobiernan su comportamiento.
- Cómo está estructurada la organización.
- Quién puede acceder a qué información.
- Qué decisiones técnicas fueron tomadas.
- Qué aspectos todavía están pendientes.
- Cómo se relaciona la documentación con la implementación.

---

## 3. Organización

La documentación se divide por responsabilidad:

```
docs/
├── README.md
│
├── product/
│   ├── requirements.md
│   ├── open-questions.md
│   └── permissions-matrix.md
│
├── domain/
│   ├── organizational-model.md
│   └── business-rules.md
│
├── architecture/
│   ├── architecture-decisions.md
│   ├── system-architecture.md
│   ├── authorization.md
│   └── data-architecture.md
│
└── database/
    └── data-model.md
```

Cada directorio contiene documentos relacionados con una responsabilidad específica del proyecto.

No se debe crear un documento nuevo únicamente para almacenar información que puede pertenecer claramente a un documento existente.

---

## 4. Documentación del producto

### 4.1. `product/requirements.md`

Define los requisitos funcionales y no funcionales conocidos del sistema.

**Incluye:**

- Alcance funcional.
- Usuarios.
- Niveles organizacionales.
- Gestión de equipos.
- Ventas.
- Estadísticas.
- Comisiones.
- Capacitación.
- Seguridad.
- Rendimiento.
- Escalabilidad.

> **Fuente principal para:** Requisitos del sistema.

### 4.2. `product/open-questions.md`

Centraliza las preguntas e incertidumbres que todavía deben resolverse.

**Incluye preguntas relacionadas con:**

- Organización.
- Jerarquía.
- Usuarios.
- Ventas.
- Productos.
- Estadísticas.
- Niveles 4–7.
- Comisiones.
- Administración.
- Auditoría.
- Autenticación.
- Infraestructura.
- Integraciones.
- Capacitación.

Las preguntas poseen numeración permanente para facilitar la trazabilidad entre reuniones y documentos.

> **Fuente principal para:** Información pendiente de definición.

### 4.3. `product/permissions-matrix.md`

Define las capacidades disponibles para cada nivel y rol, junto con su alcance.

**Incluye:**

- Permisos funcionales.
- Alcances.
- Niveles 1–7.
- Rol administrativo.
- Comisiones.
- Capacitación.
- Casos de prueba de autorización.

> **Fuente principal para:** Permisos funcionales y alcance de acceso.

---

## 5. Documentación del dominio

### 5.1. `domain/organizational-model.md`

Define los conceptos y relaciones que forman la estructura organizacional.

**Incluye:**

- Empleados.
- Cuentas de usuario.
- Niveles.
- Nombres comerciales.
- Supervisores.
- Equipos.
- Antigüedad.
- Jerarquía.
- Historial organizacional.

> **Fuente principal para:** Modelo conceptual de la organización.

### 5.2. `domain/business-rules.md`

Define las reglas que determinan el comportamiento del negocio.

**Incluye reglas relacionadas con:**

- Empleados.
- Niveles.
- Jerarquía.
- Equipos.
- Ventas.
- Estadísticas.
- Acceso.
- Antigüedad.
- Comisiones.
- Capacitación.
- Historial.
- Auditoría.

Las reglas utilizan identificadores `REG-xxx`.

> **Fuente principal para:** Reglas de negocio.

---

## 6. Documentación de arquitectura

### 6.1. `architecture/architecture-decisions.md`

Registra las decisiones arquitectónicas relevantes y el motivo por el que fueron adoptadas.

Utiliza identificadores:

```
ADR-001
ADR-002
ADR-003
...
```

> **Fuente principal para:** Decisiones arquitectónicas y sus justificaciones.

### 6.2. `architecture/system-architecture.md`

Define la arquitectura general de la aplicación y la interacción entre sus principales componentes.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

### 6.3. `architecture/authorization.md`

Define cómo se implementan técnicamente:

- Autenticación.
- Autorización.
- Control de acceso.
- Alcance jerárquico.
- Protección de recursos.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

### 6.4. `architecture/data-architecture.md`

Define la estrategia arquitectónica de datos, incluyendo:

- Persistencia.
- Acceso a datos.
- Consultas.
- Agregaciones.
- Estrategias de rendimiento.
- Datos históricos.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

---

## 7. Documentación de base de datos

### 7.1. `database/data-model.md`

Define el modelo de datos conceptual y las decisiones relacionadas con su representación.

**Incluye:**

- Entidades.
- Relaciones.
- Cardinalidades.
- Restricciones.
- Integridad.
- Datos históricos.
- Estrategias de consulta.

Será utilizado como referencia para diseñar posteriormente el esquema de Prisma y PostgreSQL.

> **Fuente principal para:** Modelo de datos.

Los índices y decisiones específicas de implementación podrán detallarse posteriormente cuando el modelo relacional y la estrategia de persistencia hayan sido definidos.

---

## 8. Flujo documental

La documentación sigue aproximadamente el siguiente flujo:

```
Requisitos
    ↓
Preguntas abiertas
    ↓
Modelo de dominio
    ↓
Reglas de negocio
    ↓
Matriz de permisos
    ↓
Arquitectura
    ↓
Modelo de datos
    ↓
Implementación
    ↓
Pruebas
```

Este flujo no implica una secuencia estrictamente lineal.

Los documentos pueden evolucionar en paralelo cuando nueva información modifique decisiones anteriores.

Una modificación en un documento puede requerir revisar otros documentos relacionados.

---

## 9. Convenciones documentales

### 9.1. Nombres de archivos

Los nombres de archivos se escriben en inglés.

**Ejemplos:**

- `requirements.md`
- `open-questions.md`
- `business-rules.md`
- `organizational-model.md`
- `permissions-matrix.md`

### 9.2. Contenido

El contenido de la documentación se escribe en español.

Los nombres de tecnologías, patrones, APIs y conceptos técnicos pueden mantenerse en su terminología habitual.

**Ejemplos:**

- Next.js
- React Server Components
- PostgreSQL
- Prisma
- RBAC
- Server Actions

### 9.3. Identificadores

Se utilizan las siguientes convenciones:

```
REQ-xxx     Requisito
Q-xxx       Pregunta abierta
REG-xxx     Regla de negocio
PERM-xxx    Permiso
ADR-xxx     Decisión arquitectónica
UC-xxx      Caso de uso
TEST-xxx    Prueba
```

Los identificadores existentes no deben reutilizarse para otros conceptos.

### 9.4. Estados

- ✅ CONFIRMADO
- 🔎 OBSERVADO
- ⚠️ ASUMIDO
- ❓ PENDIENTE
- 🚧 DECISIÓN DE DISEÑO
- 🔄 REEMPLAZADO

---

## 10. Trazabilidad

Cuando aporte valor, los elementos de la documentación deberán poder relacionarse entre sí.

**El flujo conceptual es:**

```
Requisito
    ↓
Regla de negocio
    ↓
Permiso / Caso de uso
    ↓
Implementación
    ↓
Prueba
```

**Ejemplo:**

```
REQ-xxx
    ↓
REG-xxx
    ↓
PERM-xxx
    ↓
UC-xxx
    ↓
TEST-xxx
```

La trazabilidad no debe utilizarse de forma artificial.

Debe implementarse cuando permita comprender mejor el impacto de una decisión o cambio.

---

## 11. Mantenimiento

La documentación deberá actualizarse cuando cambien:

- Requisitos.
- Reglas de negocio.
- Permisos.
- Modelo organizacional.
- Arquitectura.
- Modelo de datos.
- Decisiones importantes.

Antes de modificar varios documentos deberá determinarse cuáles están realmente afectados.

La sincronización podrá realizarse manualmente o mediante agentes como OpenCode, siempre respetando las convenciones establecidas en:

```
AGENTS.md
```

---

## 12. Mantenimiento mediante agentes

Los agentes pueden utilizar esta documentación para comprender la estructura del proyecto y realizar cambios consistentes.

**Antes de modificar múltiples documentos deberán:**

- Identificar la fuente de verdad correspondiente.
- Analizar qué documentos están afectados.
- Mantener los identificadores existentes.
- Evitar modificar documentos no relacionados.
- No inventar requisitos.
- No convertir información asumida en confirmada.
- Mantener las referencias cruzadas.
- Revisar la coherencia de los documentos modificados.

Los cambios generados por agentes deberán revisarse mediante Git antes de considerarse definitivos.

---

## 13. Relación con el código

La documentación describe las decisiones y reglas que deben respaldar la implementación.

**Sin embargo:**

La documentación no sustituye las validaciones realizadas por el sistema.

**Por ejemplo:**

```
permissions-matrix.md
        ↓
define quién puede realizar una acción

authorization.md
        ↓
define cómo se implementa la restricción

código
        ↓
ejecuta la validación real

tests
        ↓
verifican el comportamiento
```

---

## 14. Estado actual de la documentación

**Documentos existentes:**

```
product/
├── requirements.md
├── open-questions.md
└── permissions-matrix.md

domain/
├── organizational-model.md
└── business-rules.md

architecture/
├── architecture-decisions.md
├── system-architecture.md
├── authorization.md
└── data-architecture.md

database/
└── data-model.md
```

**Documentos pendientes de creación:**

```
Ninguno dentro de la estructura arquitectónica actualmente definida.
```

Las decisiones pendientes dentro de los documentos existentes no implican que dichos documentos estén pendientes de creación.

---

## 15. Regla de evolución documental

La cantidad de documentos no constituye un objetivo en sí mismo.

**Antes de crear un nuevo documento deberá existir una razón clara:**

- El contenido tiene una responsabilidad propia.
- La información es suficientemente extensa.
- El documento mejora la mantenibilidad.
- Existe una necesidad real de referenciarlo independientemente.

La documentación deberá crecer al mismo ritmo que la complejidad real del proyecto.

---

## 16. Historial de cambios

| Fecha      | Versión | Cambio                                                                                          |
|------------|---------|-------------------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación del índice general de documentación.                                                   |
| 01/09/2026 | 0.2     | Separación entre documentos existentes y documentos previstos. Incorporación de reglas de mantenimiento y trazabilidad. |
| 02/09/2026 | 0.3     | Reorganización del documento. "Fuentes de verdad" pasa al inicio y se actualiza el estado de la documentación existente. |
| 03/09/2026 | 0.4     | Sincronización del índice con los documentos de arquitectura general, autorización y datos actualmente existentes. |
| 03/09/2026 | 0.5     | Actualización del índice tras la consolidación global de la documentación. |
