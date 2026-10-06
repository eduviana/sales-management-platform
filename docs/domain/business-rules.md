# Reglas de negocio

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Reglas de negocio  
**Estado:** En consolidación  
**Versión:** 1.5  
**Última actualización:** 05/10/2026

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

### REG-086 — Todo empleado activo posee una cuenta de usuario asignada

> **Estado:** ✅ CONFIRMADA

La cuenta de usuario se crea y asigna antes de que el empleado pueda
comenzar a operar. Un empleado activo nunca debe encontrarse sin cuenta
de usuario.

**Reglas:**

- No se admite un empleado con estado `ACTIVE` sin cuenta de usuario.
- La cuenta se asigna previo al inicio de operaciones.
- Un empleado puede quedar sin cuenta activa únicamente al perder su
  acceso (ver REG-004); en ese caso conserva su historial.

**Referencia:** requirements.md §3.12.1, organizational-model.md §2.2

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

### REG-072 — Toda venta posee un número secuencial

> **Estado:** ✅ CONFIRMADA

La venta debe tener un número entero secuencial dentro del espacio global de
ventas. El número se asigna durante la creación de la venta, cuando esta se
encuentra en estado `DRAFT`.

### REG-073 — El número de venta es único

> **Estado:** ✅ CONFIRMADA

No pueden existir dos ventas con el mismo número. La unicidad debe estar
protegida tanto por la regla de dominio como por una restricción de
persistencia.

### REG-074 — El número de venta no depende de la jerarquía

> **Estado:** ✅ CONFIRMADA

La numeración es global para todo el sistema y no se reinicia por vendedor,
equipo, nivel o período.

### REG-075 — La representación visible utiliza formato VT-NNNN

> **Estado:** ✅ CONFIRMADA

El valor persistido es numérico; el prefijo `VT-` y el zero-padding pertenecen
a la representación presentada al usuario.

```text
saleNumber = 1
display     = VT-0001
```

### REG-076 — El número de venta es inmutable

> **Estado:** ✅ CONFIRMADA

Una vez asignado, el número de venta no puede modificarse durante el ciclo de
vida de la venta.

### REG-077 — La venta debe identificar al cliente

> **Estado:** ⚠️ ASUMIDA

Toda venta cargada mediante el flujo manual debe conservar como mínimo el nombre
y el teléfono del cliente. El email y el documento son opcionales mientras no se
confirme una exigencia legal, fiscal o del sistema externo.

### REG-078 — La venta manual debe relacionarse con una visita completada

> **Estado:** ⚠️ ASUMIDA

Durante el alcance actual, una venta manual debe vincularse a una visita del
vendedor con estado `completed`. El servidor debe verificar la pertenencia de la
visita al vendedor autenticado. El modelo no impide incorporar ventas directas
en una etapa posterior.

### REG-079 — No se almacenan datos completos de tarjetas

> **Estado:** 🚧 DECISIÓN DE DISEÑO

La aplicación no debe almacenar número completo de tarjeta, CVV/CVC, PIN ni
credenciales bancarias. Puede conservar una referencia externa del pago y, si
existe una necesidad operativa confirmada, la marca y los últimos cuatro dígitos.

### REG-080 — La facturación y el procesamiento de pagos pertenecen al sistema externo

> **Estado:** ⚠️ ASUMIDA

La aplicación no emite comprobantes fiscales ni procesa pagos. H&Y Cite se
considera la fuente externa para esas operaciones. La venta puede conservar el
estado y la referencia externa de pago o facturación, sin duplicar información
fiscal o financiera sensible.

### REG-081 — La venta conserva información mínima de entrega

> **Estado:** ⚠️ ASUMIDA

La venta debe conservar una dirección de entrega y un estado operativo de entrega.
La dirección se almacena como snapshot histórico y no se reemplaza
retroactivamente si cambia la dirección actual del cliente.

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

> **Estado:** 🔄 REEMPLAZADA por REG-065

