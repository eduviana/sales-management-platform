# Decisiones de arquitectura

**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.26
**Última actualización:** 2026-10-05

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

Las reglas de comisión vigentes dependen del nivel comercial del vendedor. Las
observaciones históricas sobre progresión por antigüedad se conservan solamente
como antecedente reemplazado:

| Antigüedad  | Comisión observada   |
|-------------|----------------------|
| Mes 1       | 10 %                 |
| Mes 2       | 15 %                 |
| Mes 3       | 30 %                 |
| Mes 4       | Pendiente            |
| Mes 5       | Pendiente            |
| Regla inicial (anterior, 🔄 REEMPLAZADA) | 50 %                 |

Las tasas confirmadas son **N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6
60 % y N7 70 %**, configurables y versionadas. La anterior regla general de
diseño del 50 % queda 🔄 REEMPLAZADA como antecedente; el 50 % vigente para N5
proviene exclusivamente de la tabla confirmada actual.

Además, las reglas comerciales pueden cambiar con el tiempo.

#### Decisión

Las reglas de comisión no se implementarán como porcentajes hardcodeados dentro de la lógica de negocio.

Se modelarán como reglas configurables y con período de vigencia.

**Conceptualmente:**

```
CommissionRule
├── levelId
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

### ADR-012 — Generación transaccional e idempotente de comisiones

> **Estado:** ✅ ACEPTADA

#### Contexto

La aprobación de una venta debe generar su comisión y una cancelación posterior
debe generar su reversión. Una actualización parcial produciría estados
inconsistentes, como una venta aprobada sin comisión o una cancelación sin
reversión.

Además, las operaciones pueden repetirse por reintentos o concurrencia y no
deben crear entradas duplicadas.

#### Decisión

La aprobación y la generación de `CommissionEntry` se ejecutarán dentro de una
misma transacción de PostgreSQL. La cancelación y la generación de su reversión
seguirán el mismo criterio.

La idempotencia se protegerá en dos niveles:

- transición condicional de estado (`PENDING_REVIEW → APPROVED` y
  `APPROVED → CANCELLED`);
- restricciones de unicidad para una única entrada `EARNED` por venta y una
  única `REVERSAL` por entrada original.

Las reglas y la coordinación pertenecerán a Application/Domain. Prisma y las
transacciones concretas permanecerán encapsulados en Infrastructure.

La tasa histórica se conservará en `CommissionEntry`, junto con la regla, la
base y el importe utilizados.

#### Alternativas consideradas

**Generar la comisión después de aprobar mediante una operación separada:**

Descartado porque permitiría una venta aprobada sin comisión.

**Usar eventos o un event bus:**

Descartado por complejidad innecesaria para el monolito modular actual.

**Evitar constraints y proteger únicamente desde Application:**

Descartado porque no protege adecuadamente frente a concurrencia.

#### Consecuencias

- La aprobación puede fallar si no existe una regla aplicable o si no puede
  persistirse la comisión.
- La venta permanece en su estado anterior cuando la operación se revierte.
- Las restricciones físicas complementan, pero no reemplazan, las invariantes
  de dominio.
- Las operaciones de lectura y administración continuarán usando la
  autorización centralizada existente.

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

### ADR-013 — Auditoría y trazabilidad

**Fecha:** 2026-09-08  
**Estado:** ACEPTADA

#### Contexto

El sistema necesita registrar quién realizó qué operación, sobre qué recurso, en qué momento y con qué resultado. Esto es fundamental para:

- Seguridad y control de acceso.
- Trazabilidad de operaciones sensibles.
- Cumplimiento de políticas internas.
- Diagnóstico de problemas.
- Auditoría administrativa.

#### Decisión

Se implementa un mecanismo de auditoría con las siguientes características:

1. **Semántica best-effort:** La auditoría nunca falla la operación de negocio. Si el mecanismo de auditoría falla, la operación de negocio se confirma de todas formas.

2. **AuditPort transaccional:** Para operaciones que requieren atomicidad (aprobación de venta + generación de comisión), se utiliza un `PrismaTransactionScopedAuditAdapter` que recibe el mismo cliente de transacción que los repositorios de negocio.

3. **Acción tipada:** Se define un enum `AuditAction` con 21 valores que representan eventos de negocio específicos.

4. **Snapshot de email:** El campo `actorEmail` almacena una snapshot del email del actor al momento del evento, preservando legibilidad cuando la cuenta es desactivada.

5. **correlationId compartido:** Operaciones derivadas (aprobación + generación de comisión) comparten el mismo `correlationId` para trazabilidad.

6. **Lectura restringida:** Los eventos de auditoría solo son consultables por usuarios con permiso `audit.read` (rol ADMIN).

#### Eventos auditables

| Categoría | Eventos |
|-----------|---------|
| Identidad | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED |
| Organización | EMPLOYEE_CREATED, EMPLOYEE_UPDATED, EMPLOYEE_DEACTIVATED, EMPLOYEE_LEVEL_CHANGED, EMPLOYEE_SUPERVISOR_CHANGED |
| Ventas | SALE_CREATED, SALE_UPDATED, SALE_SUBMITTED, SALE_APPROVED, SALE_REJECTED, SALE_CANCELLED |
| Comisiones | COMMISSION_RULE_CREATED, COMMISSION_GENERATED, COMMISSION_REVERSED |
| Autorización | AUTHORIZATION_DENIED |

#### Modelo de datos

```sql
CREATE TYPE audit_action AS ENUM (...);

CREATE TABLE audit_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES user_account(id),
  actor_email VARCHAR(255),
  action audit_action NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  result audit_result NOT NULL,
  correlation_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Propietario de eventos

- **ApproveSaleUseCase** registra tanto SALE_APPROVED como COMMISSION_GENERATED.
- **CancelSaleUseCase** registra tanto SALE_CANCELLED como COMMISSION_REVERSED.
- Los casos de uso internos de comisiones NO registran eventos duplicados.

#### Alternativas consideradas

1. **Auditoría asíncrona (cola de mensajes):** Más desacoplada pero introduce complejidad operativa y延迟 en la consistencia. Rechazada por simplicidad.

