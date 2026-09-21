# Modelo de datos

**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.6
**Última actualización:** 2026-09-03

---

## 1. Objetivo

Este documento define el modelo de datos conceptual de la aplicación interna de Royal Prestige.

Su objetivo es identificar las entidades principales del dominio, sus responsabilidades y las relaciones entre ellas antes de definir el esquema físico de PostgreSQL y Prisma.

Este documento no representa todavía el esquema definitivo de base de datos.

La implementación deberá derivarse de este modelo una vez que las reglas de negocio pendientes hayan sido validadas.

---

## 2. Principios de modelado

El modelo se construye siguiendo los siguientes principios:

- Separar la identidad de una persona de su cuenta de acceso.
- Separar la antigüedad dentro de la empresa de la posición jerárquica.
- Separar el nivel actual del historial de niveles.
- Separar la jerarquía organizacional de las reglas de comisión.
- Conservar historial cuando un dato pueda cambiar y sea relevante para reconstruir situaciones pasadas.
- Evitar almacenar como reglas rígidas aquellos comportamientos comerciales que todavía no fueron confirmados.
- Mantener la identidad interna de los niveles independiente de sus nombres comerciales.
- Diseñar las relaciones jerárquicas de forma que puedan evolucionar sin requerir una reconstrucción del modelo.
- Las restricciones de acceso no dependen únicamente de lo que el frontend muestre; deberán derivarse de las relaciones y permisos definidos en servidor.

---

## 3. Dominios principales

El modelo se divide inicialmente en los siguientes dominios:

```
Organización
├── Employee
├── Level
├── EmployeeLevelHistory
├── EmployeeProgress
└── Supervisor hierarchy

Acceso
├── UserAccount
└── Role / Permission

Ventas
├── Sale
├── SaleItem
└── Product

Comisiones
└── CommissionRule

Formación
└── TrainingContent
```

No todas las entidades anteriores están confirmadas funcionalmente todavía. Las entidades pendientes se mantienen como modelo conceptual para evitar mezclar decisiones de arquitectura con requisitos no confirmados.

---

## 4. Organización

### 4.1 Employee

Representa a la persona que pertenece a la organización comercial.

Conceptualmente contiene información propia de la persona y de su relación con la empresa.

```
Employee
---------
id
employeeCode          ← sequential integer, auto-generated
firstName
lastName
dni                   ← national ID
email
phone
dateOfBirth
street
streetNumber
floor
apartment
city
province
postalCode
joinedAt
currentLevelId
supervisorId
status
deactivatedAt
deactivationReason
createdAt
updatedAt
```

**Responsabilidades:**

`Employee` representa:

- Identidad de la persona dentro de la organización.
- Datos personales de contacto e identificación (DNI, email, teléfono, fecha de nacimiento).
- Dirección residencial.
- Fecha de ingreso.
- Estado dentro de la organización.
- Nivel actual.
- Superior directo actual.
- Código de empleado secuencial (referencia legible para tablas y reportes).

No debería almacenar directamente el historial completo de niveles ni la lógica de comisiones.

**Consideraciones:**

La fecha `joinedAt` representa la antigüedad en la empresa y debe mantenerse independiente del nivel actual.

La fecha de creación de la cuenta de acceso tampoco debe utilizarse automáticamente como fecha de ingreso.

---

## 5. Niveles

### 5.1 Level

Representa la estructura formal de niveles de la organización.

Actualmente se conocen siete niveles:

| Nivel interno | Nombre observado    |
|---------------|---------------------|
| 1             | Vendedor            |
| 2             | Vendedor Junior     |
| 3             | Distribuidor        |
| 4             | Blue                |
| 5             | Royal               |
| 6             | Premier             |
| 7             | Max                 |

**Estado de los nombres:**

Los nombres anteriores son 🔎 OBSERVADOS, no constituyen todavía una definición contractual del sistema.

El identificador interno del nivel debe ser independiente del nombre comercial.

**Conceptualmente:**