La observación inicial sobre antigüedad y porcentaje de comisión no rige para las
tasas confirmadas de Fase 6. La antigüedad continúa siendo un dato organizacional
disponible, pero no modifica las tasas N1–N7 vigentes.

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

> **Estado:** 🔄 REEMPLAZADA por REG-065

La progresión temporal observada no forma parte de las tasas vigentes de Fase 6.
Las versiones de `CommissionRule` continúan teniendo vigencia temporal para
versionar cambios futuros por nivel, no para introducir meses de antigüedad.

### REG-042 — Las reglas de comisión no deben quedar codificadas rígidamente en la lógica de ventas

> **Estado:** 🚧 DECISIÓN DE DISEÑO

Los porcentajes de comisión y sus condiciones no deberán estar distribuidos directamente en componentes de interfaz o lógica de presentación.

Deberán poder modificarse de manera controlada sin requerir cambios generalizados en la aplicación.

### REG-043 — El cálculo de comisión debe conservar el nivel histórico correspondiente

> **Estado:** 🚧 DECISIÓN DE DISEÑO

El cálculo deberá considerar el nivel histórico vigente del vendedor en la fecha
de la venta y no únicamente el nivel actual del empleado.

Esto permite conservar el contexto histórico si posteriormente se modifican
niveles o porcentajes.

### REG-044 — Los porcentajes de comisión vigentes fueron confirmados

> **Estado:** 🔄 REEMPLAZADA por REG-065

La incertidumbre sobre porcentajes mensuales y reglas por antigüedad fue resuelta
por la tabla confirmada de tasas N1–N7. La base comercial definitiva para futuras
fórmulas, si existiera una distinta de `Sale.totalAmount`, permanece separada de
esta definición de porcentajes.

### REG-065 — Tasas vigentes de comisión por nivel

> **Estado:** ✅ CONFIRMADA

Las comisiones vigentes se determinan según el nivel comercial histórico del
empleado que realiza la venta:

| Nivel | Posición | Comisión |
|-------|----------|----------|
| N1 | Vendedor | 15 % |
| N2 | Vendedor Junior | 20 % |
| N3 | Distribuidor | 30 % |
| N4 | Blue | 40 % |
| N5 | Royal | 50 % |
| N6 | Premier | 60 % |
| N7 | Max | 70 % |

Estas tasas son configurables y versionadas mediante `CommissionRule`. La regla
aplicable se selecciona según el nivel histórico del vendedor en la fecha de la
venta y la versión vigente al momento de aprobación. La entrada histórica debe
conservar la regla, el porcentaje, la base y el importe utilizados.

No se aplican actualmente condiciones adicionales por antigüedad, volumen,
margen, equipo o progresión mensual.

La base técnica inicial del cálculo será `Sale.totalAmount`, preservada como
`baseAmount` en la entrada. Esta base queda encapsulada para poder reemplazarse
si se confirma posteriormente una definición comercial diferente.

La anterior regla de diseño del 50 % queda 🔄 REEMPLAZADA como antecedente
histórico general; el 50 % vigente para N5 se define exclusivamente por esta
nueva tabla confirmada.

---

## 13. Reglas relacionadas con capacitación

### REG-045 — Los vendedores nuevos de Nivel 1 deben disponer de acceso a capacitación

> **Estado:** ✅ CONFIRMADA

Los vendedores nuevos de Nivel 1 deberán disponer de una sección específica de capacitación dentro de la aplicación.

El acceso no será exclusivo de Nivel 1; otros niveles podrán acceder a contenido
correspondiente. El acceso es acumulativo: un usuario de nivel N puede ver
materiales de nivel N y todos los niveles inferiores.

### REG-046 — La capacitación debe formar parte de la navegación de la aplicación

> **Estado:** ✅ CONFIRMADA

La sección de capacitación deberá estar disponible mediante la navegación principal de la aplicación (sidebar).

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

> **Estado:** ✅ CONFIRMADA

La sección de capacitación deberá permitir acceder a materiales de formación en formato PDF.

