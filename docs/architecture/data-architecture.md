# Arquitectura de datos

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.5  
**Última actualización:** 2026-09-03

---

## 1. Propósito y alcance

Este documento describe la estrategia arquitectónica de datos de Royal
Prestige. Su objetivo es establecer cómo se almacenan, consultan, protegen,
evolucionan y operan los datos dentro de la arquitectura general del sistema.

El documento complementa, pero no reemplaza, a:

- `docs/architecture/system-architecture.md`, responsable de la arquitectura
  general del sistema;
- `docs/architecture/architecture-decisions.md`, responsable de registrar las
  decisiones arquitectónicas significativas;
- `docs/architecture/authorization.md`, responsable del detalle técnico de
  autenticación y autorización;
- `docs/database/data-model.md`, responsable del modelo conceptual de datos;
- los documentos de dominio, responsables de conceptos y reglas del negocio;
- los documentos de producto, responsables de requisitos y preguntas abiertas.

Este documento no define un esquema Prisma ni un esquema físico de PostgreSQL.
Tampoco define nuevas entidades, atributos, relaciones, cardinalidades o reglas
de negocio.

---

## 2. Estado y clasificación del documento

Se utilizan los estados documentales definidos en `AGENTS.md`:

- ✅ **CONFIRMADO** — información confirmada o requisito oficial;
- 🔎 **OBSERVADO** — información relevada aún no validada formalmente;
- ⚠️ **ASUMIDO** — decisión provisional para una versión de referencia;
- ❓ **PENDIENTE** — información todavía no definida;
- 🚧 **DECISIÓN DE DISEÑO** — decisión técnica o estructural adoptada;
- 🔄 **REEMPLAZADO** — información sustituida por otra definición.

Cuando una decisión ya está respaldada por un ADR, se indica expresamente su
referencia. Las cuestiones de negocio pendientes no se convierten en decisiones
de persistencia por el solo hecho de mencionarse aquí.

---

## 3. Principios de arquitectura de datos

La arquitectura de datos seguirá estos principios:

1. Mantener PostgreSQL como base relacional principal.
2. Mantener Prisma y cualquier SQL específico dentro de `Infrastructure`.
3. No confundir el modelo de persistencia con el modelo de dominio.
4. Encapsular el acceso a datos mediante repositorios, servicios y contratos.
5. Aplicar los scopes autorizados en las consultas cuando sea posible.
6. No traer datos globales para filtrarlos únicamente en memoria.
7. Mantener consistencia transaccional en operaciones que modifiquen datos
   relacionados.
8. Conservar historial cuando una modificación pueda afectar la interpretación
   de datos anteriores y el negocio lo requiera.
9. No introducir índices, restricciones o estructuras derivadas sin una
   necesidad demostrada por el modelo y los patrones de consulta.
10. Permitir que las decisiones pendientes evolucionen sin reconstruir toda la
    arquitectura.

**Clasificación:**

- **DECISIÓN DERIVABLE:** estos principios se desprenden de `ADR-004`,
  `ADR-008`, `ADR-009` y `system-architecture.md`.

---

## 4. Estrategia de persistencia

La persistencia inicial utilizará una base de datos relacional central y una
capa de acceso encapsulada. La aplicación será inicialmente un monolito
modular; no se utilizará una base de datos independiente por módulo.

```text
Application
    ↓ contratos / puertos
Infrastructure
    ↓ repositorios y servicios de persistencia
Prisma / SQL específico
    ↓
PostgreSQL
```

La persistencia deberá servir tanto a las operaciones transaccionales como a
las consultas analíticas iniciales, sin introducir inicialmente un data
warehouse ni una infraestructura distribuida. La primera versión será
independiente de sistemas externos de ventas y no tendrá sincronizaciones
iniciales.

La arquitectura no determina que cada módulo tenga una tabla o repositorio
particular. Los límites concretos deberán derivarse del modelo conceptual y de
los casos de uso aprobados.

La primera versión de ventas será independiente de sistemas externos. La
persistencia deberá soportar conceptualmente la carga por el vendedor, la
revisión del supervisor, la aprobación o el rechazo y los ajustes posteriores,
sin definir aquí las tablas ni el esquema físico.