```
Level
-----
id
code
rank
name
```

**Por ejemplo:**

```
id: 3
code: LEVEL_03
rank: 3
name: Distribuidor
```

El sistema no debería depender de que "Distribuidor" continúe siendo el nombre utilizado por la empresa.

---

## 6. Historial de niveles

### 6.1 EmployeeLevelHistory

Representa la evolución de un empleado entre los distintos niveles.

```
EmployeeLevelHistory
--------------------
id
employeeId
levelId
startedAt
endedAt
reason
```

**Motivo:**

El nivel de una persona no debe considerarse un atributo inmutable.

Se ha observado que un representante con aproximadamente dos años de antigüedad se encuentra actualmente en nivel 3. También se indicó que la progresión de nivel puede producirse con relativa rapidez.

Todavía no se conocen los criterios exactos de ascenso.

Por ello se separan:

```
Employee.currentLevelId
```

de:

```
EmployeeLevelHistory
```

**Ejemplo:**

```
Employee: Juan Pérez

Nivel 1
2024-06-01 → 2024-10-15

Nivel 2
2024-10-15 → 2025-04-20

Nivel 3
2025-04-20 → null
```

Esto permite determinar el nivel vigente de una persona en cualquier fecha histórica.

También permite obtener:

- Tiempo permanecido en cada nivel.
- Historial de promociones.
- Cantidad de ascensos.
- Nivel vigente en una fecha determinada.

**Regla conceptual:**

Debe existir como máximo un registro de historial abierto para un empleado:

```
endedAt = null
```

Ese registro representa su nivel actual.

Además del historial de nivel, el modelo conceptual debe contemplar un historial
organizacional capaz de conservar, como mínimo, empleado, supervisor, nivel,
inicio y fin de vigencia, motivo y actor del cambio. La estructura física y sus
relaciones definitivas quedan para el modelo relacional posterior.

### 6.2 EmployeeProgress

Registra los puntos acumulados por un empleado para su progresión de nivel.

```
EmployeeProgress
----------------
id
employeeId
type          (SENIORITY | VISIT | SALE | TARGET_ACHIEVED)
points
description
period
createdAt
```

**Propósito:**

Cada fuente de puntos genera un registro en esta tabla. Los puntos se
acumulan de por vida y se utilizan para calcular el progreso hacia el
siguiente nivel.

**Tipo de punto:**

- `SENIORITY`: 1 punto por mes de antigüedad.
- `VISIT`: 2 puntos por visita completada.
- `SALE`: 5 puntos por venta aprobada.
- `TARGET_ACHIEVED`: 10 puntos de bonus por mes que supera el objetivo.

**Regla:**

Al ser promovido un empleado, su progreso vuelve a 0 pero los registros
se conservan como historial.

**Referencia:** business-rules.md REG-082, requirements.md §3.13

---

## 7. Jerarquía organizacional

### 7.1 Supervisor directo

La relación jerárquica se representa inicialmente mediante una relación recursiva entre empleados:

```
Employee
   │
   └── supervisorId → Employee.id
```

Esto constituye un modelo de tipo **Adjacency List**.

**Ejemplo:**

```
Carlos
  │
  ├── Juan
  │
  ├── Pedro
  │
  └── María
```

**En datos:**

```
Carlos.supervisorId = null

Juan.supervisorId = Carlos.id
Pedro.supervisorId = Carlos.id
María.supervisorId = Carlos.id
```

**Decisión de diseño:**

La estrategia inicial para representar la jerarquía será **Adjacency List**.

La razón principal es mantener simples las modificaciones de la estructura jerárquica mientras todavía no se conocen con precisión la frecuencia ni las reglas de reorganización.

Las reglas y políticas jerárquicas pertenecen al dominio. Las consultas concretas
para resolver ramas completas podrán implementarse posteriormente mediante
consultas recursivas de PostgreSQL u otros mecanismos de persistencia encapsulados
en `Infrastructure`, y serán consumidas mediante contratos apropiados.