Los PDFs deberán poder visualizarse y descargarse mediante enlaces externos.

### REG-048 — La capacitación debe soportar videos

> **Estado:** ✅ CONFIRMADA

La sección de capacitación deberá permitir acceder a videos utilizados como material de formación.

Los videos se acceden mediante enlaces externos (URL).

### REG-049 — La capacitación debe soportar una estructura jerárquica de contenidos

> **Estado:** ✅ CONFIRMADA

El sistema deberá poder representar una estructura de capacitación compuesta por:

- Categorías.
- Cursos.
- Módulos.
- Materiales.

Los materiales se organizan por categoría, curso y módulo. No se implementa
seguimiento individual de aprendizaje, progreso, completitud, historial de
progreso ni assessments en el alcance actual.

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

### REG-052 — Las operaciones críticas se rastrean mediante auditoría

> **Estado:** ✅ CONFIRMADA

El sistema registra eventos de auditoría que permiten identificar:

- Quién realizó una acción (`actorId`, `actorEmail`).
- Qué acción realizó (`action` — enum `AuditAction`).
- Sobre qué recurso (`resourceType`, `resourceId`).
- Cuándo ocurrió (`createdAt`).
- Resultado de la operación (`result` — SUCCESS, FAILURE, DENIED).
- Correlación entre eventos derivados (`correlationId`).

El mecanismo es best-effort: un fallo de auditoría no impide la operación de negocio.

### REG-053 — La creación de cuentas es auditable

> **Estado:** ✅ CONFIRMADA

Cuando un usuario crea una cuenta para otro empleado, se registra un evento
`EMPLOYEE_CREATED` que incluye el `actorId`, `actorEmail` y el `createdAt`.
El evento se persiste en la misma transacción que la creación.

### REG-054 — Las operaciones sensibles se auditadan

> **Estado:** ✅ CONFIRMADA

Se auditadan las siguientes categorías de operaciones:

- **Identidad:** LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED.
- **Organización:** EMPLOYEE_CREATED, EMPLOYEE_UPDATED, EMPLOYEE_DEACTIVATED, EMPLOYEE_LEVEL_CHANGED, EMPLOYEE_SUPERVISOR_CHANGED.
- **Ventas:** SALE_CREATED, SALE_UPDATED, SALE_SUBMITTED, SALE_APPROVED, SALE_REJECTED, SALE_CANCELLED.
- **Comisiones:** COMMISSION_RULE_CREATED, COMMISSION_GENERATED, COMMISSION_REVERSED.
- **Autorización:** AUTHORIZATION_DENIED (toda denegación de autorización, ADR-020 decisión 6).

La lista completa de eventos y su modelo de datos se define en `ADR-013` y en
el schema de Prisma.

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
- Las tasas vigentes de comisión son **N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5
  50 %, N6 60 % y N7 70 %** (REG-065). Se mantienen como datos configurables y
  versionados; no quedan hardcodeadas y una nueva versión no altera cálculos
  históricos. La anterior regla general de diseño del 50 % queda 🔄 REEMPLAZADA
  como antecedente; el 50 % vigente para N5 proviene de la tabla confirmada.
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
- Reglas comerciales adicionales de base, descuentos, impuestos o margen para
  futuras versiones del cálculo.
- Base comercial futura si se confirma una fórmula distinta de `Sale.totalAmount`.
- Objetivos individuales.
- Objetivos de equipo.
- Detalles de permisos para modificar ventas.
- Casos particulares de cancelaciones, devoluciones y ajustes.
- Integraciones externas.
- Retención de datos de auditoría (cleanup periódico).
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

### REG-055 — Objetivos mensuales de ventas por nivel

> **Estado:** ✅ CONFIRMADA (Phase 9)

El sistema deberá soportar objetivos mensuales de ventas configurables por nivel.

**Reglas:**

