# Decisiones de arquitectura

**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.8
**Última actualización:** 2026-09-03

---

## 1. Objetivo

Este documento registra las decisiones arquitectónicas relevantes del proyecto y sus motivos.

**Una decisión arquitectónica debe documentarse cuando afecta de manera significativa:**

- El modelo de datos.
- La estructura del sistema.
- La seguridad.
- La mantenibilidad.
- La evolución futura.
- La forma en que distintos componentes interactúan.

El objetivo no es documentar cada decisión de implementación, sino aquellas que sea importante poder entender y justificar posteriormente.

---

## 2. Formato

Cada decisión contiene:

- **Contexto:** Problema o necesidad que origina la decisión.
- **Decisión:** Solución adoptada.
- **Alternativas consideradas:** Opciones analizadas.
- **Consecuencias:** Beneficios, costes y limitaciones.
- **Estado:** Situación actual de la decisión.

**Los estados utilizados en este documento son:**

| Estado       | Significado                           |
|--------------|---------------------------------------|
| PROPUESTA    | Alternativa en evaluación             |
| ACEPTADA     | Decisión adoptada                     |
| REEMPLAZADA  | Fue reemplazada por otra decisión     |
| RECHAZADA    | Fue evaluada y descartada             |

---

## 3. Decisiones arquitectónicas

### ADR-001 — Separación entre empleado y cuenta de acceso

> **Estado:** ✅ ACEPTADA

#### Contexto

Una persona perteneciente a la organización y una cuenta utilizada para acceder al sistema representan conceptos diferentes.

Una persona puede existir dentro de la organización aunque:

- Todavía no tenga acceso al sistema.
- Tenga su acceso desactivado.
- Deje de utilizar temporalmente la aplicación.

Además, eliminar una cuenta de acceso no debería implicar eliminar la información histórica de la persona.

#### Decisión

Se separarán conceptualmente:

```
Employee
```

De:

```
UserAccount
```

**La relación inicial será:**

```
Employee 1 ──── 0..1 UserAccount
```

`Employee` será responsable de la información organizacional.

`UserAccount` será responsable de la autenticación y del estado del acceso.

#### Alternativas consideradas

**Un único modelo `User`:**

Almacenar en una misma entidad:

```
User
├── información personal
├── información organizacional
├── nivel
├── supervisor
└── credenciales
```

Fue descartado porque mezcla responsabilidades diferentes y dificulta la evolución del modelo.

**Separar mediante dos entidades:**

```
Employee
UserAccount
```

Es la alternativa elegida.

#### Consecuencias

**Positivas:**

- Separación clara de responsabilidades.
- Permite desactivar acceso sin eliminar al empleado.
- Facilita cambios futuros del mecanismo de autenticación.
- Mejora la preservación del historial.

**Negativas:**

- Requiere una relación adicional.
- Algunas consultas necesitarán combinar ambas entidades.

---

### ADR-002 — Conservar historial de cambios de nivel

> **Estado:** ✅ ACEPTADA

#### Contexto

Los niveles comerciales no representan una característica inmutable de una persona.

Se ha informado que la progresión de nivel puede producirse con relativa rapidez y se conoce el caso de un representante con aproximadamente dos años de antigüedad que actualmente se encuentra en nivel 3.

Todavía no se conocen los criterios exactos para cambiar de nivel.

Además, el nivel puede ser relevante para analizar información histórica y, potencialmente, para aplicar reglas comerciales.

#### Decisión

El nivel actual y el historial de niveles se almacenarán como conceptos independientes.

El empleado tendrá referencia a su nivel actual:

```
Employee.currentLevelId
```

Y existirá una relación histórica conceptual:

```
EmployeeLevelHistory
├── employeeId
├── levelId
├── startedAt
├── endedAt
└── reason
```

El registro con:

```
endedAt = null
```

Representará la pertenencia vigente al nivel.

#### Alternativas consideradas

**Guardar únicamente el nivel actual:**

```
Employee.currentLevelId
```

Fue descartado porque elimina la capacidad de reconstruir la evolución histórica.

**Mantener solamente el historial:**

Podría derivarse el nivel actual buscando el registro abierto, pero implicaría consultas innecesarias para una información de acceso frecuente.

**Nivel actual + historial:**