La implementación no debería permitir que cada parte de la aplicación construya manualmente consultas jerárquicas.

Se deberá encapsular este acceso mediante operaciones conceptuales como:

- `getDirectSupervisor()`
- `getDirectSubordinates()`
- `getAncestors()`
- `getDescendants()`
- `isWithinScope()`

---

## 8. Nivel y jerarquía son conceptos distintos

Una persona puede tener simultáneamente:

```
Nivel actual: 3
Supervisor directo: Carlos
Antigüedad: 2 años
```

Estos valores representan conceptos diferentes.

**Nivel:**

Indica su posición dentro de la estructura comercial.

**Supervisor:**

Indica su relación organizacional actual.

**Antigüedad:**

Indica cuánto tiempo lleva dentro de la organización.

Por lo tanto, no debe asumirse automáticamente que:

```
Nivel 3 = supervisor
```

Ni tampoco:

```
Mayor antigüedad = mayor nivel
```

Las condiciones exactas de promoción permanecen ❓ PENDIENTES.

---

## 9. Equipo

Inicialmente no es necesario crear una entidad `Team` física para representar cada grupo de vendedores.

Un equipo puede derivarse de la jerarquía:

```
Empleado A
   ├── Empleado B
   ├── Empleado C
   └── Empleado D
```

El equipo directo de Empleado A está compuesto por quienes tienen:

```
supervisorId = EmployeeA.id
```

Su rama completa estará compuesta por sus descendientes.

Esto evita duplicar información:

```
Employee
  └── supervisorId
```

En lugar de mantener simultáneamente:

```
Employee.supervisorId
Team
TeamMember
```

Sin una necesidad confirmada.

Una entidad `Team` podría incorporarse posteriormente si aparecen conceptos propios de un equipo que no puedan derivarse de la jerarquía.

---

## 10. Cuenta de acceso

### 10.1 UserAccount

La cuenta utilizada para iniciar sesión debe separarse de `Employee`.

```
UserAccount
-----------
id
employeeId
email
passwordHash
status
lastLoginAt
createdAt
updatedAt
```

**Relación:**

```
Employee 1 ──── 0..1 UserAccount
```

No toda persona registrada necesariamente debe tener una cuenta activa.

**Esta separación permite:**

- Desactivar el acceso sin eliminar a la persona.
- Conservar información histórica.
- Cambiar mecanismos de autenticación.
- Distinguir información organizacional de credenciales.

---

## 11. Ventas

### 11.1 Sale

Representa una operación comercial realizada por un vendedor.

**Conceptualmente:**

```
Sale
----
id
saleNumber
employeeId
saleDate
status
totalAmount
approvedAt
buyerName
clientDocumentType
clientDocumentNumber
clientPhone
clientEmail
clientId
visitId
paymentMethod
paymentStatus
installments
externalPaymentReference
cardBrand
cardLast4
discount
discountReason
deliveryAddress
deliveryStatus
deliveryEstimatedDate
invoiceStatus
externalInvoiceReference
...
```

`saleNumber` es un entero secuencial único global que identifica la venta de
manera operativa. Se asigna al crear la venta en estado `DRAFT`. La
representación visible utiliza el formato `VT-0001`, `VT-0002`, etc. El
prefijo y el zero-padding no se almacenan como parte del campo numérico.

La venta pertenece al empleado que la realizó.

La información básica del comprador pertenece al contexto de la venta. En el
alcance actual no se modela un agregado `Customer` independiente ni un módulo
CRM; no habrá estadísticas, segmentación ni historial comercial centrado en el
comprador.

La venta conserva además un snapshot operativo del nombre, teléfono, email y
documento informado al momento de la carga. El documento es opcional mientras no
se confirme una exigencia legal o fiscal.

`visitId` debe vincular una visita completada durante el flujo manual actual.

Se utilizará inicialmente el siguiente flujo conceptual:

```text
DRAFT → PENDING_REVIEW → APPROVED / REJECTED
                         ↓
                      CANCELLED
```

