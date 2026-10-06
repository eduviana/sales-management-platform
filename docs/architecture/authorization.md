# Arquitectura técnica de autenticación y autorización

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.3  
**Última actualización:** 2026-10-05

---

## 1. Propósito y alcance

Este documento define la arquitectura técnica para identificar usuarios,
evaluar permisos y limitar el acceso a recursos dentro de Royal Prestige.

Su objetivo es establecer cómo se aplicarán server-side las capacidades y los
alcances definidos funcionalmente en `docs/product/permissions-matrix.md`, sin
duplicar allí reglas de negocio ni decidir permisos que todavía se encuentran
pendientes.

Este documento cubre:

- autenticación e identidad técnica;
- autorización de operaciones y recursos;
- relación entre permisos y scopes;
- resolución de alcance jerárquico;
- integración con Next.js, Application, Domain e Infrastructure;
- protección de consultas y mutaciones;
- errores, auditoría y pruebas relacionadas con acceso.

No define:

- la asignación definitiva de permisos a niveles o roles;
- el proveedor concreto de autenticación o de correo;
- el esquema físico de usuarios, roles o permisos;
- las responsabilidades comerciales de los Niveles 4–7;
- la existencia definitiva o el alcance funcional de `ADMIN`;
- el modelo definitivo de `Team`;
- excepciones de negocio que todavía no fueron confirmadas.

---

## 2. Authentication y Authorization

Son responsabilidades diferentes.

### Authentication

Authentication responde:

> ¿Quién es el usuario que realiza esta solicitud?

Su resultado es una identidad autenticada y verificable, asociada
conceptualmente a una `UserAccount`.

### Authorization

Authorization responde:

> ¿Qué puede hacer ese usuario y sobre qué recursos puede hacerlo?

Su resultado es una decisión de acceso basada en la identidad autenticada, su
contexto organizacional, un permiso, un scope y el recurso solicitado.

Estar autenticado no implica tener acceso global.

---

## 3. Principios de autorización

### 3.1. La autorización se ejecuta siempre en el servidor

Toda operación protegida debe verificar autenticación, permiso y scope en el
servidor antes de leer o modificar recursos.

### 3.2. Ocultar elementos no es autorización

La interfaz puede ocultar botones, enlaces o secciones para mejorar la
experiencia. Esto no impide invocar directamente una URL, un Route Handler o
una Server Action.

La operación debe volver a autorizarse en el servidor.

### 3.3. Los identificadores del cliente no determinan el alcance

Los siguientes valores pueden identificar un objetivo de consulta, pero nunca
prueban que el usuario pueda acceder a él:

- `userId`;
- `employeeId`;
- `teamId`;
- `resourceId`.

El servidor debe resolver el alcance a partir del usuario autenticado y de las
reglas aplicables.

### 3.4. Mínimo privilegio

Cada usuario debe recibir únicamente las capacidades y el alcance necesarios
para su posición y función.

No se debe conceder `GLOBAL` cuando sea suficiente `OWN`, `TEAM` o `BRANCH`.

### 3.5. Permiso y scope son obligatorios

Tener un permiso no basta. También debe verificarse que el recurso esté dentro
del scope permitido para esa operación.

### 3.6. Lectura y modificación son independientes

Un permiso de lectura no implica automáticamente permiso de modificación.

Por ejemplo, `employee.read` no concede por sí mismo `employee.update`.

### Clasificación

- **DECISIÓN YA TOMADA:** autorización server-side, mínimo privilegio,
  separación entre permisos y scopes y rechazo de IDs como mecanismo de
  autorización.
- **DECISIÓN DERIVABLE:** la interfaz solo puede actuar como ayuda de
  presentación, no como control de seguridad.

---

## 4. Contexto de identidad

La resolución conceptual de identidad y autorización es:

```text
UserAccount
    ↓
Employee
    ↓
Role + Level + posición jerárquica
    ↓
Permission
    ↓
Scope
    ↓
Recurso autorizado
```