Es la alternativa elegida.

#### Consecuencias

**Positivas:**

- Permite reconstruir la evolución de una persona.
- Permite consultar el nivel vigente en una fecha.
- Facilita estadísticas históricas.
- Evita perder información cuando ocurre una promoción.

**Negativas:**

- Existe información derivada que debe mantenerse consistente.
- Los cambios de nivel deberán registrarse de forma transaccional.

---

### ADR-003 — Separar antigüedad, nivel y jerarquía

> **Estado:** ✅ ACEPTADA

#### Contexto

Durante el análisis del dominio se identificaron tres conceptos diferentes:

- Antigüedad
- Nivel
- Jerarquía

No existe evidencia suficiente para asumir que estos conceptos evolucionen de forma idéntica.

Un empleado puede:

- Llevar determinado tiempo dentro de la empresa.
- Tener un nivel determinado.
- Depender de un supervisor determinado.

Estos valores pueden cambiar de manera independiente.

#### Decisión

Se modelarán de forma independiente:

```
Employee.joinedAt
Employee.currentLevelId
Employee.supervisorId
```

El historial de nivel se almacenará mediante:

```
EmployeeLevelHistory
```

La evolución histórica de la jerarquía se estudiará por separado cuando se conozca cómo funciona realmente la organización.

#### Alternativas consideradas

**Utilizar el nivel como representación de toda la estructura:**

Descartado.

**Derivar la antigüedad desde la fecha de creación de la cuenta:**

Descartado.

La creación de una cuenta y el ingreso de una persona en la organización son eventos conceptualmente diferentes.

#### Consecuencias

Esta separación permite evolucionar independientemente:

- Reglas de promoción.
- Reglas de comisión.
- Estructura jerárquica.
- Antigüedad.

También evita introducir dependencias artificiales entre conceptos que todavía no están confirmados como equivalentes.

---

### ADR-004 — Utilizar Adjacency List para la jerarquía inicial

> **Estado:** ✅ ACEPTADA

#### Contexto

La organización utiliza una estructura jerárquica de múltiples niveles.

Inicialmente se necesita representar relaciones entre empleados como:

```
Empleado
   └── supervisor directo
```

La frecuencia real con la que cambia la estructura todavía no está confirmada, pero existe indicación de que la progresión dentro de la organización puede producirse rápidamente.

En esta etapa del proyecto se prioriza un modelo simple de modificar y mantener.

#### Decisión

La jerarquía se representará inicialmente mediante una relación recursiva:

```
Employee.supervisorId → Employee.id
```

Este patrón corresponde a una **Adjacency List**.

**Ejemplo:**

```
Carlos
├── Juan
├── Pedro
└── María
```

**Representado mediante:**

```
Juan.supervisorId = Carlos.id
Pedro.supervisorId = Carlos.id
María.supervisorId = Carlos.id
```

Las reglas y políticas jerárquicas pertenecen al dominio, pero el dominio no
debe conocer PostgreSQL, Prisma ni detalles concretos de persistencia. Las
consultas concretas necesarias para resolver la jerarquía pertenecen a la capa
de Infrastructure, incluyendo consultas recursivas de PostgreSQL, SQL
específico o cualquier otro mecanismo concreto de persistencia. Application
podrá consumir estas capacidades mediante contratos o puertos, sin depender de
su implementación. Infrastructure implementará dichos contratos y encapsulará
el acceso a Prisma y SQL.

Se contemplan operaciones conceptuales como:

- `getDirectSupervisor()`
- `getDirectSubordinates()`
- `getAncestors()`
- `getDescendants()`
- `isWithinScope()`

#### Alternativas consideradas

**Materialized Path:**

Permite obtener ramas de manera eficiente, pero complica los cambios de ubicación de subárboles porque puede requerir actualizar los caminos de múltiples empleados.

**Closure Table:**

Facilita consultas jerárquicas complejas y de autorización, pero agrega una estructura derivada que debe mantenerse sincronizada cuando cambia el árbol.

**Adjacency List:**

Presenta un modelo simple, natural y adecuado para PostgreSQL, especialmente utilizando consultas recursivas cuando sean necesarias.

Es la alternativa elegida inicialmente.

#### Consecuencias

**Positivas:**