El vendedor carga su propia venta a partir de la documentación oficial y el
supervisor la revisa. Una venta aprobada puede cancelarse o ajustarse cuando
corresponda, sin eliminación física ni reescritura silenciosa del historial.
Cada venta tiene inicialmente un único vendedor responsable. Las ventas
pendientes o rechazadas no alimentan estadísticas definitivas ni cálculos
definitivos de comisión.

`approvedAt` conserva el momento en que la venta pasó a `APPROVED`. Ese momento
se utiliza para seleccionar la versión vigente de `CommissionRule`.

---

## 12. Detalle de venta

### 12.1 SaleItem

Una venta puede contener uno o varios productos.

```
Sale
 │
 └── SaleItem
       │
       └── Product
```

**Conceptualmente:**

```
SaleItem
--------
id
saleId
productId
quantity
unitPrice
subtotal
```

Esto permite mantener el detalle de los productos involucrados en una operación.

El modelo exacto de detalle dependerá de las reglas comerciales que todavía
deben precisarse, aunque el catálogo inicial será interno y pequeño.

---

## 13. Producto

### 13.1 Product

Representa un producto comercializable.

```
Product
-------
id
code
name
...
```

El sistema tendrá inicialmente un catálogo interno pequeño, no un ecommerce,
para seleccionar productos al registrar ventas, realizar reporting y administrar
información comercial, categorías cuando correspondan, precios y estado
activo/inactivo. Los datos históricos de una venta deberán permanecer coherentes
aunque cambien los datos actuales del producto.

No se debe diseñar todavía un catálogo excesivamente complejo ni incluir
importaciones externas en la primera versión.

Cada línea de venta debe conservar conceptualmente el precio aplicado en el
momento de la operación. El precio actual del catálogo no debe reconstruir ni
alterar el valor histórico de una venta.

---

## 14. Comisiones

Las comisiones deben modelarse como un dominio independiente de la jerarquía.

Las tasas confirmadas vigentes son:

| Nivel | Posición | Comisión |
|-------|----------|----------|
| N1 | Vendedor | 15 % |
| N2 | Vendedor Junior | 20 % |
| N3 | Distribuidor | 30 % |
| N4 | Blue | 40 % |
| N5 | Royal | 50 % |
| N6 | Premier | 60 % |
| N7 | Max | 70 % |

La tasa depende del nivel histórico del empleado que realiza la venta. No se
agregan períodos por antigüedad ni progresiones mensuales. La versión de la
regla se selecciona usando `Sale.approvedAt`.

---

## 15. CommissionRule

No se deben hardcodear los porcentajes directamente en el código de la aplicación.

Conceptualmente se propone una entidad como:

```
CommissionRule
--------------
id
levelId
percentage
effectiveFrom
effectiveTo
```

**Ejemplo conceptual:**

```
Nivel 1 → 15 %
Nivel 2 → 20 %
Nivel 3 → 30 %
Nivel 4 → 40 %
Nivel 5 → 50 %
Nivel 6 → 60 %
Nivel 7 → 70 %
```

**Motivo:**

Las reglas comerciales pueden cambiar.

**Por ejemplo:**

```
Regla vigente 2026
Nivel 1 / Mes 1 → 10 %

Regla vigente 2027
Nivel 1 / Mes 1 → 12 %
```

El historial de vigencia permite evitar que modificar una regla actual altere retroactivamente cálculos históricos.

Conceptualmente, la aplicación debe poder distinguir entre la regla vigente, el
cálculo realizado y la comisión generada. Un ajuste o reversión posterior debe
relacionarse con la operación original sin eliminar el resultado histórico.

---

## 16. Comisión y nivel

La comisión depende del nivel histórico vigente del vendedor en la fecha de la
venta, no del nivel actual leído posteriormente.

El modelo representa:

```
Nivel histórico en `saleDate`
+
Regla vigente en `approvedAt`
```

Esto es importante porque el sistema ya presenta evidencia de que antigüedad y nivel son variables independientes.

