# Arquitectura general del sistema

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.6  
**Última actualización:** 2026-09-08

---

## 1. Propósito y alcance

Este documento describe la arquitectura técnica general propuesta para Royal Prestige. Su objetivo es establecer los límites de la aplicación, la dirección de las dependencias y los mecanismos técnicos comunes que deberán respetarse durante la implementación.

La arquitectura está pensada para una aplicación web interna de gestión y analítica de una organización comercial jerárquica. Debe permitir evolucionar cuando se definan reglas funcionales adicionales, sin acoplarse a proveedores externos ni a decisiones físicas todavía no cerradas.

Este documento no reemplaza a:

- `docs/product/requirements.md`, fuente de verdad de los requisitos.
- `docs/product/open-questions.md`, fuente de verdad de las cuestiones pendientes.
- `docs/product/permissions-matrix.md`, fuente de verdad de permisos y alcances.
- `docs/domain/organizational-model.md`, fuente de verdad del modelo organizacional.
- `docs/domain/business-rules.md`, fuente de verdad de las reglas de negocio.
- `docs/architecture/architecture-decisions.md`, fuente de verdad de las decisiones arquitectónicas.
- `docs/database/data-model.md`, fuente de verdad del modelo de datos conceptual.
- `authorization.md`, que contiene el detalle técnico de autorización; la
  estrategia arquitectónica transversal está formalizada en `ADR-009`.
- `data-architecture.md`, que describe con mayor detalle la arquitectura de datos.

Cuando una definición de negocio continúe pendiente, la arquitectura deberá aislarla mediante interfaces y límites estables, sin convertirla en una restricción definitiva.

---

## 2. Estado y clasificación de las decisiones

Este documento utiliza las siguientes clasificaciones:

- **DECISIÓN YA TOMADA** — decisión registrada previamente en la documentación del proyecto.
- **DECISIÓN DERIVABLE** — consecuencia directa de requisitos, reglas o decisiones existentes.
- **DECISIÓN PROPUESTA** — diseño técnico recomendado en este documento, todavía sujeto a validación arquitectónica formal cuando corresponda.
- **DEPENDE DE NEGOCIO** — la definición técnica no puede cerrarse sin resolver una cuestión funcional.
- **PENDIENTE** — falta completar la definición técnica, aunque no necesariamente requiera una decisión de negocio.

Las decisiones **PROPUESTAS** de este documento no convierten información `OBSERVADA`, `ASUMIDA` o `PENDIENTE` en información confirmada.

---

## 3. Principios arquitectónicos

La solución seguirá estos principios:

1. **Simplicidad inicial.** No se incorporarán microservicios, colas, Kubernetes, event sourcing ni otra infraestructura distribuida sin una necesidad demostrada.
2. **Server-first.** Las decisiones de identidad, autorización, alcance, validación y persistencia ocurren en el servidor.
3. **Dominio independiente.** El dominio no dependerá de Next.js, React, Prisma, cookies, headers, un proveedor de autenticación ni un proveedor externo.
4. **Separación de responsabilidades.** La presentación, los casos de uso, las reglas de negocio y los adaptadores técnicos tendrán límites explícitos.
5. **Mínimo privilegio.** Un permiso no implica por sí mismo acceso global; se debe verificar también el alcance autorizado.
6. **Evolución controlada.** Las incertidumbres de negocio se aislarán detrás de puertos, políticas y servicios reemplazables.
7. **Persistencia con historial.** Los cambios relevantes no deben destruir la capacidad de interpretar información histórica cuando el negocio lo requiera.
8. **Trazabilidad.** Las operaciones relevantes deberán poder relacionarse con requisitos, reglas, permisos, implementación y pruebas cuando aporte valor.
9. **Seguridad por diseño.** Ocultar una acción en la interfaz nunca será la única medida de protección.

**Clasificación:**

- **DECISIÓN YA TOMADA:** simplicidad, mantenibilidad, seguridad server-side y separación entre dominio e interfaz.
- **DECISIÓN DERIVABLE:** la aplicación debe comenzar como una unidad de despliegue única y modular.

---

## 4. Estilo arquitectónico general

La arquitectura será un **modular monolith**: una única aplicación desplegable que contiene módulos de negocio con límites explícitos y una arquitectura por capas.

```text
                    Aplicación Next.js
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Presentation        Application         Infrastructure
        │                   │                   │
        └─────────────── Domain ────────────────┘
                            │
                     Puertos / contratos
                            │
       PostgreSQL · autenticación · storage · integraciones
```

La unidad de despliegue será inicialmente la aplicación Next.js. PostgreSQL y los servicios externos estrictamente necesarios serán dependencias de la aplicación, no módulos distribuidos del dominio.

**Clasificación:**

- **DECISIÓN YA TOMADA:** modular monolith con separación por capas.
- **DECISIÓN DERIVABLE:** evitar microservicios e infraestructura distribuida en la etapa actual.
- **PENDIENTE:** formalizar las decisiones que tengan impacto significativo mediante ADRs posteriores.

---

## 5. Estructura de alto nivel y módulos

Los módulos principales serán:

```text
Identity & Access
Organization
Sales
Analytics
Commissions
Training
Audit
Integrations
```

### Identity & Access

Gestiona la identidad autenticada, las cuentas de acceso, las sesiones y el contexto necesario para identificar al empleado asociado. No debe contener la jerarquía organizacional ni las reglas de comisiones.