**Clasificación:**

- **DECISIÓN YA TOMADA:** PostgreSQL es la base de datos relacional principal
  (`ADR-008`).
- **DECISIÓN DERIVABLE:** una única persistencia central es coherente con el
  modular monolith inicial.
- **DECISIÓN PROPUESTA:** encapsular la persistencia detrás de contratos y
  adaptadores.

---

## 5. PostgreSQL y Prisma

### PostgreSQL

PostgreSQL será responsable de las capacidades relacionales, la integridad
referencial y las transacciones correspondientes a las operaciones que utilicen
la base de datos.

También podrá ejecutar consultas recursivas, agregaciones y SQL específico cuando
la estrategia de acceso a datos lo requiera.

### Prisma

Prisma será el ORM/adaptador principal para acceder a PostgreSQL. Su ubicación
arquitectónica es exclusivamente `Infrastructure`.

Prisma podrá encargarse de:

- acceso tipado a datos;
- implementación de repositorios;
- ejecución de transacciones;
- migraciones, cuando se defina la estrategia operativa;
- mapeo entre datos de persistencia y modelos de aplicación.

El modelo generado por Prisma no es el modelo de dominio. El dominio no debe
importar ni depender de Prisma, PostgreSQL o detalles concretos de persistencia.

Cuando Prisma no sea suficiente para consultas jerárquicas, analíticas o de
rendimiento, se podrá utilizar SQL específico. Dicho SQL permanecerá
encapsulado en `Infrastructure`.

**Referencias:** `ADR-008` y `system-architecture.md`.

**Clasificación:**

- **DECISIÓN YA TOMADA:** PostgreSQL + Prisma y ubicación de Prisma en
  `Infrastructure`.
- **DECISIÓN YA TOMADA:** el modelo Prisma no es el modelo de dominio.
- **DECISIÓN DERIVABLE:** SQL específico no implica abandonar Prisma; ambos
  pueden coexistir detrás de las fronteras arquitectónicas.

---

## 6. Separación entre dominio y persistencia

El dominio expresa reglas, políticas y conceptos del negocio. No debe conocer:

- PostgreSQL;
- Prisma;
- SQL;
- nombres de tablas;
- detalles de índices;
- transacciones concretas de un ORM;
- proveedores de almacenamiento.

La capa `Application` coordina casos de uso y consume contratos de acceso a
datos. `Infrastructure` implementa esos contratos.

```text
Domain
    ↓ reglas y políticas
Application
    ↓ contratos / puertos
Infrastructure
    ↓ Prisma / SQL / proveedores
Persistencia
```

El mapeo entre objetos de dominio y modelos de persistencia debe realizarse en
los límites correspondientes. No se debe utilizar directamente un tipo Prisma
como objeto de dominio o como contrato público de un caso de uso.

**Clasificación:**

- **DECISIÓN YA TOMADA:** independencia del dominio respecto de Prisma y
  PostgreSQL (`ADR-008`).
- **DECISIÓN DERIVABLE:** la persistencia concreta pertenece a
  `Infrastructure`.

---

## 7. Repositorios y acceso a datos

Los repositorios y servicios de persistencia deberán encapsular las necesidades
de los casos de uso. No deben convertirse en una vía para recuperar datos
globales sin restricciones.

`Application` dependerá de contratos que expresen operaciones necesarias, por
ejemplo conceptualmente:

```text
obtener empleados autorizados
obtener descendientes de un empleado
obtener métricas dentro de un scope
guardar un cambio transaccional
```

Estos nombres son ejemplos conceptuales, no contratos definitivos.

Los repositorios concretos podrán utilizar Prisma o SQL, pero el detalle no
deberá filtrarse hacia Domain, Presentation o los componentes de Next.js.

El acceso entre módulos debe realizarse mediante casos de uso, servicios o
contratos explícitos. Un módulo no debe depender directamente de los modelos
de persistencia de otro módulo.

**Clasificación:**