La base técnica inicial es `Sale.totalAmount`, conservada como `baseAmount` en
la comisión. El importe se calcula como `baseAmount × percentage / 100` y se
redondea a dos decimales mediante half-up.

### 16.1 CommissionEntry

Representa una comisión generada o un ajuste histórico asociado a una venta.

```
CommissionEntry
---------------
id
saleId
employeeId
ruleId
parentId
type
percentage
baseAmount
amount
saleDate
calculatedAt
```

`EARNED` representa la comisión original creada al aprobar una venta.
`REVERSAL` representa una compensación negativa creada al cancelar una venta y
debe referenciar la entrada original mediante `parentId`. `ADJUSTMENT` queda
disponible para futuras correcciones controladas, pero no se implementa como
operación manual en esta fase.

Las entradas son históricas: no se eliminan ni se sobrescriben para corregirlas.
La persistencia debe impedir más de una entrada `EARNED` por venta y más de una
`REVERSAL` para la entrada original.

---

## 17. Formación

Los vendedores nuevos de nivel 1 deberán disponer de material de capacitación y
otros niveles podrán acceder a contenidos correspondientes.

El dominio de formación podría comenzar conceptualmente con:

```
TrainingContent
---------------
id
title
description
type
url
levelId
status
createdAt
updatedAt
```

La estructura consolidada es categoría → curso → módulo → material. Los
materiales podrán ser PDFs visualizables/descargables y videos mediante una
abstracción de contenido. No se modelará seguimiento individual de aprendizaje,
progreso, completitud, historial de progreso ni assessments en el alcance actual.

El esquema físico de formación continúa pendiente.

---

## 18. Relaciones principales

El modelo conceptual actual puede representarse de la siguiente manera:

```
                           ┌──────────────┐
                           │    Level     │
                           └──────┬───────┘
                                  │
                         currentLevelId
                                  │
┌──────────────┐           ┌──────▼───────┐
│ UserAccount  │──────────▶│   Employee   │
└──────────────┘           └──────┬───────┘
                                  │
                   ┌──────────────┼───────────────┐
                   │              │               │
                   │              │               │
                   ▼              ▼               ▼
          EmployeeLevelHistory  Sale        supervisorId
                   │              │               │
                   ▼              ▼               │
                 Level         SaleItem            │
                                  │                │
                                  ▼                │
                               Product             │
                                                   │
                              ┌────────────────────┘
                              │
                              ▼
                           Employee
```

**Comisiones se mantienen conceptualmente separadas:**

```
Level
  │
  ▼
CommissionRule
```

Y su aplicación dependerá de:

```
Employee
   │
   ├── joinedAt
   └── currentLevel
```

---

## 19. Auditoría

### AuditEvent

> **Estado:** ✅ IMPLEMENTADO (Fase 7)

Registra eventos de auditoría del sistema. Tabla append-only sin operaciones
de actualización ni eliminación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del evento |
| `actorId` | UUID? (FK → UserAccount) | ID del usuario que realizó la acción. `NULL` para eventos del sistema. |
| `actorEmail` | VARCHAR(255)? | Snapshot del email al momento del evento. Preserva legibilidad cuando la cuenta es desactivada. |
| `action` | AuditAction (enum) | Tipo de evento (20 valores: LOGIN_SUCCESS, LOGOUT, SALE_APPROVED, etc.) |
| `resourceType` | VARCHAR(100) | Tipo de recurso afectado (UserAccount, Employee, Sale, etc.) |
| `resourceId` | UUID? | ID del recurso afectado |
| `result` | AuditResult (enum) | SUCCESS, FAILURE o DENIED |
| `correlationId` | UUID? | Agrupa eventos derivados de una misma operación de alto nivel |
| `metadata` | JSONB? | Datos adicionales flexibles (cambios, contexto, etc.) |
| `createdAt` | TIMESTAMPTZ | Timestamp del evento |

**Enum AuditAction** (20 valores):