El mecanismo inicial de acceso será email + contraseña. No se utilizarán inicialmente emails corporativos obligatorios ni OAuth con Google o Microsoft. Las cuentas asociadas a empleados inactivos no podrán autenticarse.

### Organization

Gestiona empleados, niveles, antigüedad, supervisor directo, jerarquía,
historial de niveles, historial organizacional y la resolución de equipos o
ramas organizacionales. La relación jerárquica inicial se basa en
`Employee.supervisorId`. Los cambios de nivel y de supervisor son explícitos y
no se realizan promociones, demociones ni reasignaciones automáticas.

### Sales

Representa las ventas cargadas inicialmente desde la documentación oficial de la empresa y sometidas a revisión del supervisor. La primera versión no depende de sistemas externos ni de sincronizaciones; la arquitectura conserva puertos para futuras integraciones.

### Analytics

Proporciona consultas de estadísticas, agregaciones por período, métricas propias y de estructuras autorizadas, comparaciones, rankings y reportes.

### Commissions

Gestiona reglas de comisión configurables y versionadas, y calcula comisiones y
ajustes según las reglas que se definan.

### Training

Gestiona categorías, cursos, módulos, materiales y publicación. Los
assessments/quizzes y el seguimiento individual de aprendizaje quedan fuera del
alcance actual.

### Audit

Registra eventos relevantes de las operaciones del sistema. El catálogo final de eventos y el período de conservación todavía deben definirse.

### Integrations

Contiene adaptadores para futuras integraciones, importaciones, sincronizaciones
y webhooks. La primera versión no depende de sistemas externos ni realiza
sincronizaciones. No debe introducir modelos externos directamente en el dominio.

**Clasificación:**

- **DECISIÓN DERIVABLE:** estos módulos corresponden a las áreas funcionales y conceptos ya documentados.
- **DECISIÓN YA TOMADA:** mantener los módulos dentro del mismo proceso y comunicar sus capacidades mediante casos de uso y contratos.
- **DEPENDE DE NEGOCIO:** los límites definitivos de `Sales`, `Commissions`, `Training` y `Organization` dependen de preguntas abiertas.

---

## 6. Capas y responsabilidades

### 6.1. Presentation

Incluye páginas y layouts de Next.js, Server Components, Client Components interactivos, formularios, tablas, gráficos, navegación y estados de carga, error y ausencia de datos.

No incluye reglas de autorización definitivas, cálculo de comisiones, consultas directas a Prisma ni reglas importantes del dominio.

### 6.2. Application

Incluye casos de uso y servicios de consulta. Coordina resolución de sesión, autorización, validación de entradas, ejecución de reglas de negocio, transacciones, persistencia, auditoría e integración con servicios externos.

Ejemplos conceptuales:

```text
CreateEmployee
ChangeEmployeeLevel
GetOwnMetrics
GetTeamMetrics
RegisterSale
ImportSales
CalculateCommission
PublishTrainingContent
ExportReport
```

Estos nombres son ejemplos arquitectónicos, no una confirmación de casos de uso funcionales todavía no definidos.

### 6.3. Domain

Incluye entidades, value objects, reglas de negocio, políticas, servicios de dominio, operaciones jerárquicas, cálculo de antigüedad y contratos conceptuales para comisiones.

Las reglas y políticas jerárquicas pueden pertenecer al dominio. En cambio, las
consultas concretas de persistencia que las implementan, incluidas las consultas
recursivas de PostgreSQL, pertenecen a Infrastructure.

No debe conocer HTTP, React, Next.js, Prisma, proveedores de autenticación, cookies, headers ni servicios de almacenamiento.

### 6.4. Infrastructure

Incluye adaptadores concretos para Prisma y PostgreSQL, autenticación y sesiones, almacenamiento de archivos, APIs externas, jobs, logging y métricas.

La infraestructura implementa puertos definidos por las capas internas, en lugar de imponer sus modelos al dominio.

**Clasificación:**

- **DECISIÓN YA TOMADA:** separación entre presentación, aplicación, dominio y persistencia cuando corresponda.
- **DECISIÓN DERIVABLE:** el dominio no debe depender de frameworks ni proveedores técnicos.
- **DECISIÓN PROPUESTA:** utilizar una capa Application explícita para evitar que Server Actions o Route Handlers contengan lógica de negocio.

---

## 7. Reglas de dependencia

La dirección preferida de dependencias es:

```text
Presentation ───────▶ Application ───────▶ Domain
                           │                 ▲
                           ▼                 │
                         Ports ◀──── Infrastructure
```

Reglas:

- `Domain` no depende de ninguna capa externa.
- `Application` puede depender de `Domain` y de interfaces/puertos.
- `Presentation` invoca casos de uso, pero no repositorios concretos.
- `Infrastructure` implementa puertos y puede depender de Prisma o SDKs.
- Un módulo no debe acceder directamente a las tablas de otro módulo.
- Las comunicaciones entre módulos deben realizarse mediante casos de uso, servicios o contratos explícitos.

Las interfaces de repositorio no deben ocultar consultas arbitrarias. Deben expresar necesidades del caso de uso y aplicar el alcance autorizado.

**Clasificación:**

