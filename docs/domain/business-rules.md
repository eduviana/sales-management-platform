# Reglas de negocio

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Reglas de negocio  
**Estado:** En consolidación  
**Versión:** 0.6  
**Última actualización:** 03/09/2026

---

Este documento define las reglas que determinan el comportamiento funcional del sistema.

**Las reglas se clasifican según su nivel de certeza:**

- ✅ **CONFIRMADA** — Información confirmada por el cliente.
- 🔎 **OBSERVADA** — Información obtenida durante el relevamiento, pero todavía pendiente de validación formal.
- ⚠️ **ASUMIDA** — Decisión provisional adoptada para la versión de referencia.
- ❓ **PENDIENTE** — Regla que todavía debe definirse.
- 🚧 **DECISIÓN DE DISEÑO** — Decisión tomada para definir el comportamiento técnico o estructural del sistema.
- 🔄 **REEMPLAZADA** — Regla que fue modificada posteriormente.

---

## 1. Objetivo

El objetivo de este documento es centralizar las reglas que determinan cómo debe comportarse el sistema desde el punto de vista del negocio.

**Las reglas de negocio deberán mantenerse independientes de:**

- La interfaz de usuario.
- El framework utilizado.
- La base de datos.
- El proveedor de autenticación.
- La infraestructura de despliegue.

Una regla debe representar una condición o comportamiento del negocio, independientemente de cómo se implemente técnicamente.

---

## 2. Convenciones

Cada regla tendrá un identificador permanente:

```
REG-001
REG-002
REG-003
...
```

El identificador no debe reutilizarse para una regla diferente.

### 2.1. Ciclo de vida de una regla

Cuando una regla deje de ser válida:

- Se marcará como REEMPLAZADA.
- Se indicará qué regla la reemplaza.
- Se documentará el motivo del cambio cuando sea relevante.

Esto permitirá conservar trazabilidad sobre la evolución del dominio.

---

## 3. Reglas relacionadas con empleados

### REG-001 — Los empleados forman parte de una estructura organizacional

> **Estado:** ✅ CONFIRMADA

Cada empleado forma parte de la estructura organizacional de la empresa y posee una posición dentro de ella.

La posición del empleado influye en la información y las funcionalidades que puede utilizar dentro del sistema.

### REG-002 — Un empleado puede realizar ventas independientemente de su nivel

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Todos los niveles comerciales pueden realizar ventas. Alcanzar un nivel superior
no elimina la capacidad del empleado para realizar ventas.

Esto es especialmente relevante para los empleados que además de supervisar equipos continúan desarrollando actividad comercial propia.

### REG-003 — Un empleado puede tener una cuenta de acceso asociada

> **Estado:** ⚠️ ASUMIDA

Un empleado puede disponer de una cuenta que le permita autenticarse en la aplicación.

La existencia de una cuenta de acceso no debe determinar por sí misma la existencia del empleado como entidad del dominio.

### REG-004 — La desactivación de una cuenta no elimina automáticamente al empleado

> **Estado:** ⚠️ ASUMIDA

Cuando una cuenta pierde acceso al sistema, la información histórica asociada al empleado debe poder conservarse.

**Esto permite mantener:**

- Historial de ventas.
- Estadísticas históricas.
- Información organizacional.
- Registros de auditoría.

---

## 4. Reglas relacionadas con niveles

### REG-005 — La organización posee siete niveles

> **Estado:** ✅ CONFIRMADA

La estructura organizacional está compuesta por siete niveles.

```
Nivel 1
Nivel 2
Nivel 3
Nivel 4
Nivel 5
Nivel 6
Nivel 7
```

### REG-006 — Los niveles representan posiciones dentro de la organización

> **Estado:** ⚠️ ASUMIDA

El nivel de un empleado representa su posición dentro de la estructura organizacional.

**El nivel puede influir en:**

- Responsabilidades.
- Permisos.
- Alcance de información.
- Capacidad de supervisión.
- Acceso a estadísticas.
- Acceso a funcionalidades administrativas.

### REG-007 — El Nivel 3 puede tener un equipo de vendedores a cargo