- Identidad: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED
- Organización: EMPLOYEE_CREATED, EMPLOYEE_UPDATED, EMPLOYEE_DEACTIVATED, EMPLOYEE_LEVEL_CHANGED, EMPLOYEE_SUPERVISOR_CHANGED
- Ventas: SALE_CREATED, SALE_UPDATED, SALE_SUBMITTED, SALE_APPROVED, SALE_REJECTED, SALE_CANCELLED
- Comisiones: COMMISSION_RULE_CREATED, COMMISSION_GENERATED, COMMISSION_REVERSED

**Enum AuditResult:** SUCCESS, FAILURE, DENIED

**Índices:**

- `(actorId)` — consultas por actor.
- `(resourceType, resourceId)` — consultas por recurso.
- `(action)` — consultas por tipo de evento.
- `(correlationId)` — trazabilidad de operaciones derivadas.
- `(createdAt)` — consultas por rango de fechas y ordenamiento.

**Semántica transaccional:**

- Para operaciones críticas (aprobación de venta + generación de comisión), el
  evento se persiste en la misma transacción que la modificación de negocio.
- El fallo del mecanismo de auditoría no convierte la operación de negocio en
  fallida (best-effort).

**Referencias:** `ADR-013`, `data-architecture.md §13`, `system-architecture.md §18`

---

## 19. MonthlyTarget

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 9)

Almacena los objetivos mensuales de ventas configurables por nivel.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, autoincrement) | Identificador único |
| `levelId` | INT (FK → Level, UNIQUE) | Nivel asociado (1–7) |
| `targetSales` | INT | Objetivo de ventas por vendedor al mes |
| `createdAt` | TIMESTAMPTZ | Fecha de creación |
| `updatedAt` | TIMESTAMPTZ | Fecha de última modificación |

**Restricciones:**

- `UNIQUE(levelId)` — cada nivel tiene exactamente un objetivo configurado.
- `targetSales > 0` — el objetivo debe ser positivo.

**Valores iniciales (seed):**

| Nivel | targetSales |
|-------|-------------|
| N1 | 10 |
| N2 | 15 |
| N3–N7 | 10 |

**Cálculo para supervisores (N3+):**

```
objetivo_equipo = targetSales × cantidad de subordinados directos
```

**Referencias:** `business-rules.md REG-055`, `requirements.md §2.6`, `system-architecture.md §16`

---

## 20. Client (Cliente)

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 10)

Almacena información de clientes para el flujo de visitas y programa de referidos.

```
Client
├── id: UUID (PK, interno)
├── clientNumber: INT (único, secuencial)
├── name: String (required)
├── documentNumber: String?
├── phone: String?
├── email: String?
├── address: String (compatibilidad / representación legible)
├── street: String (required)
├── streetNumber: String (required)
├── floor: String?
├── apartment: String?
├── city: String (required)
├── province: String (required)
├── postalCode: String?
├── addressNotes: String?
├── referredBySaleId: UUID? → Sale (si vino de referido)
├── ownerEmployeeId: UUID → Employee (N3+ es su "dueño")
├── createdAt: DateTime
└── updatedAt: DateTime
```

**Relaciones:**

```
Employee (N3+) ──1:N──▶ Client (owner)
Sale ──1:N──▶ Client (referredBySale)
Client ──1:N──▶ Visit
```

**Reglas:**

- Los referidos de vendedores N1/N2 se asignan al N3+ superior (`ownerEmployeeId`).
- Un cliente puede recibir múltiples descuentos por referidos en compras diferentes.

---

## 21. Visit (Visita)

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 10)

Registra visitas a domicilio para demostraciones de productos.

```
Visit
├── id: UUID (PK)
├── visitNumber: INT (único, secuencial)
├── sellerId: UUID → Employee (quien realiza)
├── clientId: UUID → Client
├── assignedById: UUID → Employee (quién asignó)
├── scheduledDate: DateTime
├── completedDate: DateTime?
├── status: Enum [assigned, completed, no_sale, cancelled]
├── notes: Text?
├── visitStreet: String?
├── visitStreetNumber: String?
├── visitFloor: String?
├── visitApartment: String?
├── visitCity: String?
├── visitProvince: String?
├── visitPostalCode: String?
├── visitAddressNotes: String?
├── createdAt: DateTime
└── updatedAt: DateTime
```