- Modelo sencillo.
- Modificaciones de jerarquía simples.
- Pocas estructuras derivadas.
- Fácil comprensión.
- PostgreSQL permite resolver consultas recursivas mediante `WITH RECURSIVE`.

**Negativas:**

- Consultas de ramas completas son más complejas que las consultas directas.
- Si el sistema requiere posteriormente muchas consultas jerárquicas de gran volumen, puede ser necesario optimizar la estrategia.

La decisión podrá revisarse si el comportamiento real del sistema demuestra que Adjacency List deja de ser adecuada.

---

### ADR-005 — Separar las reglas de comisión del código de aplicación

> **Estado:** ✅ ACEPTADA

#### Contexto

Se identificó una progresión de comisión asociada a la antigüedad de un vendedor:

| Antigüedad  | Comisión observada   |
|-------------|----------------------|
| Mes 1       | 10 %                 |
| Mes 2       | 15 %                 |
| Mes 3       | 30 %                 |
| Mes 4       | Pendiente            |
| Mes 5       | Pendiente            |
| Regla inicial (anterior, 🔄 REEMPLAZADA) | 50 %                 |

La regla inicial de diseño vigente es **N1 → 15 %**, configurable y versionada.
La anterior regla de diseño del 50 % queda 🔄 REEMPLAZADA y se conserva solo
como antecedente histórico. No se adopta ningún porcentaje histórico alternativo
como regla vigente.

Además, las reglas comerciales pueden cambiar con el tiempo.

#### Decisión

Las reglas de comisión no se implementarán como porcentajes hardcodeados dentro de la lógica de negocio.

Se modelarán como reglas configurables y con período de vigencia.

**Conceptualmente:**

```
CommissionRule
├── levelId
├── fromMonth
├── toMonth
├── percentage
├── effectiveFrom
└── effectiveTo
```

La estructura definitiva podrá modificarse cuando se conozca la fórmula real utilizada por la empresa.

#### Alternativas consideradas

**Hardcodear porcentajes:**

Ejemplo:

```javascript
if month === 1 -> 10
if month === 2 -> 15
if month === 3 -> 30
```

Descartado porque dificulta cambios y puede afectar cálculos históricos.

**Configuración externa sin historial:**

Podría ser suficiente para un sistema muy simple, pero no permite reconstruir qué regla estaba vigente en una fecha anterior.

**Reglas versionadas:**

Es la alternativa elegida.

#### Consecuencias

**Positivas:**

- Permite modificar reglas sin cambiar el código.
- Permite conservar reglas históricas.
- Facilita auditoría.
- Desacopla la lógica económica de la implementación.

**Negativas:**

- Aumenta ligeramente la complejidad del modelo.
- Requiere definir correctamente la vigencia y precedencia de las reglas.

---

### ADR-006 — Mantener separada la comisión de la jerarquía

> **Estado:** ✅ ACEPTADA

#### Contexto

Durante el análisis aparecieron dos dimensiones diferentes:

```
Jerarquía organizacional
```

Y:

```
Comisión
```

Aunque ambas pueden relacionarse con el empleado, no debe asumirse que representan el mismo concepto.

Un cambio de nivel no implica necesariamente que deba modificarse directamente una relación de supervisor.

Del mismo modo, una modificación en una regla de comisión no debería alterar la estructura jerárquica.

#### Decisión

La jerarquía y las reglas económicas se mantendrán como dominios independientes.

**Conceptualmente:**

```
Organización
├── Employee
├── Level
├── EmployeeLevelHistory
└── supervisor relationship

Comisiones
└── CommissionRule
```

La lógica de cálculo de comisión podrá consultar información de organización y antigüedad cuando sea necesario, pero las dos responsabilidades permanecerán separadas.

#### Consecuencias

Esta separación permite modificar:

- Estructura jerárquica.
- Reglas de promoción.
- Reglas de comisión.

Sin convertirlos en una única pieza de lógica.

También facilita futuras pruebas y auditorías de los cálculos.

---

### ADR-007 — No implementar todavía reglas automáticas de promoción

> **Estado:** ✅ ACEPTADA

#### Contexto

Se conoce que existen siete niveles y que los representantes pueden ascender.

Sin embargo, todavía no se conocen con precisión:

