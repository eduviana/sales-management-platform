# Modelo organizacional

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Modelo organizacional  
**Estado:** En consolidación  
**Versión:** 0.4  
**Última actualización:** 03/09/2026

---

Este documento describe el modelo conceptual utilizado para representar la estructura organizacional de la empresa dentro del sistema.

**Las definiciones se clasifican según su grado de certeza:**

- ✅ **CONFIRMADO** — Información proporcionada o confirmada por Royal Prestige.
- 🔎 **OBSERVADO** — Información obtenida durante el relevamiento que todavía debe validarse formalmente.
- ⚠️ **SUPUESTO** — Decisión provisional adoptada para permitir el desarrollo de una versión de referencia.
- ❓ **PENDIENTE** — Información o definición que todavía debe resolverse.
- 🚧 **DECISIÓN DE DISEÑO** — Decisión adoptada para mantener una arquitectura flexible e independiente de la interfaz.

---

## 1. Objetivo

El objetivo de este documento es definir cómo se representará conceptualmente dentro del sistema la estructura jerárquica de la fuerza de ventas.

**El modelo debe permitir representar:**

- Empleados.
- Cuentas de acceso.
- Niveles organizacionales.
- Nombres comerciales de los niveles.
- Antigüedad de los empleados.
- Supervisores.
- Relaciones jerárquicas.
- Equipos de ventas.
- Cambios dentro de la estructura organizacional.
- Historial de cambios relevantes.
- Acceso a información según la posición del empleado.

El modelo debe ser suficientemente flexible como para adaptarse a cambios en las reglas de negocio sin requerir una reestructuración completa de la aplicación.

---

## 2. Conceptos del dominio

### 2.1. Empleado

Un empleado representa a una persona que forma parte de la organización comercial.

**Un empleado puede:**

- Tener una cuenta de acceso al sistema.
- Poseer un nivel organizacional.
- Tener un supervisor directo.
- Formar parte de un equipo.
- Realizar ventas.
- Ser responsable de otros empleados, dependiendo de su posición organizacional.
- Ascender o descender dentro de la organización.
- Cambiar de supervisor o equipo.
- Mantener información histórica aunque su cuenta se encuentre inactiva.

La información relacionada con el empleado debe poder conservarse independientemente de que su cuenta de acceso se encuentre activa o no.

> **Estado:** ✅ CONFIRMADO en términos conceptuales.

### 2.2. Cuenta de usuario

Una cuenta de usuario representa las credenciales y el acceso de un empleado a la aplicación.

La cuenta no debe considerarse equivalente al empleado.

**Conceptualmente:**

```
Empleado
    │
    └── Cuenta de usuario
```

**La cuenta puede contener información relacionada con:**

- Identidad de autenticación.
- Credenciales.
- Estado de acceso.
- Sesiones.
- Configuración de seguridad.

Un empleado puede dejar de tener acceso a la aplicación sin que su información histórica deba eliminarse.

Por este motivo:

- Empleado y cuenta de usuario se consideran conceptos independientes.

> **Estado:** ⚠️ SUPUESTO.

### 2.3. Nivel organizacional

Un nivel representa la posición de un empleado dentro de la clasificación organizacional de la empresa.

La organización actualmente conocida posee 7 niveles.

```
Nivel 1
Nivel 2
Nivel 3
Nivel 4
Nivel 5
Nivel 6
Nivel 7
```

Durante el relevamiento inicial se observó la siguiente nomenclatura comercial:

| Nivel interno | Nombre comercial observado |
|---------------|----------------------------|
| Nivel 1       | Vendedor                   |
| Nivel 2       | Vendedor Junior            |
| Nivel 3       | Distribuidor               |
| Nivel 4       | Blue                       |
| Nivel 5       | Royal                      |
| Nivel 6       | Premier                    |
| Nivel 7       | Max                        |

Los nombres comerciales no deberán utilizarse como identificadores estructurales del sistema.

**Conceptualmente:**