`UserAccount` representa el acceso y la autenticación. `Employee` representa la
persona dentro de la organización. La relación conceptual es:

```text
Employee 1 ──── 0..1 UserAccount
```

El contexto de autorización debe construirse server-side y no a partir de datos
de rol, nivel o scope enviados por el navegador.

El mecanismo inicial será email + contraseña. No se utilizarán inicialmente
emails corporativos ni OAuth con Google o Microsoft. El email funcionará como
identificador único de autenticación, sin asumir que exista una casilla real;
durante desarrollo y pruebas deberán poder utilizarse cuentas ficticias.

El proveedor concreto de autenticación y de correo permanece pendiente. La
recuperación podrá utilizar email y tokens temporales de un solo uso, sin
almacenar ni transmitir contraseñas en texto plano. Se permitirán sesiones
simultáneas inicialmente y `ADMIN` podrá revocarlas cuando corresponda.

2FA se contempla como medida de seguridad para `ADMIN` y como capacidad
extensible para usuarios comerciales, pero no como requisito universal
confirmado.

El modelo físico de cuentas, roles y permisos no está definido en este
documento.

### Clasificación

- **DECISIÓN YA TOMADA:** separación conceptual entre `UserAccount` y
  `Employee`, registrada en `ADR-001`.
- **DECISIÓN DERIVABLE:** Application necesita un contexto de identidad para
  ejecutar casos de uso protegidos.
- **DEPENDE DE NEGOCIO:** asignación de permisos a roles y niveles.
- **PENDIENTE:** proveedor, sesiones y modelo físico de autenticación.

---

## 5. Permission y Scope

### Permission

Un `Permission` responde:

> ¿Puede el usuario realizar esta acción?

Ejemplos conceptuales de la matriz existente:

```text
employee.read
employee.create
analytics.viewTeam
commission.readOwn
training.download
```

Los nombres anteriores son referencias conceptuales alineadas con la matriz de
permisos. La matriz funcional es la fuente de verdad y puede evolucionar.

### Scope

Un `Scope` responde:

> ¿Sobre qué conjunto de recursos puede realizarla?

Los scopes conceptuales definidos por el proyecto son:

| Nombre en documentación | Nombre técnico conceptual | Significado |
|---|---|---|
| `PROPIO` | `OWN` | Recursos pertenecientes al usuario actual. |
| `EQUIPO` | `TEAM` | Subordinados o miembros del equipo directo. |
| `RAMA` | `BRANCH` | Estructura subordinada completa. |
| `GLOBAL` | `GLOBAL` | Toda la organización. |
| `SISTEMA` | `SYSTEM` | Configuración o información transversal. |

Los nombres técnicos son una convención conceptual para la arquitectura. No
definen por sí mismos qué nivel o rol recibe cada scope.

### Evaluación conjunta

```text
Usuario autenticado
    + Permission
    + Scope
    + Recurso
    ↓
Decisión de autorización
```

El mismo permiso puede producir alcances distintos según el contexto del
usuario. Por ejemplo, `employee.read` con `TEAM` no equivale a
`employee.read` con `GLOBAL`.

### Clasificación

- **DECISIÓN YA TOMADA:** los permisos y los alcances son dimensiones
  independientes.
- **DECISIÓN DERIVABLE:** el scope debe evaluarse para cada operación protegida.
- **DEPENDE DE NEGOCIO:** relación definitiva entre rol, nivel, permiso y scope.
- **PENDIENTE:** representación física o configurable de permisos.

---

## 6. Jerarquía organizacional y scopes

La jerarquía inicial se representa mediante:

```text
Employee.supervisorId → Employee.id
```

Esto corresponde a una **Adjacency List**, según `ADR-004`.

### Reglas y políticas

Las reglas y políticas jerárquicas pertenecen a `Domain`. Allí pueden vivir
conceptos como:

- relación entre supervisor y subordinado;
- pertenencia conceptual a una rama;
- reglas de posición organizacional;
- políticas que determinen si una relación es válida.