2. **Auditoría solo a nivel de middleware:** No permite contexto de negocio rico (qué cambió, por qué). Rechazada por falta de granularidad.

3. **Auditoría con columnas before/after:** Más completo pero más complejo de mantener. Rechazada en favor de `metadata: Json?`.

#### Consecuencias

- Cada caso de uso de escritura debe inyectar `AuditPort`.
- La migración debe validar valores existentes antes de convertir a enum.
- El schema Prisma requiere `AuditAction` enum y campos actualizados.
- Los tests deben proveer un mock de `AuditPort`.
- `AuthorizationContext` requiere campo `userEmail` para snapshots.

#### Documentación afectada

- `docs/architecture/architecture-decisions.md` (este documento)
- `docs/product/requirements.md` (requisitos de auditoría)
- `docs/domain/business-rules.md` (reglas de auditoría)
- `docs/database/data-model.md` (modelo de datos)
- `docs/architecture/data-architecture.md` (sección de auditoría)
- `docs/product/permissions-matrix.md` (permisos de auditoría)

---

### ADR-014 — Visitas, Clientes y Programa de Referidos

> **Estado:** ✅ ACEPTADA (Phase 10)
> **Fecha:** 2026-09-09

#### Contexto

El sistema necesita soportar el flujo completo de visitas a domicilio para demostraciones de productos, gestión de clientes y un programa de referidos con descuentos. Actualmente:

- No existe entidad `Client` — las ventas usan `buyerName` como texto libre.
- No existe entidad `Visit` — no se registra el trabajo de campo de vendedores.
- No hay programa de referidos ni sistema de descuentos.
- Los vendedores N1/N2 no tienen visibilidad de sus visitas asignadas.
- Los supervisores N3+ no pueden asignar clientes a su equipo.

#### Decisión

Crear tres nuevas entidades (`Client`, `Visit`, `ReferralContact`) y modificar la entidad `Existente` (`Sale`) para soportar:

1. **Gestión de clientes**: Entidad `Client` con información de contacto y dirección.
2. **Registro de visitas**: Entidad `Visit` con ciclo de vida (assigned → completed/no_sale/cancelled).
3. **Programa de referidos**: Entidad `ReferralContact` vinculada a `Sale`, con descuento del 20% sobre toda la compra.
4. **Extensión de ventas**: Campos `visitId`, `clientId`, `paymentMethod`, `installments`, `discount`, `discountReason`.

#### Alternativas consideradas

1. **Expandir `buyerName` existente**: Mantener el campo de texto libre y agregar un campo `clientId` opcional. *Elegida por compatibilidad con datos existentes.*
2. **Reemplazar `buyerName` por `clientId`**: Más limpio pero rompe datos existentes. *Descartada.*
3. **Crear entidad `Customer` separada**: Más flexibilidad CRM pero fuera de alcance. *Descartada.*

#### Consecuencias

- La entidad `Client` se crea con `ownerEmployeeId` para que los referidos de N1/N2 se asignen al N3+ superior.
- La entidad `Visit` vincula vendedor, cliente y supervisor que asignó.
- El descuento por referidos se aplica en el mismo documento de venta.
- Los supervisores N3+ ven el nombre del vendedor en la tabla de ventas.
- Se crean nuevos permisos: `client.*`, `visit.*`.
- Se agregan links al sidebar: "Mis Visitas" (todos), "Clientes" (N3+), "Mi Equipo" (N3+).

#### Documentación afectada

- `docs/architecture/architecture-decisions.md` (este documento)
- `docs/database/data-model.md` (nuevas entidades)
- `docs/domain/business-rules.md` (nuevas reglas)
- `docs/product/requirements.md` (nuevos requisitos)
- `docs/product/permissions-matrix.md` (nuevos permisos)
- `docs/architecture/system-architecture.md` (nuevo módulo)
- `docs/product/open-questions.md` (preguntas resueltas)

---

### ADR-015 — Numeración secuencial global de ventas

> **Estado:** ✅ CONFIRMADA

#### Problema

Las ventas necesitan un identificador operativo legible y único, independiente del
UUID o ID técnico. El sistema debe poder referenciar ventas de manera clara en
listados, búsquedas y documentos internos.

#### Contexto

- No existe multi-tenancy en el sistema.
- La secuencia debe ser global para todo el sistema.
- La venta recibe el número al crearse en estado `DRAFT`.
- La interfaz necesita mostrar valores como `VT-0001`.
- Varias solicitudes pueden crear ventas concurrentemente.

#### Decisión

- Persistir el número como entero (`saleNumber`).
- Aplicar unicidad global mediante restricción de PostgreSQL.
- Generarlo server-side dentro de Infrastructure utilizando una secuencia nativa
  de PostgreSQL (`CREATE SEQUENCE`).
- Formatearlo únicamente en la capa de presentación (`VT-` + zero-padding).
- Mantenerlo inmutable después de la creación.
- No permitir que el cliente envíe o determine el valor.

#### Alternativas consideradas

- `MAX(saleNumber) + 1`: rechazada por condiciones de carrera.
- UUID visible: rechazado por falta de legibilidad operativa.
- Guardar directamente `VT-0001`: menos flexible para búsquedas, ordenamiento
  y formato.
- Secuencias separadas por vendedor/equipo: rechazadas porque el requisito es
  global.
- Numeración estrictamente sin huecos: no recomendada salvo requisito legal
  explícito.

#### Consecuencias

- La persistencia debe coordinar generación y unicidad dentro de una transacción.
- Puede haber huecos si se utilizan secuencias y una transacción falla.
- Las ventas existentes requieren backfill antes de activar la restricción NOT NULL.
- Los tests deben cubrir concurrencia y unicidad.
- La UI centraliza el formateo del número.

---

### ADR-016 — Datos operativos de cliente, pago, facturación y entrega

> **Estado:** ✅ ACEPTADA COMO DECISIÓN DE DISEÑO
> **Fecha:** 2026-09-11

#### Contexto

La carga manual de ventas necesita conservar información suficiente para
identificar al cliente, relacionar la venta con una visita, hacer seguimiento de
la entrega y consultar referencias de pago o facturación generadas por H&Y Cite.
No existe una confirmación de que esta aplicación deba procesar pagos o emitir
comprobantes fiscales.