- Criterios de ascenso.
- Objetivos necesarios.
- Períodos mínimos.
- Relación entre ventas y promoción.
- Comportamiento de los niveles 4–7.

Implementar estas reglas antes de confirmarlas obligaría a convertir supuestos en restricciones del sistema.

#### Decisión

El sistema conservará la capacidad de registrar cambios de nivel, pero no implementará todavía un motor automático de promociones.

La lógica exacta de promoción permanecerá documentada como requisito pendiente.

#### Consecuencias

Inicialmente, un cambio de nivel podrá requerir una operación administrativa o un proceso posterior cuya lógica se definirá cuando se conozcan las reglas reales.

Esto evita acoplar el modelo a supuestos no confirmados.

---

### ADR-008 — PostgreSQL + Prisma

> **Estado:** ✅ ACEPTADA

#### Contexto

El sistema necesita una base de datos relacional principal para representar la
organización, las cuentas de acceso, las ventas, el historial y las demás áreas
del dominio que se definan posteriormente.

La arquitectura general establece una separación explícita entre Presentation,
Application, Domain e Infrastructure. Por lo tanto, la tecnología de
persistencia debe quedar encapsulada detrás de las fronteras arquitectónicas y
no debe filtrarse al dominio.

Además, la jerarquía organizacional utiliza inicialmente una Adjacency List
mediante `Employee.supervisorId`. Algunas consultas jerárquicas, analíticas o de
rendimiento pueden requerir capacidades específicas de PostgreSQL que no sean
expresables convenientemente mediante un ORM.

#### Decisión

El proyecto utilizará **PostgreSQL como base de datos relacional principal** y
**Prisma como ORM/adaptador principal para acceder a PostgreSQL**.

Prisma pertenecerá exclusivamente a `Infrastructure`. El dominio:

- no importará Prisma;
- no dependerá directamente de PostgreSQL;
- no dependerá de detalles concretos de persistencia;
- no tratará el modelo generado por Prisma como su modelo de dominio.

Los repositorios y servicios de persistencia encapsularán el acceso a datos
mediante las fronteras arquitectónicas definidas en
`docs/architecture/system-architecture.md`. `Application` dependerá de
contratos o puertos, y no de implementaciones concretas de Prisma.

Cuando Prisma no sea suficiente para determinadas consultas jerárquicas,
analíticas o de rendimiento, se podrá utilizar SQL específico. Ese SQL deberá
estar encapsulado dentro de `Infrastructure`, junto con el adaptador que lo
ejecute, sin distribuir detalles de PostgreSQL por el dominio o la presentación.

PostgreSQL será responsable de las capacidades relacionales, la integridad
referencial y las transacciones correspondientes a las operaciones que utilicen
la base de datos.

La elección de PostgreSQL + Prisma no implica que todas las operaciones deban
resolverse exclusivamente mediante Prisma.

La jerarquía seguirá utilizando inicialmente una Adjacency List mediante
`Employee.supervisorId`. Las reglas y políticas jerárquicas pertenecen al
dominio; las consultas concretas de persistencia, incluidas las consultas
recursivas de PostgreSQL, pertenecen a `Infrastructure` y serán consumidas por
`Application` mediante contratos o puertos.

#### Alcance

Esta decisión alcanza a:

- la base de datos relacional principal;
- el adaptador/ORM principal de persistencia;
- la ubicación arquitectónica de Prisma;
- el aislamiento del modelo de persistencia respecto del dominio;
- la encapsulación de repositorios, servicios de persistencia y SQL específico;
- el uso de capacidades relacionales, integridad referencial y transacciones de
  PostgreSQL.

Aplica a la aplicación modular inicial y no impide incorporar posteriormente
otros adaptadores o mecanismos complementarios si una necesidad arquitectónica
justificada lo requiere.

#### Alternativas consideradas

**Otra base de datos relacional:**

No se selecciona para la etapa actual. PostgreSQL ofrece las capacidades
relacionales necesarias y soporta consultas recursivas para la jerarquía
inicial.

**Acceso directo a PostgreSQL desde el dominio:**

Descartado porque acoplaría las reglas de negocio a una tecnología y a detalles
de persistencia concretos.

**Utilizar únicamente Prisma y no SQL específico:**

No se adopta como restricción. Algunas consultas jerárquicas, analíticas o de
rendimiento pueden requerir SQL encapsulado en `Infrastructure`.