El dominio no debe conocer PostgreSQL, Prisma ni detalles concretos de
persistencia.

### Consultas concretas

Las consultas concretas necesarias para resolver la jerarquía pertenecen a
`Infrastructure`. Esto incluye:

- obtención de subordinados directos;
- obtención de ancestros y descendientes;
- resolución de una rama;
- consultas recursivas de PostgreSQL;
- SQL específico;
- cualquier mecanismo concreto de persistencia.

`Application` consumirá estas capacidades mediante contratos o puertos.
`Infrastructure` implementará dichos contratos y encapsulará Prisma y SQL.

### Team

Para la autorización inicial, el scope `TEAM` se resolverá a partir de la
relación jerárquica y no requiere una entidad física independiente `Team`.

Esto no cierra la decisión funcional definitiva sobre el concepto de equipo.
Si el negocio confirma que un equipo tiene identidad, configuración, objetivos
o historial propios, la resolución podrá evolucionar sin propagar detalles de
persistencia por toda la aplicación.

No se crea ni se define aquí una entidad `Team`.

### Alcance y estado del empleado

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El resolvedor de alcances construye el conjunto `TEAM` y `GLOBAL` con los
empleados **activos**; `RAMA` incluye a todos los descendientes sin filtrar
estado. Como `GLOBAL` significa "toda la organización", una decisión denegada
que lleve un alcance de organización se considera suficiente para el recurso
(`grantsResourceAccess`): de lo contrario un `ADMIN` no podría leer ni corregir
el registro de un empleado dado de baja.

Para los alcances limitados (`EQUIPO`, `RAMA`) el comportamiento con empleados
inactivos no está definido por la matriz y queda pendiente de confirmación.

### Clasificación

- **DECISIÓN YA TOMADA:** Adjacency List mediante `Employee.supervisorId`.
- **DECISIÓN YA TOMADA:** reglas y políticas separadas de la persistencia,
  conforme a la aclaración de `ADR-004`.
- **DECISIÓN PROPUESTA:** resolver inicialmente `TEAM` mediante la jerarquía,
  sin entidad física `Team`.
- **DEPENDE DE NEGOCIO:** múltiples supervisores, múltiples equipos, niveles
  4–7 y alcance de ramas superiores.

---

## 7. Componentes de autorización

Para evitar checks dispersos se utilizará una estrategia simple con tres
responsabilidades:

### Authorization Service

Orquesta la evaluación de una operación protegida.

### Permission Evaluator

Determina si el contexto del usuario posee el permiso requerido.

### Scope Resolver

Determina el scope permitido y sus recursos alcanzables a partir de la
posición organizacional y de las reglas aplicables.

La evaluación de un recurso concreto podrá utilizar una política específica del
recurso:

```text
Authorization Service
    ├── Permission Evaluator
    ├── Scope Resolver
    └── Resource Authorization Policy
```

No se propone un motor de políticas genérico o configurable de alta
complejidad. Las capacidades deben crecer solo cuando la matriz definitiva lo
requiera.

### Ubicación por capa

- **Presentation:** puede consultar capacidades para mostrar u ocultar UI, pero
  no decide seguridad.
- **Application:** invoca la autorización antes de cada caso de uso protegido.
- **Domain:** contiene reglas y políticas jerárquicas independientes de
  persistencia.
- **Infrastructure:** implementa consultas de scope y acceso concreto a datos.

### Clasificación

- **DECISIÓN DERIVABLE:** la autorización debe centralizarse.
- **DECISIÓN PROPUESTA:** `Authorization Service` + `Permission Evaluator` +
  `Scope Resolver`.
- **PENDIENTE:** contratos definitivos y composición exacta de políticas.

---

## 8. Resolución de una operación autorizada

El flujo conceptual es:

```text
Request
  ↓
Authentication context
  ↓
UserAccount / Employee
  ↓
Permission check
  ↓
Scope resolution
  ↓
Resource access check
  ↓
Authorized operation
```