- **DECISIÓN YA TOMADA:** dependencias hacia adentro y puertos/adaptadores.
- **PENDIENTE:** definir contratos concretos entre módulos durante el diseño de casos de uso.

---

## 8. Next.js App Router

Next.js App Router será la frontera de presentación y ejecución server-side de la aplicación web. Se utilizará para layouts públicos y autenticados, páginas funcionales, carga de datos, Server Actions, Route Handlers y estados de carga, error y `not-found`.

La estructura exacta de rutas deberá seguir los requisitos y permisos aprobados. Los grupos de rutas pueden separar conceptualmente áreas públicas, autenticadas y administrativas, sin que esa separación sustituya la autorización server-side.

El diseño de Stitch es una referencia visual para el panel; no define rutas, permisos, datos reales ni contratos de aplicación. Sus datos simulados, objetivos y acciones visuales deberán validarse contra las fuentes de verdad antes de implementarse.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Next.js App Router es la aplicación principal.
- **DECISIÓN DERIVABLE:** la aplicación debe utilizar la separación de componentes server/client propia del App Router.
- **PENDIENTE:** estructura definitiva de rutas y layouts.

---

## 9. Server Components y Client Components

### Server Components

Serán la opción por defecto para páginas, layouts, lecturas de dashboard, tablas, detalles, contenido protegido y consultas iniciales de analytics.

Un Server Component podrá invocar directamente un servicio de consulta de Application. No debe realizar una llamada HTTP contra la propia aplicación solo para consultar datos internos.

```text
Server Component
    ↓
Application Query Service
    ↓
Authorization / Scope
    ↓
Repository
    ↓
Prisma / PostgreSQL
```

### Client Components

Se utilizarán únicamente cuando exista una necesidad real de interacción en el navegador, como filtros interactivos, gráficos con interacción, modales, formularios con comportamiento local, selección de archivos o feedback visual de una mutación.

No deben contener secretos, calcular scopes ni constituir el mecanismo de autorización.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Server Components por defecto y Client Components solo cuando sean necesarios.
- **DECISIÓN PROPUESTA:** priorizar lecturas server-side y limitar el estado global en el cliente.
- **PENDIENTE:** bibliotecas concretas para gráficos o componentes interactivos.

---

## 10. Server Actions y Route Handlers

### Server Actions

Se utilizarán para mutaciones iniciadas desde la interfaz cuando sean apropiadas: crear o modificar empleados, cambiar relaciones autorizadas, registrar una venta si se confirma el registro manual, publicar materiales, modificar configuración autorizada o solicitar exportaciones.

Una Server Action será un adaptador delgado:

```text
Server Action
    ↓
Validación sintáctica de entrada
    ↓
Resolución de sesión
    ↓
Caso de uso
    ↓
Autorización, dominio, transacción y auditoría
```

### Route Handlers

Se reservarán para límites HTTP reales: webhooks, callbacks de autenticación, integraciones externas, descargas protegidas, exportaciones, endpoints técnicos, endpoints consumidos por otros clientes y health checks.

No se crearán Route Handlers únicamente para que un Server Component consulte la misma aplicación.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Server Actions para mutaciones de UI cuando sean apropiadas y Route Handlers para límites HTTP reales.
- **DECISIÓN PROPUESTA:** mantener ambos mecanismos como adaptadores de casos de uso, no como lugares de reglas de negocio.
- **DEPENDE DE NEGOCIO:** endpoints de ventas, importaciones y webhooks dependen del origen real de los datos.

---

## 11. Flujo de una operación protegida

Toda operación protegida deberá seguir conceptualmente este flujo:

```text
Request
  ↓
Protección gruesa de ruta, si corresponde
  ↓
Resolver sesión server-side
  ↓
Resolver UserAccount y Employee
  ↓
Resolver rol, nivel y posición organizacional
  ↓
Verificar permiso
  ↓
Resolver scope permitido
  ↓
Aplicar el scope a la consulta o mutación
  ↓
Validar entrada y reglas de dominio
  ↓
Ejecutar caso de uso
  ↓
Persistir y auditar
  ↓
Mapear resultado o error
```

El middleware, si se utiliza, solo realizará protección gruesa, redirecciones o preparación de contexto. Nunca será la única autorización.

Los identificadores recibidos del cliente (`userId`, `employeeId`, `teamId`) son parámetros de búsqueda, no evidencia de autorización.

---

## 12. Autenticación y autorización

### Autenticación

La autenticación se ubicará en Infrastructure mediante un adaptador del proveedor concreto. El mecanismo inicial será email + contraseña, sin emails corporativos obligatorios ni OAuth con Google o Microsoft, conforme a `ADR-010`. Application consumirá una interfaz de sesión que permita obtener la identidad autenticada sin conocer cómo se creó o transportó la sesión.

```text
Auth Provider Adapter
    ↓
Authenticated Identity
    ↓
Application Context
```

La relación conceptual seguirá siendo:

```text
Employee 1 ──── 0..1 UserAccount
```

El proveedor concreto de autenticación y de correo permanece pendiente. La recuperación utilizará conceptualmente email y tokens temporales de un solo uso. Se permitirán sesiones simultáneas inicialmente; `ADMIN` podrá revocarlas cuando corresponda. 2FA se contempla para `ADMIN` como medida de seguridad y como capacidad extensible, no como requisito universal confirmado.

### Autorización