#### Decisión

1. El nombre y el teléfono del cliente son obligatorios para una venta manual.
2. El email y el documento del cliente son opcionales hasta confirmar una
   obligación legal o fiscal.
3. La venta manual actual debe vincularse a una visita `completed` del vendedor
   autenticado. `visitId` permanece opcional en el modelo para futuras ventas
   directas.
4. La aplicación conserva estados y referencias externas de pago y facturación,
   pero no procesa pagos ni emite facturas.
5. Nunca se almacenan número completo de tarjeta, CVV/CVC, PIN o credenciales
   bancarias. Solo pueden conservarse marca y últimos cuatro dígitos si existe
   una necesidad operativa.
6. La dirección de entrega se conserva como snapshot histórico junto con el
   estado de entrega.
7. Los vendedores acceden a sus datos, los supervisores a los datos de su
   alcance y `ADMIN` al alcance global, siempre mediante autorización server-side.

#### Alternativas consideradas

- **Hacer obligatorio el DNI:** descartado provisionalmente porque no se confirmó
  su necesidad legal y podría impedir cargar ventas históricas.
- **Guardar el número completo de tarjeta:** rechazado por riesgo y alcance de
  cumplimiento PCI DSS innecesario.
- **Procesar pagos o facturación desde esta aplicación:** rechazado porque H&Y
  Cite es el sistema externo que realiza esas operaciones.
- **Guardar únicamente datos actuales del cliente:** descartado porque no
  preserva la dirección ni los contactos utilizados en una venta histórica.

#### Consecuencias

- `Sale` incorpora snapshots operativos del cliente y datos no sensibles de
  referencia.
- La creación de ventas requiere validación server-side de la visita y del
  vendedor.
- Los datos personales y referencias de pago deben protegerse mediante scopes y
  auditoría.
- La futura integración con H&Y Cite deberá implementarse mediante adapters/ports.
- Las reglas sobre documento, facturación y ventas directas deberán revisarse
  cuando exista confirmación del negocio.

#### Documentación afectada

- `docs/product/requirements.md`
- `docs/product/open-questions.md`
- `docs/product/permissions-matrix.md`
- `docs/domain/business-rules.md`
- `docs/database/data-model.md`
- `docs/architecture/data-architecture.md`

---

### ADR-017 — Separar actividad propia y actividad del equipo

> **Estado:** ✅ ACEPTADA COMO DECISIÓN DE DISEÑO
> **Fecha:** 2026-09-11

#### Contexto

Los supervisores pueden consultar ventas propias y ventas de subordinados. Una
única pantalla llamada `Mis Ventas` que cambia silenciosamente su alcance según
el nivel mezcla dos conceptos y puede inducir a interpretar ventas del equipo
como actividad personal.

#### Decisión

- `/sales` utiliza explícitamente el alcance `OWN` y muestra únicamente las
  ventas del usuario autenticado.
- `Mi Equipo` agrupa las vistas de equipo, incluida `/team/sales` con alcance
  `TEAM`.
- La navegación del equipo se expande de manera independiente en el sidebar.
- Los alcances se reciben como intención de aplicación, pero se autorizan y se
  resuelven server-side mediante permisos y jerarquía.

#### Consecuencias

- La interfaz es más clara para vendedores y supervisores.
- El caso de uso de listado ya no debe inferir el alcance solamente desde el
  nivel del usuario.
- Se evita exponer datos del equipo en una vista personal por accidente.

---

### ADR-018 — Identificador operativo secuencial para visitas

> **Estado:** ✅ ACEPTADA COMO DECISIÓN DE DISEÑO
> **Fecha:** 2026-09-12

#### Contexto

Las visitas utilizan un UUID como identificador técnico. Ese valor es correcto
para relaciones y persistencia, pero no es adecuado para que un vendedor lo use
como referencia operativa.

#### Decisión

Se agrega `visitNumber`, un entero secuencial único global, cuya representación
visible utiliza el formato `VS-0001`. El UUID continúa siendo el identificador
técnico interno y no se muestra como referencia principal en la interfaz.

#### Consecuencias

- Las visitas pueden referenciarse de forma breve en la interfaz y soporte.
- Los números pueden tener huecos si una operación falla, igual que los números
  secuenciales de ventas.
- La tabla de visitas muestra `VS-NNNN` y el nombre del cliente.

---

### ADR-019 — Kernel de presentación compartido y composition root en rutas

> **Estado:** ✅ ACEPTADA COMO DECISIÓN DE DISEÑO
> **Fecha:** 2026-10-02

#### Contexto

La revisión de calidad de código sobre la implementación reveló que la lógica de
presentación reutilizable (formato de fechas, moneda, códigos, componentes de
estado, tablas y hooks de listado) estaba duplicada en múltiples rutas de
`src/app/`, y que algunas rutas mezclaban composición, acceso a datos y
presentación. La arquitectura general (`system-architecture.md` §25) definía
`src/shared/` para utilidades transversales, pero no contemplaba una capa de
presentación compartida ni una regla explícita sobre el rol de las rutas de
Next.js.

#### Decisión

1. Se crea `src/shared/presentation/` como **kernel de presentación
   compartido**, con utilidades y componentes de interfaz reutilizables entre
   módulos (formato, componentes genéricos y hooks de presentación).
   - `shared/presentation/` no puede depender de `src/modules/` ni de
     infraestructura (Prisma, adaptadores concretos).
   - El dominio y la aplicación no pueden depender de
     `shared/presentation/`.
2. La interfaz propia de un módulo de negocio vive en
   `src/modules/<módulo>/presentation/`. Solo lo genuinamente transversal se
   ubica en `shared/presentation/`.
3. Las rutas de `src/app/` actúan como **composition root**: resuelven el
   contexto de autenticación y componen módulos, casos de uso, adaptadores y
   componentes. No contienen reglas de negocio ni escriben directamente en
   persistencia por fuera de los casos de uso o Server Actions del módulo.
4. Se mantiene la organización **feature-first / domain-first** a nivel de
   módulos y la **arquitectura por capas (hexagonal)** dentro de cada módulo.