> **Estado:** ✅ CONFIRMADA

Los empleados de Nivel 3 pueden tener un equipo de vendedores bajo su responsabilidad.

### REG-008 — Los empleados de Nivel 3 continúan siendo vendedores

> **Estado:** ✅ CONFIRMADA

La responsabilidad de supervisión no elimina la actividad comercial individual del empleado.

Por lo tanto, un empleado de Nivel 3 debe poder consultar tanto:

- Información de su propia actividad.
- Información de los empleados que supervisa.

### REG-009 — Los criterios de ascenso entre niveles deben definirse mediante reglas de negocio

> **Estado:** ✅ CONFIRMADA

El ascenso entre niveles depende de criterios de negocio que incluyen, como mínimo:

- Rendimiento en ventas.
- Tiempo dentro de la organización.

No se conocen todavía las reglas exactas ni si existen otros factores.

### REG-010 — Las reglas oficiales exactas de los Niveles 4–7 están pendientes

> **Estado:** ❓ PENDIENTE

Las responsabilidades oficiales y los permisos definitivos de los Niveles 4–7
requieren validación. La versión consolidada puede utilizar la escalera de
diseño documentada más adelante, sin presentarla como confirmación del cliente.

Para la versión de referencia podrán definirse reglas provisionales claramente identificadas como ASUMIDAS.

### REG-011 — Los nombres comerciales de los niveles son independientes de su identificación interna

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Los nombres comerciales de los niveles no deberán utilizarse como identificadores estructurales del sistema.

La aplicación deberá utilizar una representación interna estable para identificar los niveles.

**La nomenclatura observada durante el relevamiento inicial es:**

| Nivel   | Nombre observado    |
|---------|---------------------|
| Nivel 1 | Vendedor            |
| Nivel 2 | Vendedor Junior     |
| Nivel 3 | Distribuidor        |
| Nivel 4 | Blue                |
| Nivel 5 | Royal               |
| Nivel 6 | Premier             |
| Nivel 7 | Max                 |

Estos nombres podrán modificarse sin afectar la estructura interna del sistema.

---

## 5. Reglas relacionadas con jerarquía

### REG-012 — Un empleado puede tener como máximo un supervisor directo activo

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Cada empleado tendrá como máximo un supervisor directo activo. El cambio de
supervisor será una operación explícita y deberá conservar el historial
organizacional correspondiente.

```
Empleado A
    │
    └── Supervisor → Empleado B
```

### REG-013 — Un supervisor puede tener múltiples subordinados

> **Estado:** ⚠️ ASUMIDA

Un supervisor puede ser responsable de múltiples empleados.

```
Supervisor
├── Empleado
├── Empleado
├── Empleado
└── Empleado
```

### REG-014 — La jerarquía es recursiva

> **Estado:** ⚠️ ASUMIDA

Un empleado que actúa como supervisor puede, a su vez, depender de otro supervisor.

Por lo tanto, la estructura puede representarse como un árbol:

```
Empleado A
└── Empleado B
    └── Empleado C
        └── Empleado D
```

### REG-015 — La profundidad de la jerarquía no debe estar codificada rígidamente

> **Estado:** ⚠️ ASUMIDA

La aplicación no debe depender de una cantidad fija de niveles de supervisión para representar la estructura.

La jerarquía debe poder crecer o modificarse sin requerir cambios estructurales en el modelo de dominio.

### REG-016 — Un empleado no debe pertenecer a dos ramas incompatibles de la jerarquía

> **Estado:** ⚠️ ASUMIDA

Para la versión de referencia se asumirá que un empleado pertenece a una única rama organizacional principal.

Esta regla deberá revisarse si el negocio permite estructuras matriciales o múltiples supervisores.

---

## 6. Reglas relacionadas con equipos

### REG-017 — Un equipo está compuesto por empleados bajo una responsabilidad común

> **Estado:** ⚠️ ASUMIDA

Un equipo representa un conjunto de empleados que comparten una relación organizacional común con uno o más responsables.

La implementación concreta del concepto de equipo todavía no está definida.