**Utilizar SQL distribuido por toda la aplicación:**

Descartado porque dificultaría el mantenimiento, el testing y la evolución de
las fronteras arquitectónicas.

#### Consecuencias

**Positivas:**

- Persistencia relacional centralizada y consistente.
- Integridad referencial y transacciones provistas por PostgreSQL.
- Acceso tipado y productivo mediante Prisma.
- Aislamiento del dominio respecto de la tecnología de persistencia.
- Posibilidad de utilizar SQL específico sin romper la arquitectura.
- Consultas jerárquicas y analíticas encapsuladas en un único límite técnico.
- Mayor facilidad para reemplazar o ampliar adaptadores en el futuro.

**Trade-offs / consecuencias negativas:**

- Se debe mantener sincronía entre el modelo de dominio y el modelo Prisma.
- Algunas consultas requerirán SQL específico y conocimiento especializado de
  PostgreSQL.
- Los repositorios y servicios agregan una capa de adaptación y mantenimiento.
- La Adjacency List puede requerir optimizaciones futuras para ramas grandes o
  consultas frecuentes.
- La elección de PostgreSQL no elimina la necesidad de diseñar cuidadosamente
  índices, transacciones e integridad temporal.

#### Qué queda fuera de esta decisión

Esta decisión no define:

- el esquema físico definitivo;
- tablas, campos, índices o restricciones concretas;
- las tablas definitivas de ventas, equipos, comisiones, capacitación o
  auditoría;
- el modelo definitivo de `Team`;
- el origen de los datos de ventas;
- la fórmula de comisiones;
- la estrategia detallada de reporting;
- la estrategia completa de auditoría;
- el proveedor o la infraestructura de despliegue de PostgreSQL;
- la estrategia de backups, réplicas o alta disponibilidad;
- que todas las operaciones deban utilizar exclusivamente Prisma.

Estas decisiones deberán definirse en los documentos correspondientes cuando se
resuelvan las preguntas de negocio y las necesidades técnicas asociadas.

---

### ADR-009 — Autorización server-side basada en permisos y scopes jerárquicos

> **Estado:** ✅ ACEPTADA

#### Contexto

Royal Prestige necesita proteger información y operaciones según el contexto de
cada usuario dentro de una organización comercial jerárquica. La autenticación
por sí sola no determina qué información puede consultar o modificar una
persona.

La aplicación debe proteger tanto las operaciones iniciadas desde la interfaz
como aquellas invocadas directamente mediante URLs, Server Actions o Route
Handlers. También debe evitar que la modificación de identificadores enviados
por el cliente amplíe el acceso permitido.

La arquitectura general separa Presentation, Application, Domain e
Infrastructure. ADR-004 establece la Adjacency List mediante
`Employee.supervisorId`, y ADR-008 ubica PostgreSQL, Prisma y las consultas
concretas de persistencia en Infrastructure. La estrategia de autorización debe
ser consistente con esas fronteras.

#### Decisión

Toda operación protegida se autorizará del lado servidor.

Authentication y Authorization se tratarán como responsabilidades diferentes:

- Authentication determina quién es el usuario.
- Authorization determina qué puede hacer y sobre qué recursos puede hacerlo.

`Permission` y `Scope` serán dimensiones independientes:

- `Permission` determina si el usuario puede realizar una acción.
- `Scope` determina sobre qué conjunto de recursos puede realizarla.

Una operación protegida deberá validar ambas dimensiones. La decisión se
resolverá utilizando el contexto del usuario autenticado y su posición
organizacional.

Los identificadores enviados por el cliente, incluyendo `userId`, `employeeId`,
`resourceId` o `teamId`, nunca determinarán ni ampliarán por sí mismos el alcance
autorizado.

El acceso a un recurso se verificará cerca del caso de uso protegido. Cuando
sea posible, el scope autorizado se traducirá en restricciones de
consulta/persistencia. No se traerán datos globales para filtrarlos únicamente
en memoria.

`Application` consumirá las capacidades de autorización y acceso mediante
contratos o puertos, sin depender de implementaciones concretas de persistencia.
`Infrastructure` será responsable de las consultas concretas necesarias para
resolver scopes y recursos, incluidas las consultas jerárquicas recursivas, SQL
específico y Prisma.

