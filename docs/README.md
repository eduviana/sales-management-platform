# Documentación del proyecto

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Estado:** En desarrollo  
**Última actualización:** 01/09/2026

---

Este directorio contiene la documentación funcional, de dominio, arquitectura y datos del proyecto.

La documentación se considera parte integral del diseño del sistema y debe mantenerse alineada con la implementación.

---

## 1. Propósito

El objetivo de este directorio es centralizar y organizar la documentación utilizada durante el análisis, diseño, implementación y evolución del sistema.

**La documentación debe permitir responder rápidamente:**

- Qué necesita el sistema.
- Qué reglas gobiernan su comportamiento.
- Cómo está estructurada la organización.
- Quién puede acceder a qué información.
- Qué decisiones técnicas fueron tomadas.
- Qué aspectos todavía están pendientes.
- Cómo se relaciona la documentación con la implementación.

---

## 2. Organización

La documentación se divide por responsabilidad:

```
docs/
├── README.md
│
├── product/
│
├── domain/
│
├── architecture/
│
└── database/
```

Cada directorio contiene documentos relacionados con una etapa o responsabilidad específica del proyecto.

No se debe crear un documento nuevo únicamente para almacenar información que puede pertenecer claramente a un documento existente.

---

## 3. Documentación existente

Esta sección contiene los documentos que actualmente forman parte del proyecto.

### 3.1. Producto

#### `product/requirements.md`

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

#### `product/open-questions.md`

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

#### `product/permissions-matrix.md`

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

### 3.2. Dominio

#### `domain/organizational-model.md`

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

#### `domain/business-rules.md`

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

## 4. Documentación prevista

Los siguientes documentos todavía no existen o no contienen contenido definitivo.

Se crearán únicamente cuando exista suficiente información para justificar su incorporación.

### 4.1. Arquitectura

**Directorio previsto:**

```
architecture/
├── architecture-decisions.md
├── system-architecture.md
├── authorization.md
└── data-architecture.md
```

#### `architecture/architecture-decisions.md`

Registrará decisiones arquitectónicas relevantes y el motivo por el que fueron adoptadas.

Utilizará identificadores:

```
ADR-001
ADR-002
ADR-003
...
```

> **Estado:** Previsto.

#### `architecture/system-architecture.md`

Describirá la arquitectura general de la aplicación y la interacción entre sus principales componentes.

> **Estado:** Previsto.

#### `architecture/authorization.md`

Describirá cómo se implementarán técnicamente:

- Autenticación.
- Autorización.
- Control de acceso.
- Alcance jerárquico.
- Protección de recursos.

> **Estado:** Previsto.

#### `architecture/data-architecture.md`

Describirá las decisiones relacionadas con:

- Persistencia.
- Acceso a datos.
- Consultas.
- Agregaciones.
- Estrategias de rendimiento.
- Datos históricos.

> **Estado:** Previsto.

### 4.2. Base de datos

**Directorio previsto:**

```
database/
└── data-model.md
```

#### `database/data-model.md`

Describirá:

- Entidades.
- Relaciones.
- Cardinalidades.
- Restricciones.
- Integridad.
- Índices.
- Datos históricos.
- Estrategias de consulta.

Será utilizado como referencia para diseñar posteriormente el esquema de Prisma y PostgreSQL.

> **Estado:** Próximo documento previsto.

---

## 5. Flujo documental

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

## 6. Fuentes de verdad

Cada documento tiene una responsabilidad específica.

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

## 7. Convenciones documentales

### 7.1. Nombres de archivos

Los nombres de archivos se escriben en inglés.

**Ejemplos:**

- `requirements.md`
- `open-questions.md`
- `business-rules.md`
- `organizational-model.md`
- `permissions-matrix.md`

### 7.2. Contenido

El contenido de la documentación se escribe en español.

Los nombres de tecnologías, patrones, APIs y conceptos técnicos pueden mantenerse en su terminología habitual.

**Ejemplos:**

- Next.js
- React Server Components
- PostgreSQL
- Prisma
- RBAC
- Server Actions

### 7.3. Identificadores

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

### 7.4. Estados

- ✅ CONFIRMADO
- 🔎 OBSERVADO
- ⚠️ ASUMIDO
- ❓ PENDIENTE
- 🚧 DECISIÓN DE DISEÑO
- 🔄 REEMPLAZADO

---

## 8. Trazabilidad

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

## 9. Mantenimiento

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

## 10. Mantenimiento mediante agentes

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

## 11. Relación con el código

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

## 12. Estado actual de la documentación

**Documentos existentes:**

```
product/
├── requirements.md
├── open-questions.md
└── permissions-matrix.md

domain/
├── organizational-model.md
└── business-rules.md
```

**Documentos previstos:**

```
architecture/
├── architecture-decisions.md
├── system-architecture.md
├── authorization.md
└── data-architecture.md

database/
└── data-model.md
```

Los documentos previstos se incorporarán progresivamente a medida que el diseño del sistema avance.

---

## 13. Regla de evolución documental

La cantidad de documentos no constituye un objetivo en sí mismo.

**Antes de crear un nuevo documento deberá existir una razón clara:**

- El contenido tiene una responsabilidad propia.
- La información es suficientemente extensa.
- El documento mejora la mantenibilidad.
- Existe una necesidad real de referenciarlo independientemente.

La documentación deberá crecer al mismo ritmo que la complejidad real del proyecto.

---

## 14. Historial de cambios

| Fecha      | Versión | Cambio                                                                                          |
|------------|---------|-------------------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación del índice general de documentación.                                                   |
| 01/09/2026 | 0.2     | Separación entre documentos existentes y documentos previstos. Incorporación de reglas de mantenimiento y trazabilidad. |