La autorización será una capacidad transversal de Application, apoyada por `Organization` para resolver la posición jerárquica y por los repositorios para limitar los datos.

```text
Usuario autenticado
    ↓
Rol + nivel + posición
    ↓
Permiso
    ↓
Scope
    ↓
Recurso autorizado
```

Permiso y scope son dimensiones distintas. Los scopes conceptuales documentados son `PROPIO`, `EQUIPO`, `RAMA`, `GLOBAL` y `SISTEMA`.

La autorización detallada está documentada en `authorization.md` y la estrategia
arquitectónica transversal está formalizada en `ADR-009`. Este documento
mantiene únicamente la visión arquitectónica general y remite a esos documentos
para el detalle correspondiente.

**Clasificación:**

- **DECISIÓN YA TOMADA:** autorización server-side, separación entre permisos y scopes y mínimo privilegio.
- **DECISIÓN DERIVABLE:** la autenticación concreta debe quedar detrás de un adaptador.
- **DECISIÓN YA TOMADA:** separar resolución de política (`can`) y resolución de alcance (`scope`/`isWithinScope`).
- **DEPENDE DE NEGOCIO:** reglas de niveles 4–7, `ADMIN`, múltiples supervisores/equipos y visibilidad de ramas.
- **DECISIÓN YA TOMADA:** el detalle técnico de autorización se encuentra en
  `authorization.md` y la estrategia transversal está formalizada en `ADR-009`.

---

## 13. Jerarquía organizacional

La jerarquía inicial se representará mediante una relación recursiva:

```text
Employee.supervisorId → Employee.id
```

Este patrón es una **Adjacency List**, decisión registrada en `ADR-004`.

Las consultas jerárquicas deberán encapsularse en `Organization` y en sus adaptadores de persistencia:

```text
getDirectSupervisor()
getDirectSubordinates()
getAncestors()
getDescendants()
isWithinScope()
```

Las consultas recursivas de PostgreSQL no deben construirse manualmente en componentes ni repetirse en cada caso de uso.

El nivel, la antigüedad, el supervisor y la pertenencia a un equipo no deben tratarse como sinónimos. La responsabilidad exacta de cada nivel y la relación entre equipo y jerarquía siguen siendo cuestiones de negocio.

### Equipo

El modelo de datos propone inicialmente derivar el equipo directo de la jerarquía, mientras que el modelo organizacional mantiene abierta la alternativa de un equipo explícito.

Por ello, la arquitectura propuesta es:

- utilizar una abstracción de consulta de equipo;
- no propagar la decisión `Team`/`TeamMember` por toda la aplicación;
- permitir que el adaptador evolucione si el negocio confirma una entidad `Team`.

Esto no decide definitivamente el modelo de dominio.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Adjacency List como estrategia inicial.
- **DECISIÓN DERIVABLE:** las consultas de jerarquía deben estar encapsuladas.
- **DECISIÓN PROPUESTA:** introducir un servicio de resolución jerárquica y consultas conscientes del scope.
- **DEPENDE DE NEGOCIO:** múltiples supervisores, múltiples equipos, responsabilidades de niveles 4–7 e historial organizacional.

---

## 14. Persistencia y acceso a datos

### PostgreSQL

PostgreSQL será la dirección inicial para la persistencia transaccional y las consultas jerárquicas y analíticas iniciales. Se utilizará para integridad referencial, transacciones, relaciones organizacionales, historial, consultas recursivas y agregaciones iniciales.

### Prisma

Prisma será el adaptador/ORM de acceso tipado a PostgreSQL. Su papel será implementar repositorios, ejecutar transacciones, administrar migraciones cuando se defina el esquema y mapear datos de persistencia a modelos de aplicación.

El modelo Prisma no será el modelo de dominio y no deberá importarse en Domain ni en componentes de React.

Las consultas recursivas o analíticas que requieran SQL específico podrán encapsularse en Infrastructure, sin distribuir SQL por la aplicación.

El esquema físico, índices, unicidades y restricciones definitivas se definirán después de resolver las preguntas relevantes del modelo de datos.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Adjacency List, historial de niveles y separación de conceptos principales.
- **DECISIÓN YA TOMADA:** PostgreSQL es la base de datos del proyecto y Prisma es el ORM/adaptador de acceso a PostgreSQL.
- **DECISIÓN YA TOMADA:** utilizar Prisma detrás de repositorios y servicios de consulta, manteniendo su implementación dentro de Infrastructure.
- **DEPENDE DE NEGOCIO:** esquema final de ventas, equipos, productos, comisiones y capacitación.
- **DECISIÓN YA TOMADA:** la estrategia arquitectónica de datos está documentada
  en `data-architecture.md`, y las decisiones específicas se registran mediante
  ADR cuando corresponde.

---

## 15. Transacciones y consistencia

Las operaciones que modifiquen varios conceptos relacionados deberán ser atómicas.

Ejemplo conceptual para un cambio de nivel:

```text
1. Resolver identidad.
2. Verificar permiso y alcance.
3. Validar el nivel destino.
4. Cerrar el historial vigente.
5. Crear el nuevo registro histórico.
6. Actualizar currentLevelId.
7. Registrar auditoría.
8. Confirmar la transacción.
```

La actualización del nivel actual y su historial no debe quedar parcialmente aplicada. La misma consideración se aplica a cambios organizacionales y operaciones que combinen persistencia de negocio con auditoría, cuando la política de auditoría lo requiera.