### REG-018 — El concepto de equipo puede ser explícito o derivado de la jerarquía

> **Estado:** ❓ PENDIENTE

Se deberán evaluar dos alternativas:

```
Equipo explícito
    ↓
entidad propia con identidad, estado, objetivos, etc.
```

o:

```
Equipo implícito
    ↓
conjunto de empleados que dependen de un supervisor
```

La decisión se tomará durante el modelado del dominio y de los datos.

### REG-019 — Un Nivel 3 puede gestionar empleados de su equipo

> **Estado:** ✅ CONFIRMADA

Un usuario de Nivel 3 debe poder acceder a información relacionada con los empleados que forman parte de su equipo, respetando las reglas de autorización correspondientes.

---

## 7. Reglas relacionadas con cuentas de usuario

### REG-020 — Un Nivel 3 puede crear cuentas para nuevos vendedores

> **Estado:** ✅ CONFIRMADA

Un usuario de Nivel 3 debe poder crear una cuenta para un nuevo vendedor que se incorpora a su equipo.

### REG-021 — La creación de una cuenta no implica necesariamente la creación manual de toda la estructura organizacional

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El proceso de incorporación deberá poder asignar al nuevo empleado:

- Nivel.
- Supervisor.
- Equipo, si corresponde.

En el reclutamiento normal, el nivel inicial se asignará según la escalera
correspondiente al nivel del reclutador y no será arbitrariamente seleccionable.
La carga inicial conservará el nivel real actual del empleado.

### REG-022 — La creación de cuentas debe respetar las reglas de autorización

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Aunque un usuario tenga acceso a la funcionalidad de creación de cuentas, solamente podrá crear empleados dentro del alcance permitido por sus permisos.

**Por ejemplo:**

```
Nivel 3
    ↓
crear empleado
    ↓
asignarlo a su propia estructura
```

La regla definitiva dependerá de la matriz de permisos.

### REG-023 — Una cuenta asociada a un empleado inactivo no puede autenticarse

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El sistema deberá poder representar cuentas que ya no tienen acceso a la
aplicación. Cuando el empleado quede inactivo, su cuenta asociada no podrá
autenticarse.

La inactivación debe preservar la información histórica necesaria.

---

## 8. Reglas relacionadas con ventas

### REG-024 — Las ventas deben estar asociadas a un vendedor

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Cada registro de venta debe poder asociarse a un empleado responsable de ella.

### REG-025 — Una venta debe conservar su fecha

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Cada venta deberá disponer de información temporal suficiente para realizar:

- Consultas históricas.
- Comparaciones por período.
- Estadísticas.
- Reportes.
- Cálculos relacionados con la antigüedad del vendedor.

### REG-026 — Las modificaciones de una venta deben ser controladas y auditables

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Las modificaciones relevantes deben realizarse mediante operaciones controladas
y auditables. El supervisor no debe sobrescribir silenciosamente la información
cargada por el vendedor. Los detalles de permisos y circunstancias concretas
deben derivarse de la matriz funcional.

### REG-027 — La primera versión carga ventas internamente

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El vendedor cargará su propia venta utilizando la documentación oficial de la
empresa. La primera versión no depende de sistemas externos ni de sincronización.
Las futuras integraciones deberán mantenerse detrás de adapters/ports.

---

## 9. Reglas relacionadas con estadísticas

### REG-028 — Los usuarios deben poder consultar información relacionada con su propia actividad

> **Estado:** ✅ CONFIRMADA

Los vendedores deben poder consultar estadísticas correspondientes a su actividad comercial.

### REG-029 — Los usuarios con responsabilidades de supervisión pueden consultar estadísticas de su alcance

> **Estado:** ✅ CONFIRMADA

Los usuarios que poseen responsabilidad sobre un equipo deben poder consultar estadísticas relacionadas con ese equipo, de acuerdo con su nivel y permisos.

### REG-030 — Las estadísticas deben poder agregarse según períodos

> **Estado:** ⚠️ ASUMIDA

El sistema deberá poder calcular métricas para distintos períodos de tiempo.

**Como mínimo se contemplan:**