**Enum VisitStatus:** `assigned`, `completed`, `no_sale`, `cancelled`

**Relaciones:**

```
Employee (vendedor) ──1:N──▶ Visit (seller)
Employee (supervisor) ──1:N──▶ Visit (assignedBy)
Client ──1:N──▶ Visit
Visit ──1:1──▶ Sale (opcional)
```

**Flujo:**

```
assigned → completed (con venta) → Sale creada
assigned → no_sale (sin venta) → Sin venta
assigned → cancelled
```

---

## 22. ReferralContact (Contacto Referido)

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 10)

Almacena contactos proporcionados por clientes para el programa de referidos.

```
ReferralContact
├── id: UUID (PK)
├── saleId: UUID → Sale
├── clientName: String
├── phone: String
├── email: String?
└── createdAt: DateTime
```

**Relaciones:**

```
Sale ──1:N──▶ ReferralContact
```

**Reglas:**

- Si el cliente proporciona 5 contactos, se aplica 20% de descuento sobre toda la compra.
- Los contactos se agregan a la base de clientes del N3+ superior.

---

## 23. Extensión de Sale

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 10)

Se agregan campos a la entidad `Sale` existente:

| Campo Nuevo | Tipo | Descripción |
|-------------|------|-------------|
| `visitId` | UUID? (FK → Visit) | Vincula venta con visita |
| `clientId` | UUID? (FK → Client) | Vincula venta con cliente |
| `paymentMethod` | VARCHAR(50)? | Método de pago |
| `paymentStatus` | VARCHAR(30)? | Estado operativo del pago |
| `installments` | INT? | Cuotas (si aplica) |
| `externalPaymentReference` | VARCHAR(150)? | Referencia de pago en H&Y Cite |
| `cardBrand` | VARCHAR(40)? | Marca de tarjeta, sin número completo |
| `cardLast4` | VARCHAR(4)? | Últimos cuatro dígitos, si son necesarios |
| `discount` | DECIMAL? | Descuento (20% si 5 referidos) |
| `discountReason` | VARCHAR(100)? | Motivo del descuento |
| `clientDocumentType` | VARCHAR(30)? | Tipo de documento del snapshot |
| `clientDocumentNumber` | VARCHAR(50)? | Documento del snapshot |
| `clientPhone` | VARCHAR(50)? | Teléfono del snapshot |
| `clientEmail` | VARCHAR(255)? | Email del snapshot |
| `deliveryAddress` | TEXT? | Dirección histórica de entrega |
| `deliveryStatus` | VARCHAR(30)? | Estado de entrega |
| `deliveryEstimatedDate` | DATE? | Fecha estimada de entrega |
| `invoiceStatus` | VARCHAR(30)? | Estado de facturación externa |
| `externalInvoiceReference` | VARCHAR(150)? | Referencia de H&Y Cite |

**Campos existentes se mantienen:** `buyerName` se conserva por compatibilidad con datos existentes.

---

## 24. Estado del modelo