```
Nivel interno
    ↓
identificación estable
    +
nombre comercial configurable
```

**Por ejemplo:**

```
LEVEL_3
    ↓
Distribuidor
```

Si el nombre comercial cambia en el futuro, la identidad interna del nivel no debería verse afectada.

**Cada nivel podrá determinar o influir en:**

- Responsabilidades.
- Capacidades.
- Permisos.
- Alcance de visibilidad.
- Acceso a estadísticas.
- Capacidad de supervisión.
- Acceso a determinadas funcionalidades.

La definición funcional oficial todavía requiere validación, pero para la versión
consolidada se adopta una escalera organizacional de diseño que distingue
responsabilidad, alcance y capacidad comercial sin equiparar nivel y rol técnico.

> **Estado:**
>
> - 7 niveles → ✅ CONFIRMADO.
> - Nombres comerciales observados → 🔎 OBSERVADO.
> - Responsabilidades de diseño para la versión consolidada → 🚧 DECISIÓN DE DISEÑO.
> - Permisos funcionales definitivos → ❓ PENDIENTE.

### 2.4. Antigüedad del empleado

La antigüedad representa el tiempo transcurrido desde el ingreso del empleado a la organización.

La antigüedad es un concepto independiente del nivel organizacional.

**Conceptualmente:**

```
Nivel
    ↓
posición dentro de la organización

Antigüedad
    ↓
tiempo dentro de la organización
```

**La antigüedad puede influir en diferentes reglas de negocio, incluyendo potencialmente:**

- Ascensos.
- Beneficios o condiciones comerciales.
- Acceso a determinadas funcionalidades.

Durante el relevamiento inicial se observó una posible relación entre la
antigüedad de vendedores nuevos de Nivel 1 y su porcentaje de comisión. Esa
observación fue reemplazada para Fase 6 por tasas confirmadas directamente por
nivel: N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %.

Por este motivo, el modelo deberá conservar una fecha de ingreso suficientemente precisa como para calcular la antigüedad correspondiente en un momento determinado.

**La fecha de ingreso no deberá confundirse con:**

- Fecha de creación de la cuenta.
- Fecha de primer inicio de sesión.
- Fecha de creación del registro en la base de datos.

> **Estado:** 🔄 REEMPLAZADO para las reglas de comisión vigentes; la fecha de
> ingreso continúa siendo un dato organizacional válido para otros usos.

### 2.5. Supervisor

Un supervisor representa al empleado responsable directamente de otro empleado dentro de la estructura organizacional.

**La relación puede representarse conceptualmente como:**

```
Empleado A
    │
    └── reporta a
            │
            ▼
        Empleado B
```

**Donde:**

- Empleado B = supervisor
- Empleado A = subordinado

Para la versión consolidada se establece que cada empleado puede tener como
máximo un supervisor directo activo. La relación actual puede cambiar mediante
una operación explícita.

Esto no implica que un supervisor tenga un único subordinado.

Un supervisor puede tener múltiples empleados a su cargo.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

### 2.6. Equipo

Un equipo representa conceptualmente un conjunto de empleados asociados dentro de la estructura comercial.

Actualmente se sabe que los empleados de Nivel 3 pueden tener un equipo de vendedores a su cargo.

Todavía no está confirmado si el concepto de equipo tiene una identidad propia dentro del negocio o si simplemente representa el conjunto de subordinados directos de un supervisor.

#### Opción A — Equipo implícito

El equipo está determinado por la relación jerárquica:

```
Supervisor
    │
    ├── Empleado
    ├── Empleado
    └── Empleado
```

En este modelo no sería necesario que "Equipo" sea una entidad independiente.

#### Opción B — Equipo explícito

El equipo es una entidad independiente:

```
Equipo
├── nombre
├── supervisor
├── integrantes
├── objetivos
├── estado
└── historial
```

Este modelo tendría sentido si el negocio considera al equipo como una entidad con identidad, configuración, objetivos, historial u otras propiedades propias.