En una aplicación Next.js:

```text
Server Component / Server Action / Route Handler
  ↓
Application use case or query service
  ↓
Authorization Service
  ↓
Domain policies + Organization contracts
  ↓
Scoped repository operation
```

La autorización debe ocurrir cerca de la operación protegida. Una página
protegida no autoriza automáticamente las Server Actions o Route Handlers que
puedan invocarse desde ella.

---

## 9. Autorización de recursos concretos

La evaluación conceptual puede expresarse como:

```text
can(user, "employee.read")
scope(user, "employee.read")
canAccessEmployee(user, employeeId)
```

Estos nombres son ejemplos conceptuales y no constituyen contratos definitivos.

El orden lógico es:

1. identificar al usuario autenticado;
2. comprobar que posee el permiso;
3. resolver el scope correspondiente;
4. comprobar que el recurso pertenece a ese scope;
5. ejecutar la operación con la restricción aplicada.

Un usuario con `employee.read` pero sin acceso al empleado solicitado debe ser
rechazado o recibir una respuesta que no revele información protegida.

Para una mutación, también deben validarse las relaciones resultantes. Por
ejemplo, poder crear empleados no implica poder asignarlos a cualquier rama,
nivel o supervisor.

La regla exacta de asignación depende de la matriz funcional y de las reglas de
negocio aprobadas.

---

## 10. Queries y autorización

La autorización no debe implementarse de esta forma:

```text
1. Traer todos los registros.
2. Filtrarlos en memoria.
3. Devolver los permitidos.
```

Cuando sea posible, el scope debe traducirse en restricciones de consulta o
persistencia:

```text
Contexto autenticado
    ↓
Scope autorizado
    ↓
Restricción de consulta
    ↓
Repositorio / consulta SQL
    ↓
Datos autorizados
```

Esto reduce el riesgo de exposición accidental, evita cargar información
innecesaria y permite que PostgreSQL aplique filtros y relaciones de forma
eficiente.

La implementación concreta de las restricciones pertenece a `Infrastructure`.
Las consultas jerárquicas recursivas de PostgreSQL, SQL específico y Prisma
deben permanecer encapsulados allí.

`Application` no debe depender de una implementación concreta de Prisma. Debe
consumir repositorios o puertos que expresen operaciones ya limitadas por el
contexto de autorización.

Esta estrategia es coherente con:

- `ADR-004`, que mantiene la Adjacency List y encapsula la persistencia;
- `ADR-008`, que ubica PostgreSQL y Prisma en `Infrastructure`;
- `system-architecture.md`, que establece consultas server-side y fronteras
  entre capas.

---

## 11. Middleware y Next.js

El middleware puede utilizarse para:

- protección gruesa de rutas;
- detectar ausencia evidente de sesión;
- redirecciones entre áreas públicas y autenticadas;
- controles preliminares.

El middleware **no** debe ser la única capa de autorización. No debe asumir que
proteger una URL autoriza todas las operaciones que esa URL puede iniciar.

La autorización real debe ejecutarse server-side cerca del caso de uso:

- Server Components: al ejecutar servicios de consulta;
- Server Actions: dentro del caso de uso invocado por la mutación;
- Route Handlers: dentro del handler y del caso de uso correspondiente.

---

## 12. Server Components, Server Actions y Route Handlers

### Server Components

Pueden cargar información autorizada mediante servicios de consulta server-side.
No deben traer datos globales para filtrarlos en el navegador.

### Server Actions

Cada Server Action sensible debe volver a validar:

1. autenticación;
2. permiso;
3. scope;
4. entrada;
5. reglas de dominio.

No debe confiar en que el formulario, componente o página de origen ya fue
protegido.

### Route Handlers

Cada Route Handler sensible debe aplicar la misma validación. Esto incluye
endpoints de integración, descargas, exportaciones, callbacks y operaciones
invocables directamente por HTTP.