El middleware podrá realizar protección gruesa de rutas, detección preliminar de
sesión y redirecciones, pero nunca reemplazará la autorización real.

Los Server Components, Server Actions y Route Handlers deberán aplicar
autorización server-side cuando ejecuten operaciones protegidas. Una página o
layout protegido no autoriza automáticamente las operaciones que puedan
invocarse desde él.

La estrategia deberá permitir prevenir tanto el escalamiento horizontal de
privilegios como el escalamiento vertical de privilegios.

Para la autorización inicial, el scope `TEAM` podrá resolverse mediante la
jerarquía organizacional existente sin requerir una entidad física `Team`. Esto
no constituye una decisión funcional definitiva sobre `Team`. Si posteriormente
el negocio determina que `Team` tiene identidad, configuración, objetivos,
historial, pertenencia múltiple u otras propiedades propias, la arquitectura
podrá evolucionar.

La estrategia se mantendrá independiente de la asignación funcional definitiva
de permisos a roles y niveles.

#### Alcance

Esta decisión alcanza a:

- operaciones de lectura y modificación protegidas;
- consultas de recursos propios, de equipos, de ramas, globales o de sistema,
  según los permisos y scopes que se definan en la matriz funcional;
- casos de uso de Application;
- Server Components, Server Actions y Route Handlers;
- resolución de recursos jerárquicos;
- aplicación de restricciones de autorización en repositorios y consultas;
- protección contra escalamiento horizontal y vertical.

La matriz funcional continúa siendo la fuente principal para las asignaciones de
permisos y alcances. Esta decisión establece el mecanismo arquitectónico, no
esas asignaciones.

#### Alternativas consideradas

**Autorizar únicamente en el frontend:**

Descartado porque ocultar elementos de interfaz no impide invocar directamente
una operación protegida.

**Autorizar únicamente en el middleware:**

Descartado porque el middleware no cubre por sí solo todas las operaciones,
Server Actions, Route Handlers ni accesos a recursos concretos.

**Traer datos globales y filtrarlos en memoria:**

Descartado porque incrementa el riesgo de exposición accidental y no garantiza
que todas las rutas de acceso a datos apliquen correctamente el scope.

**Determinar el alcance a partir de IDs enviados por el cliente:**

Descartado porque permitiría ampliar el acceso manipulando identificadores.

**Motor de autorización genérico de alta complejidad:**

No se adopta en esta etapa. Se utilizarán políticas y servicios simples,
centralizados y evolutivos, sin convertir las preguntas funcionales pendientes
en reglas rígidas.

#### Consecuencias

**Positivas:**

- Centraliza el criterio de autorización.
- Obliga a considerar permiso y scope en cada operación protegida.
- Favorece consultas ya restringidas por autorización.
- Reduce riesgos de acceso horizontal y vertical indebido.
- Facilita pruebas negativas de seguridad.
- Protege operaciones aunque se invoquen fuera de la navegación normal.
- Mantiene la autorización independiente del proveedor de autenticación y de la
  persistencia concreta.
- Permite evolucionar las reglas funcionales sin cambiar el principio técnico
  central.

**Trade-offs / consecuencias negativas:**

- Requiere consultas más cuidadosas para scopes jerárquicos.
- Incrementa la complejidad respecto de una aplicación sin jerarquía.
- Cada operación protegida debe validar permiso, scope y recurso.
- Los repositorios y servicios deben trabajar con restricciones de acceso.
- La resolución de ramas puede requerir consultas recursivas o SQL específico.
- Los cambios en la matriz de permisos pueden afectar casos de uso, consultas y
  pruebas.

#### Qué queda fuera de esta decisión

Esta decisión no define:

- la matriz definitiva de permisos;
- qué permisos recibe cada rol;
- qué scopes recibe cada nivel;
- las responsabilidades definitivas de los Niveles 4–7;
- el alcance definitivo de `ADMIN`;
- el proveedor concreto de autenticación;
- sesiones, recuperación de cuenta y 2FA;
- el modelo físico de roles y permisos;
- el modelo definitivo de `Team`;
- la autorización histórica;
- las reglas definitivas de múltiples equipos o supervisores;
- la autorización específica de archivos y videos;
- la auditoría detallada;
- el esquema físico de persistencia;
- la implementación concreta de políticas o contratos de autorización.