| Entidad / concepto       | Estado                          | Observación                          |
|--------------------------|---------------------------------|--------------------------------------|
| Employee                 | ✅ CONFIRMADO                   | Concepto central                     |
| Level                    | ✅ CONFIRMADO                   | Existen 7 niveles                    |
| Nombres comerciales      | 🔎 OBSERVADO                    | Deben validarse                      |
| EmployeeLevelHistory     | 🚧 DECISIÓN DE DISEÑO           | Se conserva historial                |
| Supervisor hierarchy     | ✅ CONFIRMADO / 🔎 OBSERVADO    | Existe estructura jerárquica         |
| Adjacency List           | 🚧 DECISIÓN DE DISEÑO           | Estrategia inicial                   |
| UserAccount              | ✅ CONFIRMADO                   | Se separa de Employee                |
| Sale                     | ❓ PENDIENTE                    | Detalles físicos y reglas de transición pendientes |
| SaleItem                 | ❓ PENDIENTE                    | Detalle físico depende del modelo comercial       |
| Product                  | 🔎 OBSERVADO / 🚧 DECISIÓN DE DISEÑO | Catálogo interno inicial; detalles pendientes |
| CommissionRule           | 🚧 DECISIÓN DE DISEÑO           | Reglas configurables y temporales    |
| Formación                | ✅ IMPLEMENTADO               | Categorías, cursos, módulos y materiales implementados |
| TrainingProgress         | 🔄 REEMPLAZADO                  | Seguimiento individual fuera del alcance actual  |
| AuditEvent               | ✅ IMPLEMENTADO                 | Append-only, 20 acciones tipadas     |
| MonthlyTarget            | ✅ IMPLEMENTADO                 | Objetivos mensuales por nivel (Phase 9) |
| EmployeeProgress         | ✅ IMPLEMENTADO                 | Sistema de puntos para progresión de nivel |

---

## 21. Información que todavía no debe convertirse en restricciones de base de datos

Hasta recibir confirmación de la empresa, no deben establecerse como restricciones rígidas:

- Tiempos mínimos para ascender.
- Criterios de promoción.
- Relaciones exactas entre niveles 4–7.
- Cantidad máxima de subordinados.
- Obligación de que determinados niveles tengan equipo.
- Bases comerciales futuras distintas de `Sale.totalAmount`.
- Detalles de futuras integraciones de ventas.
- Extensiones futuras del catálogo y de la capacitación.

El modelo debe permitir representar estos escenarios posteriormente sin requerir una reestructuración completa de la base.

---

## 22. Próximo paso

El siguiente nivel de detalle será transformar este modelo conceptual en un modelo relacional, definiendo:

- Claves primarias.
- Claves foráneas.
- Cardinalidades.
- Restricciones.
- Índices.
- Unicidad.
- Integridad temporal.
- Estrategia para consultas jerárquicas.
- Entidades definitivas del esquema Prisma.

> La estrategia de auditoría quedó definida en la Fase 7 (ADR-013) con el modelo
> `AuditEvent` y su persistencia detrás de `AuditPort`.

Esta transformación deberá respetar la estrategia arquitectónica definida en
`docs/architecture/data-architecture.md`.

Antes de llegar a ese punto deberá reducirse la cantidad de incógnitas de `open-questions.md`, especialmente en ventas, promociones, niveles 4–7 y comisiones.

---

## 23. Historial de cambios

| Fecha      | Versión | Cambio |
|------------|---------|--------|
| 03/09/2026 | 0.3     | Sincronización de la separación entre políticas jerárquicas y consultas concretas de persistencia. |
| 03/09/2026 | 0.4     | Incorporación del concepto de historial organizacional y consolidación de ventas, catálogo y capacitación. |
| 03/09/2026 | 0.5     | Consolidación del comprador contextual, comisión inicial y alcance simplificado de capacitación. |
| 03/09/2026 | 0.6     | Comisión inicial vigente N1 → 15 % (la regla de 50 % queda REEMPLAZADA como antecedente). |
| 07/09/2026 | 0.7     | Tasas N1–N7 confirmadas, `Sale.approvedAt`, `CommissionEntry.baseAmount` y entradas históricas EARNED/REVERSAL incorporadas al modelo. |
| 08/09/2026 | 0.8     | Fase 7: sección AuditEvent incorporada al modelo conceptual con sus campos, índices y semántica transaccional. |
| 08/09/2026 | 0.9     | Fase 8: estado de Formación actualizado a IMPLEMENTADO con estructura categorías→cursos→módulos→materiales. |
| 08/09/2026 | 1.0     | Fase 9: sección MonthlyTarget incorporada al modelo conceptual con objetivos mensuales por nivel. |