#### Alternativas consideradas

- Ubicar los componentes compartidos dentro de `src/app/`: se descarta porque
  acopla la interfaz transversal al árbol de rutas y dificulta su reutilización.
- Crear una carpeta global `src/components/` sin capa declarada: se descarta por
  mezclar responsabilidades y no respetar los límites entre módulos.
- Adoptar Feature-Sliced Design de forma estricta: se descarta por introducir una
  taxonomía de capas global más pesada que la necesaria para el proyecto.

#### Consecuencias

- Se elimina duplicación de formato y componentes, y el resultado visible queda
  consistente entre pantallas.
- La lógica de presentación extraída a archivos `.ts` puede cubrirse con pruebas
  sin depender de componentes visuales.
- Las rutas permanecen delgadas y delegan en los módulos.
- Introduce una convención de dependencia (`shared` no depende de `modules`) que
  debe respetarse y verificarse en la revisión de código.
- La migración del código existente es gradual; no implica cambios de
  comportamiento funcional ni de reglas de negocio.

---

### ADR-020 — Fronteras de capas: acceso a datos, contexto de autenticación y manejo de errores

> **Estado:** ✅ ACEPTADA COMO DECISIÓN DE DISEÑO
> **Fecha:** 2026-10-02

#### Contexto

Una revisión arquitectónica sobre la implementación posterior a ADR-019 detectó
que las reglas de dependencia de `system-architecture.md` §7 y el rol de
composition root de `app/` (§25, ADR-019) no se cumplen de forma homogénea:

- Rutas de `app/` ejecutan consultas Prisma directas y construyen view models de
  negocio (p. ej. `dashboard/progression/page.tsx`).
- La capa `Application` del módulo `progression` depende de `PrismaClient` en vez
  de sus puertos.
- Server Actions y helpers de `modules/*/presentation` importan Prisma,
  instancian adaptadores concretos y arman el grafo de dependencias por acción
  (p. ej. `training-actions.ts`, `resolve-resource-labels.ts`).
- Un helper transversal de autenticación (`resolveAuthContext`) vive en
  `modules/sales/presentation` y es importado por 39 archivos de rutas y de otros
  módulos, acoplando sus capas de presentación.
- Mutaciones de empleados se escriben con Prisma directo, saltando casos de uso y
  el `AuditAction.EMPLOYEE_UPDATED`, que existe declarado y nunca se emite.
- Varias Server Actions devuelven `error.message` crudo al cliente y 7 rutas
  convierten cualquier error en `notFound()`.
- `domain` contiene conceptos de presentación (colores y formatos de la interfaz
  de visitas).

Estas desviaciones afectan seguridad, trazabilidad y mantenibilidad, y no están
cubiertas por ninguna decisión registrada.

#### Decisión

1. **Acceso a datos solo en Infrastructure, a través de puertos.** Ninguna ruta
   de `app/`, ningún archivo de `modules/*/presentation` ni de
   `modules/*/application` importa `@/infrastructure/prisma/client` ni ejecuta
   consultas Prisma. `Application` depende de puertos de repositorio/servicios de
   consulta; `Infrastructure` los implementa.
2. **Las rutas de `app/` son composition root.** Resuelven el contexto de
   autenticación y componen módulos, casos de uso, adaptadores y componentes. No
   agregan datos, no construyen view models de negocio y no contienen reglas. Los
   read models que hoy viven en rutas se mueven a **servicios de consulta de
   Application** del módulo correspondiente.
3. **Server Actions delgadas.** Una Server Action valida la forma de la entrada,
   resuelve el contexto y delega en un caso de uso. No instancia adaptadores, no
   importa Prisma y no arma el grafo de dependencias: lo obtiene del composition
   root de su módulo.
4. **Contexto de autenticación transversal.** `resolveAuthContext` deja de vivir
   en `modules/sales/presentation`. La resolución de la identidad autenticada y
   del `AuthorizationContext` se expone desde el módulo `identity` como contrato
   de autenticación para rutas y acciones. Queda prohibido importar la capa
   `presentation` de un módulo desde otro módulo.
5. **Aislamiento entre módulos.** Un módulo no lee ni escribe tablas de otro. La
   resolución de etiquetas de auditoría se resuelve con servicios de consulta de
   los módulos dueños (`organization`, `sales`, `commissions`, `identity`), no con
   Prisma dentro de `audit/presentation`.
6. **Manejo de errores.** Los adaptadores de Next.js mapean errores tipados. No
   se expone `error.message` de Prisma ni de infraestructura al cliente. Por
   política anti-enumeración, las lecturas con scope pueden mapear
   `NotFoundError` y `AuthorizationError` a `notFound()`; los errores de
   infraestructura **no** se convierten en 404: se registran y se elevan al
   `error.tsx` de la ruta. Toda denegación de autorización se registra.
7. **Auditoría de mutaciones.** Las mutaciones relevantes —incluida la
   actualización de empleados— pasan por caso de uso y emiten el `AuditAction`
   correspondiente. `EMPLOYEE_UPDATED` deja de estar declarado sin emisor.
8. **Pureza del dominio.** Colores, etiquetas y formatos de fecha no pertenecen a
   `domain`; se ubican en `presentation` (patrón de
   `sales/presentation/sale-status.ts`) o en `shared/presentation/format`.
9. **Enforcement.** Una vez migradas las violaciones, se incorporan reglas ESLint
   de fronteras entre capas para impedir regresiones. La regla no se habilita
   antes de completar la migración, para no romper el build.

#### Alternativas consideradas

- **Dejar la implementación como está:** se descarta porque mantiene mutaciones
  sin auditoría, fuga de detalles internos y acoplamiento entre capas.
- **Reescritura masiva en un solo cambio:** se descarta por riesgo sobre
  comportamiento y autorización ya validados.
- **Habilitar sólo las reglas ESLint sin migrar:** se descarta porque produciría
  cientos de errores y no corrige los problemas de fondo.

#### Consecuencias

- La migración es **incremental y preserva comportamiento**; cada ruta o acción
  refactorizada debe verificarse con `tsc`, `eslint`, tests y `build`.