La decisión entre ambos modelos todavía no está tomada.

> **Estado:** ❓ PENDIENTE.

---

## 3. Jerarquía organizacional

La estructura se modelará conceptualmente como una jerarquía de empleados.

Cada empleado puede tener una relación con su supervisor directo:

```
Empleado
    │
    └── supervisor
             │
             └── Empleado
```

Esta relación es recursiva porque tanto el subordinado como el supervisor son empleados.

Esto permite representar estructuras de profundidad variable sin asociar rígidamente determinados nombres o responsabilidades a un nivel concreto.

**Ejemplo:**

```
Empleado Nivel 5
│
├── Empleado Nivel 4
│   ├── Empleado Nivel 3
│   │   ├── Empleado Nivel 2
│   │   └── Empleado Nivel 1
│   │
│   └── Empleado Nivel 3
│       └── Empleado Nivel 1
│
└── Empleado Nivel 4
    └── Empleado Nivel 3
        └── Empleado Nivel 2
```

La estructura real dependerá de las reglas de negocio que defina Royal Prestige.

---

## 4. Relación entre nivel, antigüedad y jerarquía

El nivel, la antigüedad y la posición jerárquica son conceptos relacionados, pero independientes.

**Nivel:**

Determina la clasificación organizacional del empleado.

```
Nivel 3
```

**Antigüedad:**

Determina cuánto tiempo lleva el empleado dentro de la organización.

```
Ingreso: 01/01/2026
```

**Jerarquía:**

Determina de quién depende directamente el empleado.

```
Supervisor: empleado X
```

**Por lo tanto:**

```
Empleado
├── Nivel
├── Antigüedad
└── Supervisor
```

Ninguno de estos conceptos debería utilizarse como sustituto de los otros.

Por ejemplo, no se debe asumir que:

```
Nivel 3 = supervisor
```

Aunque actualmente se sabe que los empleados de Nivel 3 pueden tener equipos a cargo.

Tampoco debe asumirse que:

```
Antigüedad alta = nivel alto
```

Sin conocer las reglas exactas de promoción.

---

## 5. Reglas provisionales

Para poder desarrollar una versión funcional de referencia antes de conocer todas las reglas reales del negocio, se adoptan temporalmente las siguientes reglas.

### REGLA-001 — Un empleado puede realizar ventas independientemente de su nivel

El hecho de alcanzar un nivel superior no elimina necesariamente la capacidad del empleado para realizar ventas.

> **Estado:** ⚠️ SUPUESTO.

### REGLA-002 — Cada empleado tiene un supervisor directo

Para la versión de referencia, un empleado tendrá como máximo un supervisor directo.

> **Estado:** ⚠️ SUPUESTO.

### REGLA-003 — Un supervisor puede tener múltiples subordinados

Un empleado que tenga responsabilidades de supervisión puede tener múltiples empleados bajo su responsabilidad.

> **Estado:** ⚠️ SUPUESTO.

### REGLA-004 — La jerarquía puede tener múltiples niveles de profundidad

El sistema no debe limitar la estructura organizacional a una única relación de supervisión.

Debe ser posible representar:

```
A
└── B
    └── C
        └── D
            └── E
```

> **Estado:** ⚠️ SUPUESTO.

### REGLA-005 — El acceso a los datos depende de la posición del usuario

Un usuario no debe obtener acceso automáticamente a toda la información del sistema por el simple hecho de estar autenticado.

Su alcance dependerá de:

- Nivel.
- Rol.
- Permisos.
- Posición dentro de la jerarquía.
- Reglas de negocio.

> **Estado:** ✅ CONFIRMADO en términos generales.

### REGLA-006 — La autorización se ejecuta del lado del servidor

Las restricciones de acceso no deben depender únicamente de ocultar elementos de la interfaz.

El servidor debe verificar que el usuario tenga autorización para acceder o modificar un recurso.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

### REGLA-007 — Un empleado puede mantener información histórica aunque su cuenta esté inactiva