- Día.
- Semana.
- Mes.
- Año.
- Rango personalizado.

### REG-031 — Las estadísticas deben distinguir entre datos propios y datos de subordinados

> **Estado:** ⚠️ ASUMIDA

Cuando un usuario tenga capacidad de consulta sobre una estructura jerárquica, el sistema deberá poder diferenciar:

```
Rendimiento propio
        +
Rendimiento de subordinados
        =
Rendimiento de la estructura
```

Esto será importante para evitar mezclar accidentalmente las ventas personales del supervisor con las métricas de su equipo.

---

## 10. Reglas relacionadas con acceso a información

### REG-032 — Un usuario puede consultar su propia información autorizada

> **Estado:** ✅ CONFIRMADA

Todo usuario autenticado deberá poder acceder a la información propia que corresponda a sus permisos.

### REG-033 — Un usuario no puede acceder automáticamente a información de otros empleados

> **Estado:** ⚠️ ASUMIDA

La autenticación no implica acceso global a la información del sistema.

El acceso deberá estar determinado por autorización.

### REG-034 — La pertenencia jerárquica condiciona el alcance de los datos

> **Estado:** ⚠️ ASUMIDA

La posición del usuario dentro de la jerarquía deberá ser considerada al determinar qué información puede consultar.

### REG-035 — La interfaz no constituye un mecanismo de seguridad

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Ocultar una acción en el frontend no debe considerarse suficiente para impedir su ejecución.

Las operaciones deberán validarse también en el servidor.

### REG-036 — Un usuario no debe poder manipular manualmente su alcance de consulta

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El usuario no debe poder ampliar su acceso simplemente modificando identificadores enviados por el cliente.

Por ejemplo, no debe ser suficiente modificar:

- `teamId`
- `userId`
- `employeeId`

en una petición para obtener información no autorizada.

El servidor deberá determinar el alcance permitido a partir de la identidad autenticada y las reglas correspondientes.

---

## 11. Reglas relacionadas con antigüedad

### REG-037 — La antigüedad del empleado constituye un dato relevante del negocio

> **Estado:** 🔎 OBSERVADA

El tiempo transcurrido desde el ingreso de un vendedor puede influir en determinadas reglas comerciales.

La aplicación deberá conservar una fecha de ingreso que permita determinar la antigüedad del empleado en un momento determinado.

### REG-038 — La fecha de ingreso no debe confundirse con la fecha de creación de la cuenta

> **Estado:** 🚧 DECISIÓN DE DISEÑO

La fecha en que se crea una cuenta de acceso no deberá utilizarse automáticamente como fecha de ingreso del empleado.

Ambos conceptos deberán mantenerse independientes.

### REG-039 — La antigüedad puede utilizarse para determinar condiciones de comisión

> **Estado:** 🔎 OBSERVADA

Según la información disponible durante el relevamiento inicial, la antigüedad de un vendedor de Nivel 1 interviene en la determinación de su porcentaje de comisión.

Los detalles exactos de esta regla todavía deben validarse.

---

## 12. Reglas relacionadas con comisiones

### REG-040 — La observación inicial de comisión fue reemplazada por una regla de diseño versionada

> **Estado:** 🔄 REEMPLAZADA por REG-065 (regla inicial de diseño vigente: **N1 → 15 %**).

Durante el relevamiento inicial se observó una progresión para vendedores nuevos
de Nivel 1. Esa observación no se utilizará como regla operativa vigente.

**La información disponible actualmente indica:**

| Antigüedad  | Porcentaje observado   |
|-------------|------------------------|
| Mes 1       | 10 %                   |
| Mes 2       | 15 %                   |
| Mes 3       | 30 %                   |
| Mes 4       | Pendiente              |
| Mes 5       | Pendiente              |
| Mes 6 a 12  | Entre 45 % y 60 %      |

Los valores anteriores son OBSERVADOS y constituyen únicamente antecedente
histórico; no rigen como regla vigente. La regla vigente se documenta en
REG-065.

### REG-041 — Las reglas de comisión deben permitir una progresión temporal

> **Estado:** 🔎 OBSERVADA