- Se prioriza por riesgo: primero seguridad y trazabilidad, luego integridad de
  capas, luego consistencia, y al final el enforcement.
- Los read models extraídos a `Application` pueden cubrirse con pruebas de caso
  de uso sin depender de componentes visuales.
- Las rutas quedan delgadas y delegan en los módulos.
- Se agrega trabajo de diseño de puertos y servicios de consulta en los módulos
  `progression`, `analytics`, `sales`, `commissions`, `audit` y `organization`.

**Roadmap de remediación (priorizado):**

- **P0 — Seguridad y trazabilidad:** `updateEmployee` por caso de uso con
  auditoría; eliminar la fuga de `error.message` en Server Actions; distinguir
  `NotFoundError`/`AuthorizationError` de errores de infraestructura en las rutas;
  centralizar la resolución de contexto de autenticación.
- **P1 — Integridad de capas:** `Application` de `progression` detrás de sus
  puertos; extraer los read models de `dashboard/progression`, `dashboard`,
  `commissions`, `sales/[id]` a servicios de consulta; mover
  `resolve-resource-labels` a servicios de consulta de los módulos dueños.
- **P2 — Consistencia:** Server Actions sin composition root inline; pureza del
  `domain` de visitas; composición homogénea de los `composition-root`.
- **P3 — Enforcement:** reglas ESLint de fronteras y pruebas de casos negativos
  de autorización.

**Estado de implementación (2026-10-02):**

- **P0 completado, preservando comportamiento:**
  - El contexto de autenticación se movió a
    `src/modules/identity/resolve-auth-context.ts` y se actualizaron sus
    importadores; se eliminó `sales/presentation/resolve-auth-context.ts`.
  - `updateEmployee` se ejecuta a través de `UpdateEmployeeUseCase`, persiste vía
    el puerto `OrganizationRepository.updateEmployee` y emite
    `AuditAction.EMPLOYEE_UPDATED`.
  - El saneamiento de errores de Server Actions se centralizó en
    `src/shared/presentation/action-error.ts`. Las rutas usan
    `src/app/(app)/_lib/handle-page-load-error.ts` para distinguir
    `NotFoundError`/`AuthorizationError` de los errores de infraestructura, y se
    agregó `src/app/(app)/error.tsx` como boundary de la aplicación.
- **Hallazgos abiertos registrados:**
  - `PrismaOrganizationRepository.executeInTransaction` ejecuta el callback con
    `this` en lugar del cliente transaccional de Prisma, por lo que las
    operaciones internas no quedan realmente dentro de la transacción. Se
    registró en `data-architecture.md` §10. Es previo a ADR-020 y queda fuera del
    alcance P0.
  - `GetEmployeeByIdUseCase` autorizaba `employee.read` sin `resource` (hallazgo
    cerrado el 2026-10-04, ver decisiones complementarias).
  - `HierarchyScopeResolver` resuelve TEAM y GLOBAL únicamente sobre empleados
    **activos**, mientras que BRANCH incluye descendientes sin filtrar estado.
    Como `GLOBAL` significa "toda la organización" (permissions-matrix.md §2.2),
    un alcance conectado se considera suficiente aunque el empleado esté
    inactivo (`grantsResourceAccess`). Si un supervisor debe leer o editar a un
    subordinado dado de baja con alcance TEAM, la matriz deberá definirlo.

**Estado de implementación (2026-10-04) — P1 completado, preservando
comportamiento:**

- **`Application` de `progression` detrás de sus puertos.**
  `CalculateProgressionUseCase` y `GetEmployeeProgressionUseCase` dejaron de
  importar Prisma y ahora dependen de `SaleRepository`, `VisitRepository`,
  `OrganizationRepository` y `ProgressionRepository`. Las consultas de venta y
  visita pasaron a adaptadores propios de `sales/infrastructure` y
  `visits/infrastructure`, y los historiales de nivel a
  `infrastructure/organization`.
- **Read models extraídos a servicios de consulta de Application:**
  - `dashboard/progression` → `progression/domain/read-models.ts` con
    `GetPersonalProgressionUseCase` y `GetTeamProgressionUseCase` (este último
    exige `analytics.viewTeam`).
  - `dashboard/commissions` → `GetMonthlyCommissionOverviewUseCase`
    (`sale.readTeam` sólo para alcance `TEAM`).
  - `dashboard` (historial reciente) → `GetSaleCommissionAmountsUseCase`,
    que delega la autorización en la lectura de ventas ya autorizada.
  - `sales/[id]` → `sales/application/read-models.ts` con
    `GetSaleDetailUseCase`, que delega en `GetSaleUseCase` y enriquece los
    ítems con producto, contactos de referido y comisiones.
- **Resolución de etiquetas de auditoría.**
  `audit/presentation/resolve-resource-labels.ts` ya no consulta Prisma:
  agrupa los `resourceId` por tipo de recurso e invoca servicios de consulta
  de los módulos dueños, que la Server Action inyecta como resolvers —
  `GetEmployeeLabelsUseCase` (organization), `GetSaleLabelsUseCase` (sales),
  `GetAccountLabelsUseCase` (identity), `GetCommissionEntryLabelsUseCase` y
  `GetCommissionRuleLabelsUseCase` (commissions). Los módulos dueños
  exponen consultas de lote en sus puertos (`findEmployeeCodesByIds`,
  `findSummariesByIds`, `findAccountEmailsByIds`, `findSaleIdsByIds`,
  `findLevelIdsByIds`); `audit` no lee tablas ajenas y conserva su agrupación
  de ids como lógica de presentación.
- Las rutas `dashboard/progression`, `dashboard`, `dashboard/commissions` y
  `sales/[id]` quedan como composition roots delgados: componen módulos,
  casos de uso y adaptadores y adaptan el resultado a contratos de
  presentación, sin acceso a datos ni reglas de negocio. `prisma` sólo se
  usa como argumento de esos composition roots, en línea con el punto 2 de
  la decisión.

**Estado de implementación (2026-10-04) — P2 completado, preservando
comportamiento:**