- **DECISIÓN DERIVABLE:** `Application` utiliza contratos y
  `Infrastructure` implementa el acceso concreto.
- **DECISIÓN PROPUESTA:** repositorios orientados a necesidades de casos de uso
  y conscientes de las restricciones de autorización.
- **PENDIENTE:** contratos concretos y convenciones de mapeo.

---

## 8. Jerarquía y consultas recursivas

La jerarquía organizacional utiliza inicialmente:

```text
Employee.supervisorId → Employee.id
```

Este patrón es una **Adjacency List**, decisión registrada en `ADR-004`.

Las reglas y políticas jerárquicas pertenecen al dominio. Las consultas
concretas para obtener subordinados, ancestros, descendientes o ramas
pertenecen a `Infrastructure`.

Esto incluye:

- consultas recursivas de PostgreSQL;
- `WITH RECURSIVE` u otros mecanismos equivalentes;
- SQL específico;
- consultas realizadas mediante Prisma;
- optimizaciones concretas de persistencia.

`Application` consumirá estas capacidades mediante contratos o puertos. No se
deben duplicar consultas recursivas en componentes, páginas o casos de uso
individuales.

El alcance inicial `TEAM` puede resolverse mediante la jerarquía sin requerir
una entidad física `Team`. Esto no cierra la definición funcional de `Team`, que
continúa pendiente, ni impide incorporarla posteriormente si adquiere identidad,
objetivos, historial o composición propia.

**Clasificación:**

- **DECISIÓN YA TOMADA:** Adjacency List mediante `Employee.supervisorId`
  (`ADR-004`).
- **DECISIÓN YA TOMADA:** reglas/políticas en Domain y consultas concretas en
  Infrastructure (`ADR-004`).
- **DECISIÓN PROPUESTA:** centralizar la resolución de ramas en contratos de
  organización y persistencia.
- **DEPENDE DE NEGOCIO:** múltiples supervisores, múltiples equipos, niveles
  4–7 e historial organizacional.

---

## 9. Autorización y scopes aplicados a persistencia

La autorización se resuelve server-side según `ADR-009` y
`authorization.md`. La arquitectura de datos debe aplicar sus consecuencias,
sin redefinir permisos ni scopes.

```text
Contexto autenticado
    ↓
Permission
    ↓
Scope
    ↓
Restricción de consulta
    ↓
Repositorio / SQL
    ↓
Datos autorizados
```

La estrategia normal no será:

```text
Traer todos los registros
    ↓
Filtrar en memoria
```

Cuando sea posible, el scope se traducirá a restricciones de persistencia antes
de ejecutar la consulta. Por ejemplo, la consulta de una rama debe limitarse a
la rama resuelta para el usuario, no consultar toda la organización para luego
filtrarla en la aplicación.

La implementación concreta de los filtros pertenece a `Infrastructure`. Las
políticas y reglas de negocio no deben depender de cómo se expresa el filtro en
Prisma o SQL.

Los IDs enviados por el cliente no deben construir por sí mismos una restricción
de scope ni permitir el acceso a otra rama.

**Clasificación:**

- **DECISIÓN YA TOMADA:** autorización server-side y separación Permission /
  Scope (`ADR-009`).
- **DECISIÓN YA TOMADA:** las consultas deben aplicar el scope cuando sea
  posible (`ADR-009`).
- **DECISIÓN DERIVABLE:** los repositorios deben evitar recuperar información
  fuera del alcance autorizado.

---

## 10. Transacciones y consistencia

Las operaciones que modifiquen datos relacionados deben ejecutarse de forma
atómica cuando la consistencia entre esos datos sea necesaria.

Ejemplo conceptual para una modificación de nivel:

```text
validar operación
    ↓
cerrar estado histórico vigente
    ↓
registrar nuevo estado
    ↓
actualizar referencia actual
    ↓
auditar si corresponde
    ↓
confirmar transacción
```

El historial de nivel y la referencia al nivel actual deben permanecer
consistentes, conforme a `ADR-002`.

PostgreSQL será responsable de las transacciones de persistencia y Prisma podrá
coordinar su ejecución desde Infrastructure. Los límites concretos de cada
transacción pertenecen a los casos de uso.