La desactivación de una cuenta no debe implicar automáticamente la eliminación de la información histórica del empleado.

> **Estado:** ⚠️ SUPUESTO.

### REGLA-008 — El nombre comercial de un nivel no determina su identidad interna

Los nombres comerciales observados podrán cambiar sin que ello implique necesariamente un cambio estructural en la aplicación.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

### REGLA-009 — La antigüedad debe conservarse independientemente del nivel

La antigüedad del empleado deberá poder determinarse sin depender exclusivamente de su nivel actual.

Esto permite utilizarla en reglas relacionadas con:

- Comisiones.
- Ascensos.
- Historial.
- Otras condiciones comerciales.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

---

## 6. Historial y cambios organizacionales

La estructura organizacional puede cambiar durante el ciclo de vida de un empleado.

**Algunos ejemplos:**

- Cambio de nivel.
- Cambio de supervisor.
- Cambio de equipo.
- Ingreso a la empresa.
- Desvinculación.
- Reincorporación.

El sistema deberá diseñarse considerando que estos cambios pueden afectar la interpretación de datos históricos.

**Ejemplo:**

```
Enero
Juan → Nivel 2
Supervisor → Pedro

Junio
Juan → Nivel 3
Supervisor → Pedro

Diciembre
Juan → Nivel 3
Supervisor → María
```

Si las estadísticas históricas dependen de la estructura organizacional, puede ser necesario conocer cuál era la relación correspondiente en el momento en que ocurrió una determinada venta.

La misma consideración puede aplicarse al cálculo de comisiones si estas dependen de la antigüedad, nivel o reglas vigentes en el momento de una venta.

Por este motivo, la versión consolidada deberá conservar un historial
organizacional capaz de registrar, como mínimo, empleado, supervisor, nivel,
inicio de vigencia, fin de vigencia, motivo y actor del cambio. El nombre físico
definitivo de esta estructura queda para el modelado posterior.

> **Estado:** 🚧 DECISIÓN DE DISEÑO; los detalles físicos y las reglas históricas
> adicionales permanecen pendientes.

---

## 7. Ejemplo de estructura organizacional

A modo de ejemplo para la versión de referencia, puede utilizarse la siguiente estructura:

```
Empleado Nivel 5
│
├── Empleado Nivel 4
│   │
│   ├── Empleado Nivel 3
│   │   ├── Empleado Nivel 2
│   │   └── Empleado Nivel 1
│   │
│   └── Empleado Nivel 3
│       ├── Empleado Nivel 1
│       └── Empleado Nivel 2
│
└── Empleado Nivel 4
    │
    └── Empleado Nivel 3
        ├── Empleado Nivel 2
        └── Empleado Nivel 1
```

Este ejemplo no representa la estructura real de Royal Prestige.

Su único objetivo es demostrar que el modelo debe poder representar una jerarquía de profundidad variable.

---

## 8. Acceso a información según la jerarquía

Para la versión de referencia se plantea el siguiente principio:

> Un usuario puede consultar información propia y, cuando sus permisos lo permitan, información correspondiente a empleados que se encuentren dentro de su alcance organizacional.

**Por ejemplo:**

```
Nivel 1
└── Consulta propia

Nivel 2
└── Consulta propia

Nivel 3
├── Consulta propia
└── Consulta de su equipo

Nivel superior
├── Consulta propia
└── Consulta de los niveles/equipos subordinados
```

La última regla es deliberadamente general.

No se asumirá todavía que todos los niveles superiores pueden visualizar automáticamente toda la rama inferior.

Eso deberá determinarse mediante la matriz de permisos.

---

## 9. Independencia entre posición, nivel y equipo

El sistema no deberá asumir que un determinado concepto puede inferirse siempre a partir de otro.

**Por ejemplo:**

```
Nivel 3
```

No debe implicar automáticamente:

```
Tiene equipo
```

Aunque actualmente sepamos que el Nivel 3 puede tener un equipo.

Del mismo modo:

```
Tiene equipo
```