La información disponible indica que el porcentaje de comisión puede cambiar según el período de antigüedad del vendedor.

El sistema deberá ser capaz de representar reglas de comisión dependientes de períodos temporales.

### REG-042 — Las reglas de comisión no deben quedar codificadas rígidamente en la lógica de ventas

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Los porcentajes de comisión y sus condiciones no deberán estar distribuidos directamente en componentes de interfaz o lógica de presentación.

Deberán poder modificarse de manera controlada sin requerir cambios generalizados en la aplicación.

### REG-043 — El cálculo de comisión debe conservar el contexto temporal correspondiente

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Cuando una comisión dependa de la antigüedad del vendedor, el cálculo deberá considerar la antigüedad correspondiente al momento de la venta y no únicamente la situación actual del empleado.

Esto será especialmente importante si posteriormente se permite modificar reglas, niveles o porcentajes.

### REG-044 — Los porcentajes de comisión observados requieren validación

> **Estado:** ❓ PENDIENTE

**Deben confirmarse:**

- Porcentaje del mes 4.
- Porcentaje del mes 5.
- Progresión exacta entre los meses 6 y 12.
- Porcentaje aplicable después del mes 12.
- Base sobre la cual se calcula la comisión.
- Condiciones adicionales para obtener cada porcentaje.
- Relación entre comisión y nivel.
- Tratamiento de ascensos.
- Tratamiento de anulaciones y devoluciones.
- Fuente del cálculo.

### REG-065 — Regla inicial de comisión vigente: N1 → 15 %

> **Estado:** 🚧 DECISIÓN DE DISEÑO (CERRADA)

Un vendedor Nivel 1 (N1) comienza con una comisión del 15 %. Esta regla se
define como dato configurable y versionado del sistema de comisiones; no queda
hardcodeada y podrá ser reemplazada por nuevas reglas sin alterar cálculos
históricos.

La anterior regla de diseño del 50 % queda 🔄 REEMPLAZADA y se conserva
únicamente como antecedente histórico.

**Continúan pendientes:** reglas para N2–N7, base de cálculo y condiciones para
escenarios no especificados. No se definen valores alternativos.

---

## 13. Reglas relacionadas con capacitación

### REG-045 — Los vendedores nuevos de Nivel 1 deben disponer de acceso a capacitación

> **Estado:** 🔎 OBSERVADA

Los vendedores nuevos de Nivel 1 deberán disponer de una sección específica de capacitación dentro de la aplicación.

El acceso no será exclusivo de Nivel 1; otros niveles podrán acceder a contenido
correspondiente.

### REG-046 — La capacitación debe formar parte de la navegación de la aplicación

> **Estado:** 🔎 OBSERVADA

La sección de capacitación deberá estar disponible mediante la navegación principal de la aplicación.

**Por ejemplo:**

```
Dashboard
Ventas
Estadísticas
Capacitación
Perfil
```

La ubicación final dentro de la navegación será una decisión de producto y diseño.

### REG-047 — La capacitación debe soportar documentos PDF

> **Estado:** 🔎 OBSERVADA

La sección de capacitación deberá permitir acceder a materiales de formación en formato PDF.

Los PDFs deberán poder visualizarse y descargarse.

### REG-048 — La capacitación debe soportar videos

> **Estado:** 🔎 OBSERVADA

La sección de capacitación deberá permitir acceder a videos utilizados como material de formación.

La estrategia para alojar o integrar los videos deberá definirse posteriormente.

### REG-049 — La capacitación debe soportar una estructura jerárquica de contenidos

> **Estado:** ⚠️ ASUMIDA

El sistema deberá poder representar una estructura de capacitación compuesta por:

- Categorías.
- Cursos.
- Módulos.
- Materiales.
- Materiales organizados por categoría, curso y módulo.

No se implementará seguimiento individual de aprendizaje, progreso, completitud,
historial de progreso ni assessments en el alcance actual.

---

## 14. Reglas relacionadas con historial

### REG-050 — Los cambios importantes de la estructura deben conservar historial

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El sistema debe conservar historial de:

- Cambios de nivel.
- Cambios de supervisor.
- Cambios de equipo.
- Ingresos.
- Bajas.
- Reincorporaciones.

Como mínimo, el registro debe poder identificar empleado, supervisor, nivel,
inicio y fin de vigencia, motivo y actor del cambio. El nombre físico de la
estructura queda para el modelado posterior.

### REG-051 — Los datos históricos no deben quedar inutilizables por cambios posteriores

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Los cambios actuales de la estructura organizacional no deberían invalidar automáticamente la interpretación de datos históricos.

Por ejemplo, cambiar de supervisor no debería modificar retroactivamente la información sobre quién realizó una venta.

---

## 15. Reglas relacionadas con auditoría

### REG-052 — Las operaciones críticas deberían poder rastrearse

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El sistema debería permitir identificar, cuando corresponda:

- Quién realizó una acción.
- Qué acción realizó.
- Sobre qué recurso.
- Cuándo ocurrió.
- Resultado de la operación.

### REG-053 — La creación de cuentas debería ser auditable

> **Estado:** ⚠️ ASUMIDA

Cuando un usuario cree una cuenta para otro empleado, debería poder determinarse quién realizó la acción y cuándo.

### REG-054 — Las operaciones sensibles deben poder auditarse

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Como mínimo, deben auditarse las operaciones sensibles de empleados, cuentas,
niveles, supervisores, ventas, comisiones, productos, capacitación,
autenticación, credenciales y permisos. La estructura, retención e inmutabilidad
del registro permanecen pendientes.

---

## 16. Reglas consolidadas y provisionales para la versión de referencia

Las siguientes reglas permiten construir una versión completamente operativa del proyecto aunque Royal Prestige no continúe con la implementación.

Estas reglas no deben interpretarse como reglas confirmadas del cliente.

### REG-055 — Cada empleado posee un nivel entre 1 y 7

> **Estado:** 🔄 REEMPLAZADA por REG-005

### REG-056 — Cada empleado posee como máximo un supervisor directo

> **Estado:** 🔄 REEMPLAZADA por REG-012

### REG-057 — Un supervisor puede tener múltiples subordinados

> **Estado:** ⚠️ ASUMIDA

### REG-058 — Un empleado pertenece a una única rama organizacional principal

> **Estado:** ⚠️ ASUMIDA

### REG-059 — Los usuarios de Nivel 3 pueden crear nuevos empleados

> **Estado:** ⚠️ ASUMIDA / ✅ CONFIRMADA

La capacidad está confirmada para el caso de nuevos vendedores incorporados a su equipo.

La implementación definitiva de las restricciones todavía debe validarse.

### REG-060 — Los usuarios de Nivel 1 y 2 solamente consultan inicialmente su propia información

> **Estado:** ⚠️ ASUMIDA

Esta regla se utilizará para la versión de referencia hasta que se definan otras capacidades.

### REG-061 — Los usuarios de Nivel 3 pueden consultar información propia y de su equipo

> **Estado:** ⚠️ ASUMIDA / ✅ CONFIRMADA

### REG-062 — Los niveles superiores podrán consultar una estructura de mayor alcance

> **Estado:** ⚠️ ASUMIDA

Para la versión de referencia se utilizará un modelo de acceso jerárquico ampliado para niveles superiores.

El alcance exacto deberá definirse antes de considerar esta regla como una representación del negocio real.

### REG-063 — El sistema de referencia podrá calcular comisiones mediante reglas configurables

> **Estado:** ⚠️ ASUMIDA

Para la versión de referencia se podrá implementar un mecanismo mediante el cual las reglas de comisión estén separadas de la lógica principal de ventas.

La implementación deberá permitir modificar porcentajes, períodos y condiciones sin alterar directamente la lógica de presentación.

### REG-064 — La versión de referencia podrá incorporar una biblioteca de capacitación

> **Estado:** ⚠️ ASUMIDA

En ausencia de requisitos adicionales del cliente, la versión de referencia podrá incluir:

- Categorías.
- Cursos.
- Módulos.
- Materiales.
- Documentos PDF.
- Videos.
- Descripciones.
- Estado de publicación.