- **Composition roots homogéneos.** Los diez composition roots del proyecto
  (`analytics`, `audit`, `authorization`, `commissions`, `identity`,
  `organization`, `progression`, `sales`, `training`, `visits`) resuelven
  internamente el cliente `prisma`, el `AuthorizationService` y los
  repositorios que necesitan de otros módulos, y **ya no reciben parámetros
  de infraestructura**. `createAuthorizationService()` tampoco recibe
  `prisma`. Esta homogeneidad es lo que permite que una Server Action delegue
  sin importar infraestructura (decisión 3) y que una ruta se limite a
  componer módulos (decisión 2).
- **Server Actions sin Prisma ni grafo inline.** Ninguna Server Action
  importa `@/infrastructure/prisma/client` ni instancia adaptadores: valida
  la entrada, resuelve el contexto con `resolveAuthContext` y delega en el
  composition root de su módulo. Las dos acciones que ejecutaban
  `prisma.employee.findUnique` (`promoteToNextLevel` y `promoteEmployee`)
  ahora leen a través de `OrganizationRepository.findEmployeeById`.
- **Consultas de ruta trasladadas a servicios de consulta.** Las siete
  consultas Prisma que ejecutaban páginas de `app/` quedaron detrás de los
  módulos dueños:
  - montos de comisión en `/sales`, `/team/sales`, `/dashboard/sales/all` y
    `/dashboard/sales/month` → `GetSaleCommissionAmountsUseCase`;
  - nombres de vendedor en `/team/sales` → `GetEmployeeNamesUseCase`
    (nuevo; lote en `OrganizationRepository.findNamesByIds`), que no
    declara permiso propio porque la lectura de ventas ya fue autorizada;
  - ítems con producto en `/sales/[id]/edit` → `GetSaleDetailUseCase`, con
    `SaleDetailItem` ampliado para exponer `productId`;
  - detalle de producto en `/catalog/products/[id]/edit` →
    `GetProductByIdUseCase` (nuevo, autoriza `catalog.read`).
- **Pureza del dominio de visits.** `VISIT_STATUS_LABELS` y
  `VISIT_STATUS_COLORS` pasaron a `visits/presentation/visit-status.ts`
  (patrón de `sales/presentation/sale-status.ts`) y `formatVisitDate` al
  kernel `shared/presentation/format` como `formatDateOnly`, conservando la
  fijación en UTC para no desplazar el día calendario según la timezone del
  navegador. `domain/visit.ts` conserva sólo el tipo y los estados.
- **Hallazgo registrado:** `formatClientAddress` permanece en
  `visits/domain/client.ts` porque construye el campo `address` que se
  persiste en el cliente; no es una presentación de pantalla. Y
  `/catalog/products/[id]/edit` verifica `catalog.update` en la página para
  redirigir al usuario: la mutación sigue autorizada en el servidor por
  `UpdateProductUseCase`, pero la condición de navegación duplica esa regla.

**Estado de implementación (2026-10-04) — P3 completado, preservando
comportamiento:**

- **Reglas ESLint de fronteras entre capas** (`eslint.config.mjs`, decisión 9).
  Seis bloques de `@typescript-eslint/no-restricted-imports` —misma sintaxis que
  la regla del núcleo, con `allowTypeImports`, usando el plugin que
  `eslint-config-next` ya registra, **sin dependencias nuevas**— restringen, por
  capa: `domain` no importa infraestructura, Prisma, `shared/presentation` ni
  `application`/`presentation` de módulos; `application` no importa
  infraestructura, Prisma ni `shared/presentation` ni `presentation`;
  `presentation` no importa Prisma/infraestructura ni la `presentation` de otro
  módulo; `app/` no importa infraestructura ni valores de `application`; el
  kernel `shared` no importa infraestructura ni módulos; la infraestructura no
  importa `presentation`. Las reglas se habilitaron **después de comprobar que
  el código actual ya cumplía todas las fronteras** y se verificaron con
  archivos sonda descartados, tal como exige la decisión 9.
  - `audit-actions.ts` ahora importa `resolve-resource-labels` con ruta
    relativa: era el único `presentation → presentation` del proyecto y, al ser
    del propio módulo, la regla de módulos cruzados no debe capturarlo.
  - **Reforzamiento (2026-10-05): `app/` → `application` sólo como tipo.** La
    patrón lleva `allowTypeImports: true`: las 6 importaciones existentes de
    `app/` sobre `application` son `import type` de read models (contratos
    servidor→cliente) y pasan; cualquier **valor** (p. ej. la clase de un caso
    de uso o un helper) queda bloqueado, de modo que el grafo se sigue armando
    en los composition roots. Antes esta fronteras no se restringía porque la
    regla del núcleo no distingue importaciones de tipo.
  - **Reforzamiento (2026-10-05): imports relativos entre módulos.** Los
    patrones sólo cubren el alias `@/`; un import relativo cruzado escapaba a
    las reglas. Se agregó la regla local
    `boundaries/no-cross-module-relative-imports` (en `eslint.config.mjs`, sin
    dependencias): resuelve el specifier contra la ubicación del archivo y
    compara `src/modules/<A>` con `src/modules/<B>`, por lo que funciona a
    cualquier profundidad y cubre `import`, `import()` dinámico y
    `export … from`. Verificada con sondas descartadas (cruce en depth-1 y
    desde `__tests__`, mismo módulo en depth-1) y el código actual no tiene
    ningún cruce (0 hoy).
  - **Límite residual conocido:** un import relativo **dentro** de un mismo
    módulo que violara capas (p. ej. `domain` → `../application`) no lo detecta
    ninguna regla, porque los patrones de capa sólo cubren el alias `@/` y la
    regla local sólo jura fronteras de módulo. Hoy no existe ninguno en el
    código (verificado); se deja registrado en lugar de duplicar la matriz de
    capas en una regla propia.
  - `module A/application → module B/application` sigue permitido
    (composición de casos de uso, p. ej. las aprobaciones de venta que invocan
    comisiones).