Todavía no se definen:

- niveles de aislamiento;
- locks;
- estrategia de reintentos;
- control detallado de concurrencia;
- consistencia eventual de integraciones.

No se introduce event sourcing.

**Clasificación:**

- **DECISIÓN YA TOMADA:** necesidad de consistencia transaccional para cambios
  relacionados y uso de transacciones de PostgreSQL (`ADR-002`, `ADR-008`).
- **DECISIÓN PROPUESTA:** definir límites transaccionales en Application y
  ejecutarlos en Infrastructure.
- **PENDIENTE:** concurrencia, aislamiento y reintentos.

---

## 11. Datos operativos y consultas analíticas

Inicialmente, las operaciones transaccionales y las consultas analíticas
utilizarán PostgreSQL.

Analytics accederá mediante servicios y repositorios de consulta separados de
las mutaciones, aunque inicialmente utilicen la misma base.

```text
Caso de uso transaccional → repositorio de escritura → PostgreSQL

Consulta analítica → repositorio de lectura → PostgreSQL
```

No se incorporará inicialmente:

- data warehouse;
- microservicio analítico;
- infraestructura distribuida;
- separación física obligatoria entre lectura y escritura.

Si el volumen o los requisitos lo justifican, podrán evaluarse posteriormente:

- índices;
- vistas;
- materialized views;
- tablas agregadas;
- read models;
- caché;
- réplicas de lectura;
- un almacén analítico separado.

Cada evolución deberá preservar los contratos de consulta y las restricciones
de autorización.

Las métricas, objetivos, rankings y períodos disponibles todavía dependen de la
definición funcional.

**Clasificación:**

- **DECISIÓN YA TOMADA:** PostgreSQL como soporte inicial sin data warehouse ni
  infraestructura distribuida (`system-architecture.md`).
- **DECISIÓN PROPUESTA:** separar repositorios de lectura y escritura a nivel
  de aplicación sin separar inicialmente la base física.
- **DEPENDE DE NEGOCIO:** métricas, objetivos y reporting.
- **PENDIENTE:** umbrales de volumen y rendimiento.

---

## 12. Historial y temporalidad

### Nivel

El historial de cambios de nivel está aceptado conceptualmente y respaldado por
`ADR-002`. Debe conservarse de forma que pueda identificarse el nivel vigente en
un momento determinado.

### Organización

Debe conservarse un historial organizacional capaz de registrar, como mínimo,
empleado, supervisor, nivel, inicio y fin de vigencia, motivo y actor del cambio.
El nombre físico de esta estructura queda para el modelado posterior.

Continúan pendientes los detalles de historial de `Team`, autorización histórica,
reconstrucción de scopes históricos y las reglas exactas para reproducir reportes
según la estructura de un período anterior.

### Ventas y comisiones

La necesidad de conservar contexto histórico puede afectar ventas y comisiones,
pero la forma concreta depende de reglas de negocio aún no confirmadas.

No se define aquí una estrategia de event sourcing, snapshots, tablas de
versiones ni restricciones temporales físicas.

**Clasificación:**

- **DECISIÓN YA TOMADA:** historial de nivel (`ADR-002`).
- **DECISIÓN DERIVABLE:** los datos actuales no deberían inutilizar datos
  históricos relevantes.
- **DEPENDE DE NEGOCIO:** historial de supervisores, equipos, estructura y
  reportes históricos.
- **PENDIENTE:** estrategia temporal física.

---

## 13. Auditoría desde la perspectiva de persistencia

`Application` utilizará un contrato o puerto de auditoría desde los casos de
uso. `Infrastructure` implementará la persistencia concreta de esos eventos.

Cuando corresponda, una operación de negocio y su evento de auditoría podrán
persistirse dentro de la misma transacción.

Este documento no define:

- estructura física del evento;
- eventos obligatorios;
- retención;
- inmutabilidad técnica;
- auditoría de denegaciones;
- requisitos de cumplimiento;
- cambios antes y después.

**Clasificación:**