- Cada nivel tiene un número objetivo de ventas por vendedor al mes.
- Los valores iniciales son: N1=10, N2=15, N3–N7=10 ventas por vendedor.
- Para vendedores individuales (N1/N2): el objetivo es el valor configurado para su nivel.
- Para supervisores (N3+): el objetivo del equipo es `targetPorVendedor × cantidad de subordinados directos`. El `targetPorVendedor` corresponde al valor configurado para el nivel del supervisor.
- Para supervisores (N3+): las `ventasLogradas` del objetivo del equipo se calculan **solo con las ventas de los subordinados directos**. Las ventas propias del supervisor no cuentan para el objetivo de su propio equipo: cada vendedor pertenece a un único equipo y sus ventas cuentan para el objetivo del equipo de su supervisor directo y para su propio progreso personal.
- El sistema calcula el porcentaje de cumplimiento: `ventasLogradas / objetivo × 100`.
- Los objetivos se almacenan en la tabla `monthly_target` y pueden ser modificados por ADMIN.

**Referencia:** requirements.md §2.6, data-model.md MonthlyTarget

---

### REG-066 — Visita puede o no resultar en una venta

> **Estado:** ✅ CONFIRMADA (Phase 10)

Una visita a domicilio puede resultar en una venta o no. El sistema debe permitir que el vendedor registre visitas sin ventas concretadas.

**Reglas:**

- El vendedor puede cargar una visita con status `completed` (con venta) o `no_sale` (sin venta).
- Las visitas sin venta se registran para capitalizar el trabajo realizado.
- El supervisor puede revisar visitas con y sin venta.

**Referencia:** data-model.md Visit

---

### REG-067 — El vendedor debe cargar la información de la visita

> **Estado:** ✅ CONFIRMADA (Phase 10)

Hasta que el vendedor no cargue la información de las visitas realizadas, no puede capitalizar el trabajo realizado.

**Reglas:**

- El vendedor debe cargar la información de cada visita realizada.
- La información incluye: productos vendidos (si los hay), método de pago, cuotas, contactos referidos.
- Hasta que no se envíe a revisión, la venta no aparece en la tabla del supervisor.

El resultado de la visita es el punto de entrada del flujo. Cuando existe una
venta, el sistema crea una `Sale` vinculada a la visita y al cliente. Cuando no
existe una venta, solo actualiza la visita a `no_sale` y conserva las
observaciones del vendedor.

### REG-082 — Las ventas propias y las ventas del equipo se consultan por separado

> **Estado:** 🚧 DECISIÓN DE DISEÑO

La vista `Mis Ventas` debe limitarse a las ventas del empleado autenticado. Las
ventas de subordinados se consultan desde una sección explícita de equipo y no
deben mezclarse silenciosamente con la actividad personal.

### REG-083 — Los supervisores pueden asignar visitas a su equipo

> **Estado:** ✅ CONFIRMADA

Un supervisor N3+ puede seleccionar un cliente existente o crear uno nuevo y
asignar una visita a un vendedor subordinado. El servidor valida la relación
jerárquica y conserva quién realizó la asignación.

### REG-084 — La dirección del cliente es obligatoria para visitas

> **Estado:** ✅ CONFIRMADA

Todo cliente utilizado para asignar una visita debe tener una dirección de
domicilio. La dirección es necesaria para que el vendedor pueda realizar la
demostración y debe mostrarse al seleccionar el cliente.

### REG-085 — La dirección se almacena de forma estructurada y se copia en la visita

> **Estado:** 🚧 DECISIÓN DE DISEÑO

La dirección de un cliente se compone de calle, número, ciudad y provincia, con
piso, departamento, código postal y referencias como datos opcionales. Al
asignar una visita, estos datos se copian como snapshot en la visita para
preservar la dirección operativa aunque el cliente la modifique posteriormente.

**Referencia:** data-model.md Visit, Sale

---

### REG-068 — Programa de referidos con descuento

> **Estado:** ✅ CONFIRMADA (Phase 10)

Si el cliente proporciona 5 contactos de futuros clientes, se aplica un 20% de descuento sobre toda la compra.

**Reglas:**