- **Pruebas de casos negativos de autorización.** Cinco archivos
  `authorization-negative.test.ts` en `sales`, `commissions`, `analytics`,
  `visits` y `training` (37 tests): cuando el `AuthorizationService` deniega, el
  caso de uso lanza `AuthorizationError` **antes** de tocar un repositorio o el
  `AuditPort`, y se cubren los chequeos que van más allá del permiso: recurso
  `sale` con `ownerId` (anti-IDOR) al enviar a revisión, asignación de visita a
  un vendedor fuera del equipo, actualización de una visita ajena y alcance
  `TEAM` sin resolutor. El módulo `visits` pasó de cero pruebas de autorización
  a cubrir `visit.create`, `visit.update` y `visit.view`.
- **Cobertura de autorización negativa — cerrada (2026-10-05).** Se completaron
  los 18 casos que quedaban sin prueba negativa: las 12 mutaciones restantes de
  `training` (crear, actualizar y eliminar categoría, curso, material y módulo;
  archivar y publicar contenido), `CreateClientUseCase`,
  `GetClientListUseCase` y `GetTeamListUseCase` de `visits`, y
  `CreateCommissionRuleVersionUseCase`, `GetApplicableCommissionRuleUseCase` y
  `GetCommissionEntriesForSaleUseCase` de `commissions`. En este último se
  cubre la escalera de alcances global → branch → team → own: la denegación
  llega tras las cuatro llamadas y la lectura ocurre en cuanto se concede un
  alcance. El barrido de todos los `*-use-case.ts` con `.authorize(` confirma
  que **los 49 casos de uso que autorizan tienen una prueba negativa**; los que
  no viven en un archivo `authorization-negative` están en los tests de su
  propio caso de uso (p. ej. `UpdateEmployeeUseCase` con mensaje en español y
  `GetTeamProgressionUseCase` con `rejects.toBeInstanceOf(AuthorizationError)`).
- **Hallazgo de denegaciones sin registrar — cerrado (2026-10-05).** La decisión 6
  exige que "toda denegación de autorización se registra" y hasta ahora ningún
  emisor generaba eventos `DENIED`. Se resolvió con la acción tipada
  `AUTHORIZATION_DENIED` (catálogo de ADR-013, ahora de 21 valores; migración
  `20261005140644_add_audit_action_authorization_denied`) emitida desde
  `AuthorizationServiceImpl`: todo `deny()` pasa por un único punto que registra
  actor, permiso, recurso y motivo con `result: "DENIED"` y semántica
  best-effort (un fallo de auditoría nunca altera la decisión). El composition
  root inyecta `PrismaAuditAdapter` sin crear ciclos, porque depende de la
  infraestructura de auditoría y no de su composition root. Limitación conocida:
  el evento conserva el `permission` pero no la acción de negocio intentada; si
  el dashboard necesita agrupar por acción, podrá enriquecerse sin cambiar este
  mecanismo.
- **Hallazgo de `actorId` apuntando a un empleado — cerrado (2026-10-05).**
  `audit_event.actorId` es FK a `user_account.id`, pero los casos de uso emitían
  `authContext.employeeId` (y `recruit-employee`, `input.recruiterId`): como
  ningún `employee.id` coincide con una cuenta, `PrismaAuditAdapter` tragaba la
  violación de FK y **el evento se perdía en silencio** (verificado
  empíricamente: 0 eventos persistidos con `actorId` de empleado; los 24
  existentes eran de sesión porque `identity` sí usaba `userAccount.id`). Se
  corrigieron las 13 emisiones de 9 casos de uso (`create-sale`, `update-sale`,
  `submit-sale-for-review`, `approve-sale`, `reject-sale`, `cancel-sale`,
  `update-employee`, `create-commission-rule-version` y `recruit-employee`, este
  último con un nuevo campo `actorId` en su input) más los 2 callers de
  `employees/[id]/actions.ts` (`change-supervisor` y `change-level`), y se dejó
  explícito el contrato del campo `actorId` en los inputs de `change-level`,
  `change-supervisor` y `deactivate-employee`. La regresión queda cubierta por
  el test de `update-employee`.

#### Decisiones complementarias (2026-10-04)

- **Autorización de `employee.update` dentro del caso de uso.**
  `UpdateEmployeeUseCase` recibe el `AuthorizationContext` y delega en
  `AuthorizationService.authorize` con `permission: "employee.update"` y el
  recurso del empleado objetivo (`ownerId` = el propio empleado). La Server
  Action deja de comprobar `role === "ADMIN"`. Motivo: la autorización no puede
  depender del punto de entrada (ADR-009, PERM-PRINCIPLE-005) y el permiso ya
  estaba definido en la matriz. Requiere `authContext` como dato de entrada, en
  línea con los casos de uso del módulo `sales`.
- **Alcance GLOBAL por encima del filtro de empleados activos.** Cuando la
  decisión es denegada pero el alcance conectado es GLOBAL, la operación se
  permite: `GLOBAL` cubre toda la organización, incluido el personal inactivo
  que el resolutor de alcance omite. Sin esta excepción, el ADMIN perdería la
  posibilidad de corregir los datos de un empleado dado de baja.
- **Superficie de edición del supervisor: `/team/[id]`.** La regla de negocio es
  que cada persona edita a sus subordinados: el supervisor N3+ edita a los
  vendedores de su equipo y el ADMIN edita a los N3+. La ficha de supervisor
  (`/team/[id]`) es la vista ya existente para `employee.read` con alcance
  EQUIPO, por lo que el formulario se habilita allí cuando la misma decisión de
  autorización concede `employee.update`. `/employees` y `/employees/[id]`
  permanecen exclusivas del ADMIN: abrirlas a N3+ expondría el listado completo
  de empleados (`getAllEmployees`) y operaciones administrativas (ascenso,
  reasignación de supervisor) que la matriz no les otorga.
- **Acción `updateEmployee` en el módulo.** Al servir a dos rutas, la Server
  Action pasa de `app/(app)/employees/[id]/actions.ts` a
  `modules/organization/presentation/employee-actions.ts`, siguiendo la
  convención de los módulos `sales`, `training` y `audit`. Los campos
  editables se extrajeron a
  `modules/organization/presentation/components/employee-profile-fields.tsx`
  para no duplicar los trece campos entre ambas superficies; el layout de las
  tarjetas sigue siendo propio de cada vista.