No se propone event sourcing en esta etapa.

- **DECISIÓN DERIVABLE:** el nivel actual y el historial deben mantenerse consistentes.
- **DECISIÓN PROPUESTA:** transacciones explícitas en casos de uso de escritura.
- **PENDIENTE:** definir concurrencia, bloqueos e integridad temporal al diseñar el esquema relacional.

---

## 16. Analytics y reporting

**Implementado (Phase 9):**

El módulo `analytics` proporciona el dashboard principal con KPIs, gráficos y
tabla de rendimiento. La arquitectura sigue el patrón de lectura separada:

```text
Dashboard Page (Server Component)
    ↓
GetDashboardDataUseCase (Application)
    ↓
Authorization / Scope resolution
    ↓
AnalyticsReadRepository (Infrastructure)
    ↓
Prisma aggregate / groupBy / $queryRaw
    ↓
PostgreSQL
```

**Componentes implementados:**

- `GetDashboardDataUseCase`: orquesta todas las consultas del dashboard.
  Resuelve scope (OWN/TEAM/BRANCH/GLOBAL) según nivel y rol.
- `PrismaAnalyticsRepository`: implementa agregaciones SQL para KPIs,
  gráficos y tabla de rendimiento.
- `MonthlyTarget`: tabla de objetivos mensuales configurables por nivel.
- Componentes de presentación: MetricCard, SalesBarChart, LevelDistributionChart,
  TeamPerformanceTable, PeriodSelector.

**Períodos soportados:** Hoy, Esta Semana, Este Mes.

**Gráficos:** Recharts (librería de visualización para React).

No se incorporará inicialmente un data warehouse, un microservicio de analytics
ni una infraestructura distribuida.

La evolución podrá incluir, si el volumen lo justifica, índices específicos,
vistas o materialized views, tablas de agregados, precálculos mediante jobs,
réplicas de lectura o un almacén analítico separado.

La interfaz de aplicación debe permanecer estable para permitir esos cambios.
Toda consulta analítica deberá respetar el scope del usuario. No se deben
obtener datos globales para filtrarlos únicamente en el navegador.

Las métricas, objetivos, períodos, rankings y definiciones de rendimiento
continúan sujetos a `requirements.md` y `open-questions.md`.

- **DECISIÓN YA TOMADA:** no introducir infraestructura analítica distribuida prematuramente.
- **DECISIÓN IMPLEMENTADA:** consultas de lectura separadas sobre PostgreSQL via AnalyticsReadRepository.
- **DECISIÓN IMPLEMENTADA:** objetivos mensuales por nivel en tabla monthly_target.
- **DECISIÓN IMPLEMENTADA:** Recharts como librería de gráficos.
- **PENDIENTE:** establecer umbrales de volumen y necesidades de rendimiento.

---

## 17. Validación y manejo de errores

La validación deberá ocurrir en cada frontera server-side y tendrá varias capas:

```text
Entrada externa
    ↓
Forma, tipos y límites
    ↓
Autorización
    ↓
Reglas de dominio
    ↓
Integridad de persistencia
```

Se deberán validar, según corresponda, tipos y formatos, fechas y zonas horarias, importes y porcentajes, identificadores, relaciones organizacionales, estados, archivos, URLs externas, paginación y límites de consulta.

El cliente puede ofrecer validación para mejorar la experiencia, pero no será la validación de seguridad.

Se recomienda utilizar errores tipados conceptualmente:

```text
AuthenticationError
AuthorizationError
ValidationError
DomainRuleError
NotFoundError
ConflictError
IntegrationError
InfrastructureError
```

Los adaptadores de Next.js mapearán estos errores a respuestas o mensajes seguros. No se expondrán stack traces, credenciales, detalles de Prisma ni información sensible.

- **DECISIÓN YA TOMADA:** validar entradas y aplicar reglas server-side.
- **DECISIÓN PROPUESTA:** contratos de entrada por caso de uso y errores tipados.
- **PENDIENTE:** mecanismo concreto de validación y formato de respuesta.
- **DEPENDE DE NEGOCIO:** campos y reglas específicas de cada operación.

---

## 18. Auditoría y observabilidad

### Auditoría

Application utiliza un contrato o puerto de auditoría (`AuditPort`) desde los
casos de uso. La implementación concreta de ese contrato pertenece a
Infrastructure (`PrismaAuditAdapter`). La auditoría no se integra desde la
interfaz.

Un evento de auditoría contiene:

```text
actorId        — ID del usuario que realizó la acción
actorEmail     — Snapshot del email al momento del evento
action         — Tipo de acción (enum AuditAction, 20 valores)
resourceType   — Tipo de recurso afectado
resourceId     — ID del recurso afectado
result         — SUCCESS, FAILURE o DENIED
correlationId  — Agrupa eventos derivados de una misma operación
metadata       — Datos adicionales flexibles (JSONB)
createdAt      — Timestamp del evento
```

Para operaciones críticas, el evento se persiste en la misma transacción que
la modificación (`PrismaTransactionScopedAuditAdapter`). El registro es
append-only desde el punto de vista de la aplicación.

La semántica es best-effort: si el mecanismo de auditoría falla, la operación
de negocio se confirma de todas formas. Si la operación de negocio falla y se
revierte, los eventos de auditoría asociados también desaparecen (correcto).