- El descuento es sobre toda la compra (no por producto).
- Los 5 contactos se cargan en la venta (sección de referidos).
- El descuento se aplica en el mismo documento de venta.
- Un cliente puede obtener el descuento múltiples veces (nueva compra + 5 nuevos contactos).

**Referencia:** data-model.md ReferralContact, Sale

---

### REG-069 — Asignación de clientes por supervisores

> **Estado:** ✅ CONFIRMADA (Phase 10)

Los supervisores N3+ asignan clientes a los vendedores de su equipo.

**Reglas:**

- Los supervisores N3+ reciben clientes de sus superiores (N4+).
- Pueden asignar clientes manualmente a vendedores de su equipo.
- La asignación automática queda pendiente (botón deshabilitado).
- Los referidos de vendedores N1/N2 se asignan al N3+ superior.

**Referencia:** data-model.md Client, Visit

---

### REG-070 — Revisión de documentos por supervisores

> **Estado:** ✅ CONFIRMADA (Phase 10)

El supervisor revisa los documentos uno a la vez, contrastando la información física con la del sistema.

**Reglas:**

- El supervisor ve ventas "pend. revisión" en su tabla.
- Puede ver el detalle de cada venta (productos, pago, referidos, descuento).
- Contrastar con el documento físico original.
- Aprueba o rechaza con motivo.

**Referencia:** data-model.md Sale

---

### REG-071 — Sidebar con nuevas secciones

> **Estado:** ✅ CONFIRMADA (Phase 10)

El sidebar debe incluir nuevas secciones para visitas, clientes y equipo.

**Reglas:**

- "Mis Visitas" (todos los niveles): tabla de visitas del vendedor.
- "Clientes" (N3+): tabla de clientes del supervisor.
- "Mi Equipo" (N3+): tabla de vendedores del equipo.

**Referencia:** system-architecture.md, requirements.md

---

## 20.1. Reglas de progresión de nivel

### REG-082 — Sistema de puntos para progresión de nivel

> **Estado:** 🚧 Decisión de diseño

El sistema de progresión de nivel se basa en acumulación de puntos.
Los puntos se obtienen por distintas actividades y el progreso se mide
desde el inicio del nivel actual; los puntos de niveles anteriores se
conservan como historial.

**Fuentes de puntos:**

| Factor | Puntos por unidad | Descripción |
|--------|------------------|-------------|
| Antigüedad | 1 punto/mes | Meses desde el inicio del nivel actual |
| Visita completada | 2 puntos | Visitas con estado COMPLETED o NO_SALE realizadas desde el inicio del nivel actual |
| Venta aprobada | 5 puntos | Ventas con estado APPROVED realizadas desde el inicio del nivel actual |
| Objetivo mensual alcanzado | 10 puntos/bono | Cuando las ventas del mes superan el objetivo del nivel |

**Umbrales por nivel:**

| Transición | Puntos requeridos |
|------------|------------------|
| N1 → N2 | 100 |
| N2 → N3 | 200 |
| N3 → N4 | 350 |
| N4 → N5 | 500 |
| N5 → N6 | 700 |
| N6 → N7 | 1000 |
| N7 | Nivel máximo (sin progresión) |

**Reglas:**

- El progreso hacia el siguiente nivel se mide desde el inicio del nivel
  actual (fecha `startedAt` del registro abierto en `employee_level_history`),
  no desde el ingreso a la organización.
- Al ascender de nivel, el ADMIN abre un nuevo registro de nivel con
  `startedAt` en la fecha del ascenso, por lo que la barra de progreso
  vuelve a 0 % y comienza a crecer mes a mes desde ese momento.
- Las visitas y ventas que cuentan para el progreso son únicamente las
  realizadas desde el inicio del nivel actual (por `scheduledDate` y
  `saleDate`, respectivamente).
- Los puntos históricos de niveles anteriores se conservan como historial
  en `employee_progress` y en `employee_level_history`; no se borran al
  ascender, simplemente dejan de contar para el progreso actual.