El seguimiento individual de aprendizaje, el progreso, la completitud, su
historial y los assessments/quizzes quedan fuera del alcance actual.

### 16.1. Consolidación de decisiones de negocio y diseño

Las siguientes definiciones reflejan decisiones adoptadas durante la
consolidación. No deben interpretarse como confirmaciones adicionales de Royal
Prestige cuando su estado no sea CONFIRMADO:

- Los siete niveles comerciales son N1 Vendedor, N2 Vendedor Junior, N3
  Distribuidor, N4 Blue, N5 Royal, N6 Premier y N7 Max.
- Todos los niveles pueden realizar ventas.
- N1 y N2 no tienen equipo propio ni capacidad normal de reclutamiento.
- La escalera normal de reclutamiento es N3 → N1, N4 → N3, N5 → N4, N6 → N5 y
  N7 → N6. El reclutador no selecciona arbitrariamente el nivel inicial.
- La carga inicial conserva el nivel real actual de cada empleado y no lo fuerza
  a comenzar en N1.
- Las promociones y demociones no son automáticas. El sistema puede calcular
  indicadores o sugerir candidatos, pero una persona con autoridad toma la
  decisión final.
- `ADMIN` es un rol independiente de los siete niveles y no constituye un N8.
  Puede ejecutar operaciones administrativas sobre cualquier nivel cuando
  corresponda.
- Una venta se carga inicialmente por el vendedor a partir de la documentación
  oficial de la empresa y pasa por `DRAFT`, `PENDING_REVIEW`, `APPROVED` o
  `REJECTED`. Una venta aprobada puede pasar a `CANCELLED` cuando corresponda.
- Una venta aprobada no se elimina físicamente. Cancelaciones, devoluciones y
  ajustes no deben reescribir silenciosamente el historial.
- Cada venta tiene inicialmente un único vendedor responsable. Quien carga y
  quien aprueba pueden ser personas distintas.
- Las ventas pendientes o rechazadas no alimentan estadísticas definitivas ni
  cálculos definitivos de comisión. Las aprobadas sí los alimentan.
- El catálogo interno es pequeño, no es un ecommerce y permite seleccionar
  productos, consultar estadísticas y administrar productos, categorías, precios
  y estado.
- La regla inicial de comisión vigente es **N1 → 15 %** (REG-065), definida
  como dato configurable y versionado; no queda hardcodeada y podrá ser
  reemplazada por nuevas reglas sin alterar cálculos históricos. La anterior
  regla de diseño del 50 % queda 🔄 REEMPLAZADA como antecedente. No se
  definen todavía reglas para N2–N7.
- La comisión se genera conceptualmente cuando una venta pasa a `APPROVED`.
  Una cancelación posterior genera un ajuste o reversión asociado, sin eliminar
  la comisión original.
- La autenticación inicial utiliza email + contraseña, sin emails corporativos
  obligatorios ni OAuth inicial. Las cuentas de empleados inactivos no pueden
  autenticarse.
- Las cuentas nuevas se crean con una contraseña temporal, almacenada
  únicamente como hash, con cambio obligatorio en el primer inicio de sesión
  (`must_change_password = true` hasta completar el cambio; luego `false`).
  No se definen expiración de contraseñas, historial de contraseñas ni bloqueo
  por intentos: no forman parte de las decisiones vigentes.
- La capacitación incluye categorías, cursos, módulos y materiales; admite PDFs
  visualizables y descargables, videos mediante una abstracción de contenido y
  acceso para niveles correspondientes, no exclusivamente N1.
- Los contenidos utilizan `DRAFT`, `PUBLISHED` y `ARCHIVED`. `ADMIN` los crea,
  modifica, publica y archiva; los supervisores no los administran inicialmente.

Estas decisiones deben mantenerse alineadas con `organizational-model.md`,
`requirements.md`, `permissions-matrix.md` y `open-questions.md`.

---

## 17. Reglas pendientes de definición

Las siguientes áreas todavía pueden modificar sustancialmente el comportamiento del sistema:

- Criterios exactos de ascenso.
- Criterios de descenso.
- Validación oficial de responsabilidades y permisos de los Niveles 4–7.
- Existencia y funcionamiento de equipos como entidades independientes.
- Posibilidad de múltiples supervisores.
- Posibilidad de pertenecer a múltiples equipos.
- Reglas definitivas de comisión.
- Base del cálculo de comisión.
- Reglas de comisión para N2–N7 y condiciones futuras que puedan reemplazar la
  regla vigente N1 → 15 %.
- Objetivos individuales.
- Objetivos de equipo.
- Detalles de permisos para modificar ventas.
- Casos particulares de cancelaciones, devoluciones y ajustes.
- Integraciones externas.
- Detalles físicos y retención de auditoría.
- Reglas adicionales de reconstrucción histórica.
- Almacenamiento de archivos.
- Alojamiento de videos.
- Requisitos adicionales de capacitación.

---

## 18. Relación con otros documentos

Las reglas definidas aquí deberán mantenerse alineadas con:

- `docs/product/requirements.md`
- `docs/product/open-questions.md`
- `docs/domain/organizational-model.md`
- `docs/product/permissions-matrix.md`

Sirven como base para:

- `docs/architecture/authorization.md`
- `docs/architecture/architecture-decisions.md`
- `docs/architecture/data-architecture.md`

Y para la definición de:

- Casos de uso.
- Servicios de dominio.
- Modelo de datos.
- Tests.

---

## 19. Trazabilidad

Las reglas deberán poder relacionarse posteriormente con requisitos, permisos, casos de uso y pruebas.

**Una relación conceptual sería:**

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
REQ — Nivel 3 puede crear cuentas
          ↓
REG-020 — Nivel 3 puede crear cuentas para nuevos vendedores
          ↓
PERM — employee.create
          ↓
CASO DE USO — Crear empleado
          ↓
TEST — Nivel 3 puede crear / Nivel 2 no puede
```

**Otro ejemplo:**

```
REQ — Vendedor Nivel 1 utiliza capacitación
          ↓
REG-045 — Nivel 1 debe disponer de acceso a capacitación
          ↓
PERM — training.read
          ↓
CASO DE USO — Consultar capacitación
          ↓
TEST — Nivel 1 puede acceder / usuario no autorizado no puede
```

La trazabilidad completa se incorporará gradualmente a medida que se definan permisos, casos de uso y pruebas.

---

## 20. Estado del documento

Este documento representa la versión inicial del modelo de reglas de negocio.

**Las reglas deberán revisarse cuando:**

- Se obtenga nueva información del cliente.
- Se modifique una hipótesis del proyecto.
- Se detecte una contradicción entre reglas.
- Se incorpore una nueva funcionalidad.
- Se defina una nueva política de negocio.
- Se confirme o descarte información obtenida durante el relevamiento.

Las reglas ASUMIDAS podrán reemplazarse por reglas CONFIRMADAS cuando se disponga de información oficial.

Las reglas OBSERVADAS deberán pasar a CONFIRMADAS, ASUMIDAS o DESCARTADAS una vez validada la información.

---

## 21. Historial de cambios

| Fecha      | Versión | Cambio                                                                              |
|------------|---------|-------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial del documento de reglas de negocio.                                |
| 01/09/2026 | 0.2     | Incorporación de nomenclatura observada, antigüedad, comisiones y capacitación.     |
| 03/09/2026 | 0.3     | Consolidación de reclutamiento, ventas, auditoría, autenticación y capacitación.    |
| 03/09/2026 | 0.4     | Sincronización del alcance de capacitación y del estado de las reglas pendientes. |
| 03/09/2026 | 0.5     | Consolidación de comisión inicial y simplificación del seguimiento de capacitación. |
| 03/09/2026 | 0.4     | Consolidación documental global de reglas y pendientes. |
| 03/09/2026 | 0.6     | REG-065: comisión inicial vigente N1 → 15 % (la regla de diseño del 50 % queda REEMPLAZADA como antecedente). Cierre de contraseña temporal y cambio obligatorio en primer inicio. |