Una descarga de capacitación, por ejemplo, debe verificar el acceso al recurso
antes de entregar el archivo o una referencia temporal a él.

---

## 13. Casos negativos y seguridad

Como mínimo, deben rechazarse estos escenarios:

- usuario no autenticado;
- usuario autenticado sin el permiso requerido;
- usuario con permiso pero fuera del scope;
- manipulación de `employeeId`, `resourceId`, `userId` o `teamId`;
- acceso directo a una URL protegida;
- ejecución directa de una Server Action sin autorización;
- acceso a un recurso de otro equipo o rama;
- modificación de un recurso fuera del alcance autorizado;
- intento de convertir un permiso de lectura en permiso de modificación;
- acceso a archivos protegidos sin permiso de descarga o reproducción;
- uso de una cuenta asociada a un empleado inactivo para acceder al sistema;
  una cuenta de usuario asociada a un empleado inactivo no debe autenticarse.

Los casos definitivos por nivel, rol y permiso deben derivarse de la matriz
aprobada. Este documento no establece reglas nuevas para Niveles 4–7 ni para
`ADMIN`.

---

## 14. Manejo de errores

Se distinguirán conceptualmente:

```text
AuthenticationError
AuthorizationError
ValidationError
NotFoundError
ConflictError
DomainRuleError
```

### AuthenticationError

No existe una identidad autenticada válida o la cuenta no puede utilizarse.

### AuthorizationError

La identidad está autenticada, pero no posee el permiso o scope requerido.

### ValidationError

La entrada no cumple formato, tipo, rango o restricciones de entrada.

### NotFoundError

El recurso no existe o, cuando corresponda, se utiliza para no revelar la
existencia de un recurso que el usuario no está autorizado a conocer.

### ConflictError

La operación entra en conflicto con el estado actual del sistema.

### DomainRuleError

La operación contradice una regla del dominio.

Los adaptadores de Next.js deben mapear estos errores a respuestas seguras. No
deben exponer stack traces, detalles de Prisma, consultas SQL ni información
que permita inferir recursos protegidos.

---

## 15. Auditoría

Las operaciones sensibles pueden generar eventos de auditoría mediante el
contrato o puerto de auditoría utilizado por `Application`.

La implementación concreta del puerto pertenece a `Infrastructure`.

Conceptualmente, un evento puede registrar:

```text
actor
action
resource
resourceId
occurredAt
result
correlationId
```

La auditoría registra tanto operaciones autorizadas relevantes como intentos
denegados: toda denegación de autorización se emite como evento
`AUTHORIZATION_DENIED` con resultado `DENIED` desde el propio servicio de
autorización (ADR-013, ADR-020 decisión 6). La escritura es best-effort y nunca
altera la decisión.

Este documento no define el esquema completo de `AuditEvent`, el catálogo
definitivo de eventos ni la retención. Esos aspectos permanecen pendientes en
la documentación funcional y arquitectónica correspondiente.

---

## 16. Testing de autorización

Las pruebas deben cubrir tanto autorizaciones positivas como negativas.

### Permisos

- permiso permitido;
- permiso ausente;
- permiso de lectura sin permiso de modificación;
- permiso de una capacidad independiente, como ventas versus comisiones.

### Scopes

- `OWN` / `PROPIO`;
- `TEAM` / `EQUIPO`;
- `BRANCH` / `RAMA`;
- `GLOBAL`;
- `SYSTEM` / `SISTEMA`.

### Seguridad de recursos

- recurso propio permitido;
- recurso del equipo permitido cuando corresponda;
- recurso fuera del equipo rechazado;
- recurso fuera de la rama rechazado;
- recurso global solo cuando el permiso y el scope lo permitan;
- manipulación de IDs sin ampliación de privilegios;
- consulta directa de URL protegida rechazada;
- Server Action invocada directamente rechazada;
- Route Handler invocado sin autorización rechazado.

### Jerarquía