- **DECISIÓN DERIVABLE:** la auditoría debe integrarse con los casos de uso y no
  con componentes visuales.
- **DECISIÓN PROPUESTA:** persistencia de auditoría detrás de un puerto en
  Infrastructure.
- **DEPENDE DE NEGOCIO:** eventos, retención y cumplimiento.
- **PENDIENTE:** modelo físico y política operativa.

---

## 14. Paginación y rendimiento

Las consultas que devuelvan colecciones deberán diseñarse con límites y
paginación adecuados al volumen real. La implementación concreta deberá evitar
traer más datos de los necesarios y mantener las restricciones de autorización
en la consulta.

Todavía no se define una estrategia concreta de paginación. La elección deberá
considerar:

- orden estable;
- filtros autorizados;
- rangos temporales;
- consultas jerárquicas;
- exportaciones;
- cambios concurrentes;
- volumen esperado.

La optimización deberá comenzar por consultas e índices justificados por
patrones reales. No se definirán índices concretos en esta etapa.

Podrán evaluarse posteriormente vistas, agregados, caché o read models si el
rendimiento requerido lo justifica.

**Clasificación:**

- **DECISIÓN DERIVABLE:** considerar crecimiento futuro y limitar resultados.
- **DECISIÓN PROPUESTA:** aplicar paginación en repositorios de consulta y no en
  memoria después de recuperar conjuntos completos.
- **PENDIENTE:** técnica de paginación, índices y objetivos de rendimiento.

---

## 15. Integridad y restricciones de persistencia

La integridad de persistencia deberá complementar, no reemplazar, las reglas del
dominio.

Se deberán evaluar posteriormente:

- claves primarias;
- foreign keys;
- nulabilidad;
- unicidad;
- integridad temporal;
- estados;
- comportamiento ante eliminación;
- prevención física de ciclos jerárquicos;
- restricciones sobre historiales abiertos.

No se fijan aquí decisiones sobre UUID, integer u otros identificadores. Tampoco
se inventan restricciones de unicidad ni reglas definitivas de eliminación.

Las restricciones no deben codificar comportamientos comerciales todavía
pendientes, como promociones, niveles 4–7, equipos o comisiones.

**Clasificación:**

- **DECISIÓN DERIVABLE:** PostgreSQL debe preservar integridad relacional.
- **PENDIENTE:** claves, foreign keys, unicidad, estados y restricciones físicas.
- **DEPENDE DE NEGOCIO:** relaciones y cardinalidades definitivas.

---

## 16. Migraciones y evolución del esquema

El modelo conceptual de `data-model.md` será la referencia previa al esquema
relacional y al esquema Prisma.

Las migraciones deberán evolucionar el esquema de forma controlada y mantener
la compatibilidad necesaria entre la aplicación y la base durante los cambios.

Todavía no se define una estrategia operativa completa para:

- herramienta y flujo de migraciones;
- migraciones de datos;
- cambios destructivos;
- rollback;
- compatibilidad entre versiones;
- ejecución por ambiente;
- despliegues sin interrupción.

El esquema físico deberá reflejar el flujo inicial de ventas y su catálogo
interno, pero no debe congelar decisiones que todavía dependan de reglas
detalladas de dominio, historial, comisiones o equipos.

**Clasificación:**

- **DECISIÓN DERIVABLE:** el esquema deberá derivarse del modelo conceptual y
  de las reglas aprobadas.
- **DECISIÓN PROPUESTA:** tratar las migraciones como cambios versionados y
  revisables.
- **PENDIENTE:** estrategia operativa de migración.

---

## 17. Seeds y datos de referencia

Los datos iniciales deberán distinguirse por propósito:

- **Datos de desarrollo:** permiten ejecutar localmente la aplicación.
- **Datos de prueba:** soportan pruebas automatizadas y escenarios controlados.
- **Datos de referencia:** valores estructurales necesarios para operar, cuando
  hayan sido confirmados.
- **Datos provisionales:** valores utilizados únicamente para una versión de
  referencia y documentados como asumidos.