Las asignaciones funcionales concretas deberán mantenerse en
`docs/product/permissions-matrix.md`, respetando sus estados `CONFIRMADO`,
`OBSERVADO`, `ASUMIDO` y `PENDIENTE`.

---

### ADR-010 — Autenticación inicial mediante email y contraseña

> **Estado:** ✅ ACEPTADA

#### Contexto

El sistema necesita autenticar a empleados mediante cuentas asociadas a
`Employee`, manteniendo separadas la identidad organizacional y las credenciales
de acceso conforme a `ADR-001`.

El proyecto no utilizará inicialmente emails corporativos ni OAuth con Google o
Microsoft. Durante desarrollo y pruebas debe ser posible crear cuentas ficticias
sin disponer de casillas de correo reales.

#### Decisión

El mecanismo inicial de autenticación será **email + contraseña**.

El email será un identificador único de autenticación, pero no se asumirá que
corresponda a una casilla real. Los entornos de desarrollo y pruebas deberán
permitir cuentas ficticias y una infraestructura de correo de desarrollo para
probar la recuperación sin enviar mensajes reales.

La implementación deberá utilizar hash seguro de contraseñas, nunca almacenar ni
transmitir contraseñas en texto plano, y mantener secretos fuera del repositorio.
Las cookies de sesión deberán ser seguras, las sesiones deberán poder expirar y
revocarse, y se permitirán sesiones simultáneas inicialmente.

La recuperación utilizará tokens temporales de un solo uso. 2FA se contempla
para `ADMIN` como medida de seguridad y como capacidad extensible para usuarios
comerciales, pero no se establece como requisito universal confirmado.

El proveedor concreto de autenticación y de correo permanece independiente de
esta decisión.

#### Alcance

Esta decisión alcanza al mecanismo inicial de inicio de sesión, a las cuentas de
desarrollo y prueba, y a los principios de seguridad de credenciales y sesión.

No define un proveedor concreto ni el modelo físico de cuentas, sesiones o
credenciales.

#### Alternativas consideradas

**OAuth con Google o Microsoft:**

No se utilizará inicialmente.

**Emails corporativos obligatorios:**

No se utilizarán como requisito inicial, porque las cuentas de desarrollo y
prueba deben poder funcionar sin casillas reales.

**Contraseñas almacenadas en texto plano:**

Descartado por razones de seguridad.

#### Consecuencias

**Positivas:**

- Mecanismo inicial simple para una aplicación interna.
- Permite cuentas ficticias en desarrollo y pruebas.
- Mantiene la autenticación desacoplada del proveedor concreto.
- Permite incorporar OAuth u otros mecanismos posteriormente.

**Negativas:**

- El sistema debe proteger contraseñas, sesiones y recuperación.
- Se necesita una infraestructura de correo para probar recuperación.
- Se mantiene pendiente la selección y configuración del proveedor concreto.

#### Qué queda fuera de esta decisión

Esta decisión no define:

- proveedor de autenticación;
- proveedor de correo productivo;
- política universal de 2FA;
- detalles físicos de `UserAccount` y sesiones;
- políticas corporativas adicionales;
- asignación de roles y permisos.

---

### ADR-011 — Desarrollo local y despliegue inicial en Vercel

> **Estado:** ✅ ACEPTADA

#### Contexto

El proyecto necesita una separación explícita entre el entorno de desarrollo
local y el despliegue de la aplicación. Una instancia PostgreSQL ubicada en
`localhost` no es accesible directamente desde una aplicación desplegada en
Vercel.

La arquitectura debe evitar acoplarse prematuramente a un proveedor de
PostgreSQL cloud, manteniendo la posibilidad de utilizar una instancia remota en
una etapa posterior.

#### Decisión

Durante el desarrollo, la aplicación Next.js se ejecutará localmente y utilizará
PostgreSQL local mediante Docker.

El despliegue inicial de la aplicación Next.js se realizará en **Vercel Free**.
La base PostgreSQL remota/cloud será una etapa posterior y deberá ser accesible
remotamente desde Vercel. El proveedor definitivo de PostgreSQL cloud continúa
pendiente; Neon es únicamente una opción candidata y no una selección realizada.