Las pruebas deben comprobar que la resolución de descendientes y ramas se
aplica a las consultas y no solo a la interfaz.

Las asignaciones concretas de permisos por nivel deberán probarse únicamente
contra la matriz aprobada. Las reglas provisionales de la versión de referencia
deben mantenerse identificadas como tales.

---

## 17. Puntos pendientes

Permanecen fuera de definición en este documento:

- proveedor concreto de autenticación y de correo;
- configuración operativa definitiva de sesiones y recuperación de cuenta;
- políticas corporativas de seguridad y configuración definitiva de 2FA;
- asignación definitiva de permisos a roles y niveles;
- reglas definitivas de `OWN`, `TEAM`, `BRANCH`, `GLOBAL` y `SYSTEM`;
- matriz final de autorización;
- posibles excepciones a la jerarquía;
- responsabilidades de los Niveles 4–7;
- existencia y alcance de `ADMIN`;
- múltiples supervisores o equipos;
- modelo definitivo de `Team`;
- representación física de roles y permisos;
- historial organizacional y autorización temporal;
- eventos y retención de auditoría.

La fuente de verdad de los permisos funcionales continúa siendo:

```text
docs/product/permissions-matrix.md
```

Las preguntas de negocio permanecen en:

```text
docs/product/open-questions.md
```

Este documento no debe duplicar ni reemplazar esas definiciones.

---

## 18. Relación con otros documentos

- `docs/product/requirements.md`: define requisitos funcionales y de seguridad.
- `docs/product/permissions-matrix.md`: centraliza las capacidades, roles,
  niveles y alcances funcionales, distinguiendo definiciones confirmadas,
  observadas, asumidas y pendientes. Es la fuente principal de permisos
  funcionales, pero no implica que todo su contenido constituya una decisión
  definitiva.
- `docs/product/open-questions.md`: contiene las cuestiones de negocio y
  técnicas pendientes.
- `docs/domain/organizational-model.md`: define los conceptos organizacionales
  y mantiene pendientes varias decisiones sobre equipos y jerarquía.
- `docs/domain/business-rules.md`: define reglas de negocio, incluyendo reglas
  generales de acceso y jerarquía.
- `docs/architecture/architecture-decisions.md`: registra `ADR-001`, `ADR-004`,
  `ADR-008` y las demás decisiones que condicionan esta arquitectura.
- `docs/architecture/system-architecture.md`: define capas, dependencias,
  Server Components, Server Actions, Route Handlers, PostgreSQL, Prisma y la
  ubicación de las consultas concretas en `Infrastructure`.
- `docs/database/data-model.md`: define el modelo de datos conceptual, sin que
  este documento cree o modifique su esquema.

La relación técnica principal es:

```text
requirements
    ↓
business-rules / organizational-model
    ↓
permissions-matrix
    ↓
authorization
    ↓
system-architecture / data-model
    ↓
implementación y pruebas
```

---

## 19. Estado del documento

Este documento establece la arquitectura técnica base de autenticación y
autorización, pero no congela las definiciones de negocio aún pendientes.

Deberá actualizarse cuando se confirme información sobre roles, niveles,
scopes, administración, autenticación, historial organizacional o excepciones
de la jerarquía.

## 20. Historial de cambios

| Fecha      | Versión | Cambio |
|------------|---------|--------|
| 2026-09-02 | 0.1     | Creación de la arquitectura técnica de autenticación y autorización. |
| 2026-09-03 | 0.2     | Consolidación del mecanismo inicial de autenticación y del estado de cuentas inactivas. |
| 2026-09-03 | 0.3     | Consolidación de email + contraseña, sesiones y medida de seguridad 2FA. |
| 2026-10-04 | 0.4     | §6: se documenta que `TEAM` y `GLOBAL` se resuelven sobre empleados activos y que un alcance de organización es suficiente para el recurso (`grantsResourceAccess`). El comportamiento con empleados inactivos en alcances limitados queda pendiente. |