Los nombres observados de niveles, porcentajes observados de comisiones,
permisos asumidos o estructuras de ejemplo no deben convertirse automáticamente
en datos funcionales definitivos.

La estrategia concreta de seed y su ejecución por ambiente permanecen
pendientes.

**Clasificación:**

- **DECISIÓN DERIVABLE:** separar datos de prueba y datos provisionales de los
  datos funcionales confirmados.
- **PENDIENTE:** mecanismo y contenido definitivo de seeds.

---

## 18. Almacenamiento externo de archivos

Los metadatos de capacitación y el contenido binario se mantendrán
conceptualmente separados.

```text
Metadata en persistencia
        +
FileStorage abstraction
        +
Autorización antes de descargar o reproducir
```

El almacenamiento externo deberá estar detrás de una abstracción en
`Infrastructure`. El dominio no dependerá del proveedor concreto.

Esta arquitectura permite considerar posteriormente almacenamiento de PDFs,
videos u otros archivos sin acoplar el dominio a un servicio específico.

No se define todavía:

- proveedor;
- URLs firmadas;
- streaming;
- expiración;
- límites de tamaño;
- backup de archivos;
- versionado;
- eliminación.

**Clasificación:**

- **DECISIÓN DERIVABLE:** separar metadata y contenido.
- **DECISIÓN PROPUESTA:** utilizar un puerto de almacenamiento implementado en
  Infrastructure.
- **DEPENDE DE NEGOCIO:** acceso, descarga, reproducción y administración.
- **PENDIENTE:** proveedor y detalles operativos.

---

## 19. Backup, recovery y retención

La persistencia de datos deberá contemplar backup y recuperación antes de un
despliegue productivo, pero la estrategia operativa todavía no está definida.

Permanecen pendientes:

- frecuencia de backups;
- retención;
- recuperación puntual;
- pruebas de restauración;
- RPO;
- RTO;
- backups de archivos;
- ubicación de copias;
- requisitos corporativos.

No se inventan valores de frecuencia, retención, RPO o RTO.

La retención también deberá analizarse para empleados inactivos, ventas,
historial, auditoría y materiales de capacitación.

**Clasificación:**

- **DECISIÓN DERIVABLE:** backup y recuperación serán necesarios antes de
  producción.
- **PENDIENTE:** política de backup, recovery y retención.
- **DEPENDE DE NEGOCIO:** requisitos corporativos, legales y operativos.

---

## 20. Cuestiones pendientes

Las principales cuestiones que pueden modificar la arquitectura de datos son:

- detalles físicos de la estructura de ventas y productos;
- modelo funcional de `Team`;
- múltiples equipos o supervisores;
- validación oficial de responsabilidades de los Niveles 4–7;
- alcance de `ADMIN`;
- modelo físico de roles y permisos;
- detalles físicos y reglas adicionales del historial organizacional;
- autorización histórica;
- fórmula y fuente de comisiones;
- reglas particulares de cancelación, devolución y ajustes;
- métricas, objetivos y reporting;
- auditoría y retención;
- proveedor de autenticación, correo y detalles operativos de sesiones;
- estrategia de archivos y videos;
- claves, foreign keys, unicidad e índices;
- timestamps, zonas horarias y estados;
- concurrencia y aislamiento;
- migraciones y seeds;
- backup y recovery.

Estas cuestiones deben mantenerse sincronizadas con
`docs/product/open-questions.md` y no se resuelven en este documento.

---

## 21. Contradicciones documentales

La regla inicial de diseño de comisión vigente es **N1 → 15 %**, configurable y
versionada. La anterior regla de diseño del 50 % queda 🔄 REEMPLAZADA como
antecedente histórico. Las observaciones históricas previas quedan reemplazadas
como base de la regla operativa inicial y no deben utilizarse para definir la
persistencia vigente.

La diferencia entre:

- la estrategia técnica inicial para resolver `TEAM` mediante la jerarquía;
- y la definición funcional pendiente de `Team`;

no se considera una contradicción si se mantiene esa distinción. La estrategia
inicial no requiere una entidad física, pero el modelo funcional futuro puede
incorporarla si el negocio confirma propiedades propias.