Se mantendrán separados los entornos:

```text
development
staging
production
```

La base PostgreSQL local mediante Docker corresponde exclusivamente a
`development` y no será considerada una base productiva.

#### Alcance

Esta decisión alcanza la topología inicial de desarrollo y el destino inicial de
la aplicación. No determina el proveedor definitivo de PostgreSQL remoto ni la
infraestructura productiva completa.

#### Alternativas consideradas

**Conectar Vercel directamente a PostgreSQL local:**

Descartado porque Vercel no puede acceder directamente al `localhost` de la
máquina del desarrollador.

**Seleccionar ahora un proveedor PostgreSQL cloud:**

No se adopta mientras no se evalúen las restricciones y necesidades del entorno
remoto.

**Introducir infraestructura distribuida desde el inicio:**

Descartado por complejidad innecesaria para la etapa actual.

#### Consecuencias

**Positivas:**

- Desarrollo local reproducible mediante Docker.
- Separación clara entre desarrollo y despliegue.
- Aplicación desplegada inicialmente con infraestructura simple.
- Proveedor de PostgreSQL cloud mantenido intercambiable.

**Negativas:**

- Desarrollo y despliegue utilizan instancias PostgreSQL diferentes.
- La conexión remota y sus operaciones deberán configurarse posteriormente.
- Será necesario definir backups, recovery, retención y CI/CD para entornos remotos.

#### Qué queda fuera de esta decisión

Esta decisión no define:

- proveedor definitivo de PostgreSQL cloud;
- configuración productiva de Vercel;
- política de backups y recovery;
- RPO, RTO o retención legal;
- infraestructura de staging y production;
- estrategia final de CI/CD;
- esquema físico de PostgreSQL.

---

## 4. Relación con otros documentos

Las decisiones registradas aquí deben mantenerse sincronizadas con:

- `docs/product/requirements.md`
- `docs/product/open-questions.md`
- `docs/product/permissions-matrix.md`
- `docs/domain/organizational-model.md`
- `docs/domain/business-rules.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/authorization.md`
- `docs/architecture/data-architecture.md`
- `docs/database/data-model.md`

**La trazabilidad esperada es:**

```
Requisito
   ↓
Regla de negocio
   ↓
Decisión arquitectónica
   ↓
Modelo de datos
   ↓
Implementación
   ↓
Prueba
```

Una decisión arquitectónica no reemplaza a la regla de negocio que la origina.

---

## 5. Decisiones pendientes

Todavía no se deben fijar en este documento decisiones definitivas sobre:

- Proveedor de autenticación.
- Proveedor de correo y detalles operativos de recuperación.
- Decisiones adicionales de autorización no cubiertas por `ADR-009`.
- Detalles de futuras integraciones de ventas.
- Cálculo definitivo de comisiones.
- Reglas de promoción.
- Detalles físicos y evolución del catálogo de productos.
- Evolución futura del sistema de formación.
- Almacenamiento de documentos y vídeos.
- Detalles operativos de despliegue.
- Observabilidad.
- Índices definitivos de PostgreSQL.
- Estrategia final de auditoría.

Estas decisiones se documentarán cuando exista suficiente información para justificarlas.

---

## 6. Historial de versiones

| Versión | Fecha      | Cambios                                                    |
|---------|------------|------------------------------------------------------------|
| 0.1     | 2026-09-02 | Creación del documento y registro de decisiones iniciales  |
| 0.2     | 2026-09-02 | Incorporación de ADR-008 sobre PostgreSQL y Prisma         |
| 0.3     | 2026-09-02 | Incorporación de ADR-009 sobre autorización server-side   |
| 0.4     | 2026-09-03 | Sincronización de referencias y estado de la documentación arquitectónica |
| 0.5     | 2026-09-03 | Incorporación de ADR-010 y ADR-011 sobre autenticación y despliegue inicial |
| 0.6     | 2026-09-03 | Consolidación global de decisiones arquitectónicas y pendientes documentales |
| 0.7     | 2026-09-03 | Consolidación final de la regla inicial de comisión y pendientes asociados |
| 0.8     | 2026-09-03 | ADR-005: comisión inicial vigente N1 → 15 % (la regla de 50 % queda REEMPLAZADA como antecedente). |