**Lectura:** Los eventos son consultables únicamente por usuarios con permiso
`audit.read` (rol ADMIN). El `GetAuditEventsUseCase` provee filtros por
actor, acción, tipo de recurso, resultado y rango de fechas, con paginación.

**Pendiente:** Política de retención, exportación y cleanup periódico.

### Observabilidad

La aplicación deberá contemplar inicialmente logs estructurados, correlation/request ID, errores centralizados, duración de consultas relevantes, fallos de integraciones y jobs, y denegaciones de autorización sin exponer datos sensibles.

No se registrarán contraseñas, tokens, URLs firmadas ni datos comerciales o personales innecesarios.

- **DECISIÓN DERIVABLE:** operaciones críticas y seguridad requieren trazabilidad.
- **DECISIÓN YA TOMADA (ADR-013):** auditoría desde casos de uso mediante AuditPort, 20 eventos tipados, lectura restringida a ADMIN.
- **PENDIENTE:** retención, exportación, cleanup periódico.

---

## 19. Integraciones externas

Las integraciones se aislarán mediante puertos y adaptadores:

```text
Application Port
    ↓
Anti-corruption Layer
    ↓
External Adapter
    ↓
External System
```

La capa anticorrupción transformará modelos y estados externos a modelos internos. El dominio no conocerá formatos, SDKs, URLs, tokens ni códigos de error de terceros.

Las importaciones y sincronizaciones deberán considerar idempotencia, deduplicación, reintentos, errores parciales, trazabilidad, estado de sincronización y consistencia temporal.

La primera versión no depende de un sistema externo de ventas. El vendedor carga su propia venta utilizando la documentación oficial de la empresa; la venta queda pendiente de revisión y luego puede ser aprobada o rechazada por el supervisor. Los adaptadores para futuras integraciones permanecen disponibles, pero no forman parte del flujo inicial.

- **DECISIÓN DERIVABLE:** las integraciones deben quedar fuera del dominio.
- **DECISIÓN PROPUESTA:** puertos, adaptadores y anti-corruption layer.
- **DEPENDE DE NEGOCIO:** sistemas existentes, fuente maestra y frecuencia de sincronización.
- **PENDIENTE:** contratos concretos de integración.

---

## 19. Visitas, Clientes y Programa de Referidos

> **Estado:** 🚧 DECISIÓN DE DISEÑO (Phase 10)

El sistema debe soportar el flujo completo de visitas a domicilio, gestión de clientes y programa de referidos.

### Entidades

- **Client**: Almacena información de clientes (name, phone, email, address).
- **Visit**: Registra visitas a domicilio (seller, client, assignedBy, status).
- **ReferralContact**: Almacena contactos referidos para el programa de descuentos.

### Flujo Principal

```
1. N3+ recibe clientes de N4+
2. N3+ asigna clientes a vendedores de su equipo
3. Vendedor realiza visita
4. Vendedor carga info en sistema (con o sin venta)
5. Si hay venta → se crea con productos, pago, referidos, descuento
6. Supervisor revisa y aprueba/rechaza
```

### Sidebar

- "Mis Visitas" (todos): tabla de visitas del vendedor.
- "Clientes" (N3+): tabla de clientes del supervisor.
- "Mi Equipo" (N3+): tabla de vendedores del equipo.

### Permisos

- `client.view`, `client.create`, `client.update`, `client.assign`
- `visit.view`, `visit.create`, `visit.update`
- `referral.view`, `referral.create`

**Referencia:** ADR-014, data-model.md §20-23, business-rules.md REG-066–071

---

## 20. Procesos asíncronos y jobs

Las operaciones pequeñas y previsibles serán síncronas inicialmente. Podrían requerir ejecución asíncrona las importaciones grandes, sincronizaciones periódicas, exportaciones pesadas, procesamiento de archivos, recálculos masivos y notificaciones.

No se incorporará una cola o un worker distribuido hasta que exista una necesidad concreta de volumen, duración o reintento.

Los casos potencialmente asíncronos deberán aislarse detrás de una interfaz de job, de modo que inicialmente puedan ejecutarse de forma simple y luego migrar a un mecanismo de cola sin cambiar el dominio.

- **DECISIÓN YA TOMADA:** evitar infraestructura adicional prematura.
- **DECISIÓN PROPUESTA:** ejecución síncrona inicial y abstracción mínima para jobs futuros.
- **DEPENDE DE NEGOCIO:** volumen de ventas, integraciones y exportaciones.
- **PENDIENTE:** tecnología de jobs y condiciones de ejecución.

---

## 21. Archivos y videos

Los metadatos de capacitación y el contenido binario deben mantenerse conceptualmente separados:

```text
TrainingContent metadata
        +
FileStorage abstraction
        +
Authorization
```

La base de datos conservará metadatos y referencias. El contenido podrá estar en un proveedor de almacenamiento externo u otra infraestructura, sin que el dominio dependa de ella.

El puerto de almacenamiento deberá poder representar operaciones como:

```text
put()
getMetadata()
createDownloadUrl()
createPlaybackUrl()
delete()
```

Para recursos protegidos se deberán verificar permisos antes de entregar una descarga o URL de reproducción. No se deben utilizar URLs públicas permanentes si el material requiere control de acceso.