---

## 22. Relación con otros documentos

- `docs/architecture/system-architecture.md`: define la arquitectura general,
  las capas, sus dependencias y la ubicación de la persistencia dentro del
  sistema.
- `docs/architecture/architecture-decisions.md`: registra las decisiones
  arquitectónicas significativas, incluyendo `ADR-004`, `ADR-008` y `ADR-009`.
- `docs/architecture/authorization.md`: define el detalle técnico de
  autenticación, autorización, permisos, scopes y acceso protegido.
- `docs/architecture/data-architecture.md`: define la estrategia arquitectónica
  de datos, acceso, consultas, evolución y operación de la persistencia.
- `docs/database/data-model.md`: define el modelo conceptual de entidades,
  relaciones, cardinalidades y restricciones conceptuales.
- `docs/domain/organizational-model.md`: define los conceptos organizacionales
  y las cuestiones pendientes de jerarquía, niveles y equipos.
- `docs/domain/business-rules.md`: define las reglas de negocio y sus estados.
- `docs/product/requirements.md`: define los requisitos funcionales y no
  funcionales.
- `docs/product/open-questions.md`: define las preguntas e incertidumbres
  pendientes.
- `docs/product/permissions-matrix.md`: define las capacidades, roles, niveles
  y alcances funcionales, respetando sus estados de confirmación.

La separación de responsabilidades es:

```text
Requisitos y preguntas
    ↓
Dominio y reglas de negocio
    ↓
Permisos y autorización
    ↓
Arquitectura general y arquitectura de datos
    ↓
Modelo conceptual de datos
    ↓
Esquema físico e implementación
```

---

## 23. Principios para evolucionar la arquitectura de datos

La arquitectura podrá evolucionar cuando el crecimiento o los requisitos lo
justifiquen, siguiendo estas reglas:

1. Medir los patrones reales antes de introducir optimizaciones.
2. Mantener los contratos de Application estables cuando se cambie el adaptador.
3. No propagar Prisma, SQL o detalles de PostgreSQL fuera de Infrastructure.
4. Revisar autorización cada vez que se incorpore una nueva consulta o read model.
5. Mantener consistencia entre datos actuales e históricos cuando corresponda.
6. Introducir agregados, caché, réplicas o almacenes analíticos solo con una
   necesidad demostrada.
7. Documentar mediante ADR las decisiones que cambien significativamente la
   persistencia, seguridad, consistencia o escalabilidad.
8. Actualizar `data-model.md` cuando cambien conceptos, relaciones o
   cardinalidades del dominio.
9. Actualizar `open-questions.md` cuando una definición de negocio sea resuelta
   o reemplazada.

**Clasificación:**

- **DECISIÓN DERIVABLE:** la arquitectura debe evolucionar sin convertir cada
  incertidumbre actual en una restricción irreversible.
- **PENDIENTE:** criterios concretos para activar cada estrategia de evolución.

---

## 24. Estado del documento

Este documento establece la estrategia arquitectónica de datos inicial, pero no
define todavía el esquema físico de PostgreSQL ni el esquema Prisma.

Las definiciones pendientes deberán resolverse primero en sus fuentes de verdad
correspondientes. Posteriormente se revisarán las secciones afectadas y se
determinará si corresponde actualizar el modelo de datos o registrar una nueva
decisión arquitectónica.

## 25. Historial de cambios

| Fecha      | Versión | Cambio |
|------------|---------|--------|
| 2026-09-02 | 0.1     | Creación de la estrategia arquitectónica de datos a partir de la documentación existente. |
| 2026-09-03 | 0.2     | Consolidación del flujo inicial de ventas y del historial organizacional. |
| 2026-09-03 | 0.3     | Consolidación de persistencia, flujo inicial de ventas y dependencias de datos. |
| 2026-09-03 | 0.4     | Consolidación de comisiones y simplificación del alcance de capacitación. |
| 2026-09-03 | 0.5     | Comisión inicial vigente N1 → 15 % (la regla de 50 % queda REEMPLAZADA como antecedente). |