- **`employee.read` se verifica sobre el empleado solicitado.**
  `GetEmployeeByIdUseCase` ahora autoriza con `resource: { type: "employee",
  id }`. Antes sólo comprobaba el permiso, de modo que cualquier N3+ podía
  abrir `/team/<cualquier-empleado>` por URL conociendo su id. La denegación se
  traduce a `notFound()` mediante `handlePageLoadError`, con lo que tampoco se
  revela si el registro existe.
- **Helper `grantsResourceAccess`.** La compensación por el filtro de empleados
  activos del resolutor de alcance quedó centralizada en el dominio de
  autorización (`authorization-decision.ts`) y la comparten `GetEmployeeByIdUseCase`
  y `UpdateEmployeeUseCase`, en lugar de repetir la condición en cada caso de uso.

---

## 5. Decisiones pendientes

Todavía no se deben fijar en este documento decisiones definitivas sobre:

- Proveedor de autenticación.
- Proveedor de correo y detalles operativos de recuperación.
- Decisiones adicionales de autorización no cubiertas por `ADR-009`.
- Detalles de futuras integraciones de ventas.
- Base comercial futura si se confirma una fórmula distinta de `Sale.totalAmount`.
- Reglas de promoción.
- Detalles físicos y evolución del catálogo de productos.
- Evolución futura del sistema de formación.
- Almacenamiento de documentos y vídeos.
- Detalles operativos de despliegue.
- Observabilidad.
- Índices definitivos de PostgreSQL.
- Retención y cleanup de datos de auditoría.

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
| 0.9     | 2026-09-07 | ADR-005 actualizado con las siete tasas confirmadas y ADR-012 sobre transacciones e idempotencia de comisiones. |
| 0.10    | 2026-09-08 | ADR-013 sobre auditoría y trazabilidad: mecanismo append-only con AuditPort, 20 eventos tipados, semántica best-effort y lectura restringida. |
| 0.11    | 2026-09-11 | ADR-015 sobre numeración secuencial global de ventas: secuencia PostgreSQL, formato VT-NNNN, unicidad y mutabilidad. |
| 0.12    | 2026-09-11 | ADR-016 sobre snapshots de cliente, referencias externas de pago/facturación, entrega y protección de datos sensibles. |
| 0.13    | 2026-09-11 | ADR-017 sobre separación explícita entre ventas propias y ventas del equipo. |
| 0.14    | 2026-10-02 | ADR-019 sobre el kernel de presentación compartido (`src/shared/presentation/`) y el rol de composition root de las rutas. Se registra también ADR-018 en el historial (identificador operativo secuencial para visitas). |
| 0.15    | 2026-10-02 | ADR-020 sobre fronteras de capas: acceso a datos sólo vía puertos, rutas como composition root sin reglas ni view models, Server Actions delgadas, contexto de autenticación en el módulo `identity`, aislamiento entre módulos, manejo seguro de errores, auditoría de mutaciones y pureza del dominio. Incluye roadmap de remediación priorizado. |
| 0.16    | 2026-10-02 | ADR-020: estado de implementación P0 (contexto de autenticación en `identity`, `updateEmployee` por caso de uso con auditoría, saneamiento de errores y boundary de error) y registro de hallazgos abiertos (`employee.update` N3–N7 vs. ADMIN, transacción efectiva de `executeInTransaction`). |
| 0.17    | 2026-10-04 | ADR-020: `employee.update` se autoriza en `UpdateEmployeeUseCase` por permiso y alcance (resuelve Q143); tratamiento del alcance GLOBAL sobre empleados inactivos; se registran los hallazgos sobre `employee.read` sin `resource` y el filtro de empleados activos del resolutor de alcance. |
| 0.18    | 2026-10-04 | ADR-020: decisiones sobre la superficie de edición del supervisor (`/team/[id]`) y la ubicación de la acción y de los campos compartidos de edición de empleados. |
| 0.19    | 2026-10-04 | ADR-020: `employee.read` se verifica sobre el empleado solicitado (cierra el acceso horizontal por URL en la ficha de supervisor) y la compensación por alcance GLOBAL se centraliza en `grantsResourceAccess`. |
| 0.20    | 2026-10-04 | ADR-020: estado de implementación P1 (puertos de `progression`, read models a servicios de consulta de `dashboard/progression`, `dashboard`, `commissions` y `sales/[id]`, y etiquetas de auditoría resueltas por servicios de los módulos dueños). |
| 0.21    | 2026-10-04 | ADR-020: estado de implementación P2 (composition roots sin parámetros de infraestructura, Server Actions sin Prisma, consultas de ruta trasladadas a servicios de consulta y pureza del dominio de visits). |
| 0.22    | 2026-10-04 | ADR-020: estado de implementación P3 (reglas ESLint de fronteras entre capas y pruebas de casos negativos de autorización); se registra el hallazgo de las denegaciones sin emisor `DENIED`. |
| 0.23    | 2026-10-05 | ADR-020: se cierra el hallazgo de denegaciones con `AUTHORIZATION_DENIED` emitido desde `AuthorizationServiceImpl` (ADR-013 pasa a 21 eventos, con migración del enum `audit_action`). |
| 0.24    | 2026-10-05 | ADR-020: se cierra el hallazgo de `actorId`: las 15 emisiones de auditoría usan ahora el id de cuenta (FK a `user_account`) en lugar del id de empleado, con lo que los eventos de mutación pasan a persistirse. |
| 0.25    | 2026-10-05 | ADR-020: se cierra la cobertura de autorización negativa: los 18 casos de uso que faltaban (`training`, `visits` y `commissions`) tienen prueba, y el barrido de los 49 casos que autorizan confirma cobertura completa. |
| 0.26    | 2026-10-05 | ADR-020: refuerzo del enforcement (decisión 9): las seis fronteras pasan a `@typescript-eslint/no-restricted-imports` con `allowTypeImports` (plugin ya provisto por `eslint-config-next`, sin dependencias nuevas), `app/` queda restringido a importaciones de tipo desde `application`, y la regla local `boundaries/no-cross-module-relative-imports` cierra el límite de imports relativos entre módulos; se documenta el límite residual de imports relativos intra-módulo. |