- La promoción es manual: solo ADMIN puede ascender de nivel.
- El sistema calcula puntos automáticamente desde datos existentes.
- Los puntos se almacenan en la tabla `employee_progress` como auditoría.
- El ascenso se realiza **de un solo nivel a la vez** (N1 → N2, N2 → N3, ...);
  no se permite saltar más de un nivel en una misma operación.
- El ADMIN puede ascender desde la tabla de empleados cuando la barra de
  progreso alcanza el 100% del umbral del nivel actual.

**Referencia:** requirements.md §3.12, data-model.md EmployeeProgress

### REG-083 — Visibilidad del progreso

> **Estado:** 🚧 Decisión de diseño

El progreso de nivel se muestra:

- **ADMIN:** Barra de progreso en tabla de empleados y card detallada en detalle de empleado.
- **Vendedor:** Card de progreso en su dashboard personal y página de desglose (`/dashboard/progression`).
- **Supervisor N3+:** Página de progresión del equipo (`/dashboard/progression?scope=team`) con
  estadísticas agregadas y tabla de progresión por miembro. Visible desde la card
  "Progreso del Objetivo" del tab "Mi equipo" del dashboard. Requiere `analytics.viewTeam`.

**Referencia:** requirements.md §3.12, §3.13.3

### REG-084 — Gestión de equipo por ADMIN

> **Estado:** 🚧 Decisión de diseño

El ADMIN puede gestionar la estructura jerárquica de cualquier empleado:

- Ver los subordinados directos de cualquier empleado N3+.
- Reasignar un vendedor de un supervisor a otro.
- Crear nuevos empleados bajo cualquier supervisor.

**Reglas:**

- La reasignación valida reglas de jerarquía (no auto-supervisión, no ciclos).
- La operación queda registrada en auditoría.
- El cambio es inmediato.

**Referencia:** requirements.md §3.12.3, REG-012

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
| 07/09/2026 | 0.7     | REG-065 actualizado: tasas confirmadas N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %. Las observaciones de antigüedad quedan reemplazadas. |
| 08/09/2026 | 0.8     | REG-052, REG-053, REG-054 actualizadas: auditoría implementada con 20 eventos auditables, lectura restringida y correlación transaccional. |
| 08/09/2026 | 0.9     | REG-055: objetivos mensuales de ventas por nivel implementados (tabla monthly_target, cálculo individual y de equipo). |
| 08/09/2026 | 0.9     | REG-045, REG-046, REG-047, REG-048, REG-049 actualizadas: capacitación implementada con estructura categorías→cursos→módulos→materiales, acceso acumulativo por nivel y CRUD administrativo. |
| 11/09/2026 | 1.0     | REG-077 a REG-081: cliente y visita obligatorios en la carga manual, protección de datos de tarjeta, referencias externas y snapshot de entrega. |
| 21/09/2026 | 1.1     | REG-082 a REG-084: sistema de puntos para progresión de nivel, visibilidad del progreso y gestión de equipo por ADMIN. |
| 23/09/2026 | 1.2     | REG-055 clarificado: el objetivo del equipo se calcula solo con las ventas de los subordinados directos; las ventas propias del supervisor no cuentan para su propio objetivo de equipo. |
| 24/09/2026 | 1.3     | REG-082 clarificado: ascenso manual por ADMIN de un solo nivel a la vez desde la tabla de empleados cuando el progreso alcanza el 100% del umbral. |
| 24/09/2026 | 1.4     | REG-082: el progreso hacia el siguiente nivel se mide desde el inicio del nivel actual (registro abierto de `employee_level_history`), no desde el ingreso. Al ascender, la barra vuelve a 0 % y crece mes a mes; las visitas, ventas y bonos anteriores al inicio del nivel dejan de contar pero se conservan como historial. |
| 25/09/2026 | 1.5     | REG-086: todo empleado activo posee una cuenta de usuario asignada. La cuenta se crea y asigna antes de que el empleado pueda operar. |