El proveedor, streaming, tamaño máximo, tipos permitidos, publicación y descarga deben respetar el alcance consolidado de capacitación; la plataforma concreta de video continúa pendiente.

- **DECISIÓN DERIVABLE:** los archivos son recursos independientes de sus metadatos y deben estar protegidos.
- **DECISIÓN PROPUESTA:** abstracción de almacenamiento con metadatos en la base de datos.
- **DEPENDE DE NEGOCIO:** acceso por nivel, descarga, plataforma de videos y administración.
- **PENDIENTE:** proveedor y estrategia concreta de distribución.

---

## 22. Configuración y secretos

La configuración server-side deberá centralizarse y validarse al iniciar la aplicación. Incluirá, según corresponda, conexión a PostgreSQL, autenticación, almacenamiento, integraciones, jobs, URLs de aplicación y observabilidad.

Los secretos deberán proporcionarse mediante variables de entorno o un gestor de secretos del entorno. Nunca deben almacenarse en el repositorio, enviarse a Client Components ni registrarse en logs.

- **DECISIÓN DERIVABLE:** secretos y credenciales son exclusivamente server-side.
- **DECISIÓN PROPUESTA:** módulo de configuración server-only con validación.
- **PENDIENTE:** proveedor de secretos y convenciones por ambiente.

---

## 23. Testing

La estrategia de pruebas deberá seguir la separación de capas.

### Unitarias

Reglas de dominio, antigüedad, transiciones de nivel, reglas de comisión, resolución de scopes y políticas de autorización.

### Casos de uso

Creación y modificación de empleados, consultas propias y de equipo, cambios organizacionales, operaciones de ventas, capacitación y exportaciones.

### Integración

Prisma y PostgreSQL, transacciones, consultas jerárquicas, filtros de scope, auditoría y adaptadores de almacenamiento e integración.

### HTTP y aplicación

Server Actions, Route Handlers, autenticación, autorización, errores y webhooks.

### UI

Componentes interactivos y flujos visuales críticos. Las pruebas de UI no deben reemplazar las pruebas server-side de autorización.

Los casos negativos son obligatorios: un usuario no autorizado no debe poder obtener datos cambiando IDs o invocando directamente una operación protegida.

- **DECISIÓN DERIVABLE:** la trazabilidad documental debe llegar hasta las pruebas cuando aporte valor.
- **DECISIÓN PROPUESTA:** priorizar dominio, casos de uso y autorización antes que pruebas visuales extensas.
- **PENDIENTE:** framework, fixtures, base de datos de pruebas y CI.
- **DEPENDE DE NEGOCIO:** casos definitivos de niveles, permisos y comisiones.

---

## 24. Despliegue e infraestructura inicial

La topología inicial será conceptualmente:

```text
Usuarios internos
        ↓
Aplicación Next.js
        ├── PostgreSQL
        ├── almacenamiento de archivos, si corresponde
        └── integraciones externas, si corresponde
```

El entorno de desarrollo utilizará Next.js local y PostgreSQL local mediante Docker. La aplicación se desplegará inicialmente en Vercel Free, conforme a `ADR-011`. La base de datos remota/cloud será una etapa posterior; deberá ser accesible remotamente desde Vercel y el proveedor definitivo continúa pendiente. Se mantendrán separados development, staging y production.

No se recomienda inicialmente microservicios, Kubernetes, múltiples bases de datos, event bus, data warehouse ni infraestructura multi-región.

La política operativa de backup, recovery, retención, CI/CD y las restricciones corporativas continúan pendientes. La base local de Docker no será considerada base productiva.

- **DECISIÓN YA TOMADA:** no introducir infraestructura innecesaria.
- **DECISIÓN DE DISEÑO:** desarrollo local con PostgreSQL en Docker y despliegue inicial de Next.js en Vercel Free.
- **DECISIÓN YA TOMADA:** mantener separados development, staging y production.
- **DEPENDE DE NEGOCIO:** restricciones corporativas y requisitos de producción.
- **PENDIENTE:** PostgreSQL remoto, proveedor de correo, backups, retención y pipeline definitivo.

---

## 25. Estructura conceptual de `src/`

La estructura siguiente es una referencia para organizar la implementación:

```text
src/
├── app/
│   ├── (public)/
│   ├── (authenticated)/
│   ├── admin/
│   ├── api/
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
│
├── modules/
│   ├── identity/
│   ├── organization/
│   ├── sales/
│   ├── analytics/
│   ├── commissions/
│   ├── training/
│   └── audit/
│
├── infrastructure/
│   ├── auth/
│   ├── database/
│   ├── storage/
│   ├── integrations/
│   ├── jobs/
│   └── observability/
│
└── shared/
    ├── config/
    ├── errors/
    ├── validation/
    └── types/
```

No es necesario crear todas las carpetas desde el inicio. La estructura debe crecer junto con los casos de uso reales y no convertirse en una jerarquía vacía o artificial.

- **DECISIÓN YA TOMADA:** separar rutas Next.js, módulos de negocio e infraestructura.
- **PENDIENTE:** ajustar la estructura a los primeros casos de uso y a las convenciones efectivas del código.

---

## 26. Decisiones fuera de alcance por ahora

Este documento no decide definitivamente:

- proveedor de autenticación y correo, y detalles operativos de sesión;
- configuración definitiva de 2FA y políticas corporativas de sesión;
- validación oficial de responsabilidades y permisos de los Niveles 4–7;
- alcance funcional definitivo de `ADMIN`;
- matriz definitiva de permisos;
- modelo explícito o implícito de `Team`;
- múltiples supervisores o equipos;
- detalles físicos y casos particulares del flujo inicial de ventas;
- esquema definitivo de `Sale`, `SaleItem` y `Product`;
- base comercial futura si se confirma una fórmula distinta de `Sale.totalAmount`;
- motor automático de promociones;
- objetivos y metas;
- detalles adicionales del catálogo de capacitación;
- evaluaciones futuras;
- proveedor de archivos y videos;
- proveedor de infraestructura;
- índices definitivos y esquema Prisma;
- retención y cleanup de datos de auditoría;
- data warehouse o arquitectura analítica futura.

No deben implementarse estas decisiones como si fueran requisitos confirmados.

---

## 27. Consecuencias y trade-offs

### Beneficios

- Menor complejidad operativa inicial.
- Despliegue y desarrollo más simples.
- Dominio aislado de Next.js y proveedores externos.
- Autorización centralizada y aplicable a lecturas y escrituras.
- Capacidad de cambiar autenticación, almacenamiento o integraciones.
- Posibilidad de evolucionar las consultas analíticas sin cambiar los casos de uso.
- Mejor preservación del historial y de la trazabilidad.

### Costes y limitaciones

- El monolito requiere disciplina para preservar límites modulares.
- Las consultas recursivas con Adjacency List pueden ser más complejas a gran escala.
- Prisma no cubrirá necesariamente todas las consultas jerárquicas o analíticas, por lo que habrá adaptadores SQL específicos.
- La autorización requiere resolver simultáneamente permisos y scopes.
- Las reglas de comisión versionadas requieren consistencia temporal y mayor cuidado transaccional.
- La arquitectura mantiene interfaces para necesidades aún no confirmadas, lo que agrega cierta estructura antes de conocer todos los detalles.

La solución podrá evolucionar hacia read models, jobs, almacenamiento externo o servicios separados únicamente si el crecimiento real o los requisitos lo justifican.

---

## 28. Puntos pendientes y contradicciones documentales

La arquitectura debe mantenerse alineada con `open-questions.md`. Los puntos con mayor impacto son:

1. detalles físicos y casos particulares del flujo inicial de ventas;
2. validación oficial de responsabilidades y permisos de los Niveles 4–7;
3. asignación funcional definitiva de permisos y rol `ADMIN`;
4. fórmula y fuente de las comisiones;
5. modelo funcional de `Team`;
6. detalles físicos y reglas adicionales del historial organizacional;
7. proveedor y operación de autenticación, correo, sesiones y 2FA;
8. proveedor y operación de almacenamiento y distribución de capacitación.

Se detectan además dos cuestiones documentales que no se resuelven aquí:

- `organizational-model.md` mantiene abierta la alternativa de `Team` explícito o implícito, mientras `data-model.md` propone inicialmente derivarlo de la jerarquía. Esta arquitectura lo trata como una decisión provisional y lo aísla detrás de una abstracción de consulta.
- Las tasas confirmadas vigentes son **N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5
  50 %, N6 60 % y N7 70 %**, configurables y versionadas. La anterior regla
  general de diseño del 50 % queda 🔄 REEMPLAZADA como antecedente histórico; el
  50 % vigente para N5 proviene exclusivamente de la tabla confirmada actual.

Estas discrepancias no modifican las decisiones técnicas generales, pero deben resolverse antes de congelar el modelo de equipos o el cálculo de comisiones.

---

## 29. Relación con otros documentos

Este documento debe mantenerse sincronizado con:

- `docs/product/requirements.md`;
- `docs/product/open-questions.md`;
- `docs/product/permissions-matrix.md`;
- `docs/domain/organizational-model.md`;
- `docs/domain/business-rules.md`;
- `docs/architecture/architecture-decisions.md`;
- `docs/database/data-model.md`.

Sus definiciones sirven como referencia general para `docs/architecture/authorization.md`,
`docs/architecture/data-architecture.md`, casos de uso, estructura de módulos,
contratos de aplicación, implementación y pruebas.

La arquitectura no reemplaza los requisitos, reglas de negocio, permisos ni el modelo de datos conceptual.

---

## 30. Historial de cambios

| Fecha      | Versión | Cambio |
|------------|---------|--------|
| 2026-09-02 | 0.1     | Creación de la arquitectura técnica general del sistema a partir de la documentación existente. |
| 2026-09-03 | 0.2     | Sincronización de referencias y clasificación de decisiones arquitectónicas existentes. |
| 2026-09-03 | 0.3     | Consolidación de autenticación, ventas, capacitación e infraestructura inicial. |
| 2026-09-03 | 0.4     | Consolidación final del flujo de ventas, historial y alcance de capacitación. |
| 2026-09-03 | 0.5     | Comisión inicial vigente N1 → 15 % (la regla de 50 % queda REEMPLAZADA como antecedente). |
| 2026-09-08 | 0.6     | Fase 7: sección de auditoría actualizada con AuditPort implementado, 20 eventos tipados, semántica best-effort y lectura restringida. |
| 2026-09-08 | 0.7     | Fase 9: sección 16 de analytics actualizada con módulo implementado, GetDashboardDataUseCase, MonthlyTarget y Recharts. |