No debería utilizarse como sustituto del nivel del empleado.

La implementación deberá permitir que las reglas reales del negocio determinen estas relaciones.

> **Estado:** 🚧 DECISIÓN DE DISEÑO.

---

## 10. Supuestos adoptados para la versión de referencia

Los siguientes supuestos permitirán continuar con el desarrollo si Royal Prestige finalmente no participa del proyecto.

| ID      | Supuesto                                                                                          | Estado    |
|---------|---------------------------------------------------------------------------------------------------|-----------|
| SUP-001 | Cada empleado tiene un único supervisor directo.                                                  | Reemplazado |
| SUP-002 | Un supervisor puede tener múltiples subordinados.                                                 | Activo    |
| SUP-003 | La jerarquía puede tener profundidad variable.                                                    | Activo    |
| SUP-004 | Un empleado puede vender independientemente de su nivel.                                          | Reemplazado |
| SUP-005 | Empleado y cuenta de usuario son conceptos independientes.                                        | Reemplazado |
| SUP-006 | Un empleado puede permanecer en el sistema aunque su cuenta esté inactiva.                        | Reemplazado |
| SUP-007 | Los equipos pueden ser implícitos o explícitos dependiendo de las reglas de negocio.              | Pendiente |
| SUP-008 | Los cambios de supervisor pueden requerir historial.                                              | Reemplazado |
| SUP-009 | Los cambios de nivel pueden requerir historial.                                                   | Reemplazado |
| SUP-010 | La antigüedad del empleado se conserva como dato independiente del nivel.                         | Activo    |
| SUP-011 | Los nombres comerciales de los niveles pueden cambiar sin modificar la identidad interna del nivel.| Activo    |

Los supuestos marcados como REEMPLAZADO fueron sustituidos por las decisiones
consolidadas de la sección 12.8 y no deben interpretarse como definiciones
vigentes independientes.

---

## 11. Decisiones pendientes

Las siguientes cuestiones todavía pueden modificar el modelo:

- ¿Un empleado puede pertenecer a múltiples equipos?
- ¿El equipo es una entidad independiente?
- ¿Un supervisor puede administrar empleados de diferentes niveles?
- ¿Un empleado puede supervisar a otro empleado del mismo nivel?
- ¿Un empleado puede cambiar de supervisor sin cambiar de equipo?
- ¿Qué excepciones existen a la escalera normal de reclutamiento?
- ¿La antigüedad se calcula desde el primer ingreso histórico o desde el inicio del período laboral actual?
- ¿Cómo se tratan las reincorporaciones?
- ¿La antigüedad influye únicamente en las comisiones o también en los ascensos?
- ¿Existen excepciones a la jerarquía normal?
- ¿Un empleado de Nivel 3 puede no tener ningún subordinado?

> Estas preguntas deben mantenerse sincronizadas con `docs/product/open-questions.md`.

---

## 12. Principios de diseño

El modelo organizacional deberá seguir los siguientes principios.

### 12.1. Evitar reglas rígidas

No se debe implementar una estructura donde cada nivel tenga un comportamiento imposible de modificar.

El sistema debe permitir que las reglas evolucionen.

### 12.2. Separar jerarquía de permisos

La relación entre empleados no debe ser el único mecanismo utilizado para determinar permisos.

La jerarquía y la autorización son conceptos relacionados, pero diferentes.

### 12.3. Separar nivel de nombre comercial

El código y el modelo de dominio no deberán depender directamente de los nombres comerciales observados.

Los nombres podrán modificarse sin afectar las relaciones internas del sistema.

### 12.4. Separar antigüedad de nivel

La antigüedad debe mantenerse como un concepto independiente del nivel actual.

Esto permite aplicar reglas basadas en tiempo incluso cuando el empleado haya cambiado de nivel.

### 12.5. Preservar historial cuando sea necesario

Los cambios organizacionales no deberían destruir información necesaria para interpretar datos históricos.

### 12.6. Mantener el dominio independiente de la interfaz

Las reglas organizacionales deben estar implementadas de manera que puedan utilizarse independientemente de los componentes visuales.

### 12.7. Diseñar para cambios de negocio

Las reglas actualmente desconocidas deben poder incorporarse posteriormente sin tener que reconstruir la arquitectura completa.

### 12.8. Decisiones consolidadas para la versión actual

Para la versión consolidada del sistema se establecen las siguientes decisiones
de diseño, sin presentarlas como confirmaciones adicionales de Royal Prestige:

- La organización utiliza siete niveles comerciales con la nomenclatura
  observada N1 Vendedor, N2 Vendedor Junior, N3 Distribuidor, N4 Blue, N5 Royal,
  N6 Premier y N7 Max.
- Todos los niveles pueden realizar ventas.
- N1 y N2 no tienen equipo propio ni capacidad normal de reclutamiento.
- La escalera normal de reclutamiento es N3 → N1, N4 → N3, N5 → N4, N6 → N5 y
  N7 → N6.
- La carga inicial conserva el nivel real actual de cada empleado y no lo fuerza
  a comenzar en N1.
- Las promociones y demociones no son automáticas; una persona con autoridad
  debe tomar la decisión final.
- `ADMIN` es un rol administrativo independiente y no constituye un Nivel 8.
- Cada empleado tiene como máximo un supervisor directo activo. Los cambios de
  supervisor y las reorganizaciones son explícitos.
- Si un supervisor deja la organización, sus subordinados no se reasignan
  automáticamente.
- El empleado se desactiva cuando deja de trabajar y no se elimina físicamente.
  Una cuenta asociada a un empleado inactivo no puede autenticarse.
- El equipo se deriva inicialmente de los subordinados directos y la rama de
  los descendientes. La existencia futura de una entidad Team permanece
  pendiente.
- Debe conservarse historial organizacional con empleado, supervisor, nivel,
  vigencia, motivo y actor del cambio. El nombre físico de la estructura queda
  para el modelado posterior.

Estas definiciones deberán mantenerse alineadas con los documentos de producto,
reglas de negocio, autorización y arquitectura de datos.

---

## 13. Relación con otros documentos

Este documento deberá mantenerse sincronizado con:

- `docs/product/requirements.md`
- `docs/product/open-questions.md`
- `docs/domain/business-rules.md`
- `docs/product/permissions-matrix.md`

También debe mantenerse coordinado con:

- `docs/architecture/authorization.md`
- `docs/architecture/data-architecture.md`
- `docs/database/data-model.md`

Y finalmente:

- ERD
- `schema.prisma`

---

## 14. Estado del documento

Este modelo combina conceptos confirmados, información observada y decisiones
de diseño adoptadas para la consolidación actual. Las decisiones funcionales
oficiales de Royal Prestige que todavía requieran validación no deben confundirse
con estas decisiones de diseño.

El objetivo actual no es representar con certeza la estructura interna de Royal Prestige, sino establecer una abstracción suficientemente sólida para continuar con el diseño del sistema.

Cuando se obtenga información adicional, cada supuesto o decisión provisional
deberá convertirse en uno de los siguientes estados:

- ✅ CONFIRMADO
- 🔎 OBSERVADO
- 🔄 REEMPLAZADO
- ❌ DESCARTADO
- ⚠️ PENDIENTE

No se deberán modificar silenciosamente los supuestos existentes sin registrar el cambio.

---

## 15. Historial de cambios

| Fecha      | Versión | Cambio                                                                              |
|------------|---------|-------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial del modelo organizacional.                                         |
| 01/09/2026 | 0.2     | Incorporación de nomenclatura observada, antigüedad y nuevas consideraciones sobre niveles y jerarquía. |
| 03/09/2026 | 0.3     | Consolidación de niveles, reclutamiento, estados, supervisión e historial organizacional. |
| 03/09/2026 | 0.4     | Ajuste del estado de supuestos y sincronización de decisiones consolidadas. |
