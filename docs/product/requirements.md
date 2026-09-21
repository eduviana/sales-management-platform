# Requisitos del sistema

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Tipo:** Aplicación web de uso interno  
**Estado:** En consolidación  
**Versión:** 1.0  
**Última actualización:** 21/09/2026

---

Este documento registra los requisitos funcionales y no funcionales conocidos del sistema.

**La información se clasifica según su grado de certeza:**

- ✅ **Confirmado:** Requisito proporcionado por la empresa o confirmado durante el relevamiento.
- 🔎 **Observado:** Información obtenida mediante material o explicaciones de la empresa que todavía requiere validación formal.
- ⚠️ **Asumido:** Decisión provisional adoptada para permitir el desarrollo de una versión de referencia.
- ❓ **Pendiente:** Información que todavía debe definirse.

---

## 1. Descripción general

La aplicación será utilizada internamente por Royal Prestige para gestionar y visualizar información relacionada con su fuerza de ventas.

La organización está estructurada en 7 niveles jerárquicos. Los empleados ingresan a la empresa en un nivel inicial y pueden avanzar hacia niveles superiores de acuerdo con criterios de negocio que incluyen, al menos, el rendimiento comercial y el tiempo dentro de la organización.

La información actualmente disponible indica que el Nivel 3 es el primer nivel que posee un equipo de vendedores a cargo.

La aplicación deberá adaptar la información y las funcionalidades disponibles según la posición del usuario dentro de la estructura organizacional.

> **Nota:** La nomenclatura fue observada durante el relevamiento y se adopta
> como referencia de diseño. Las responsabilidades oficiales de los Niveles 4
> a 7 requieren validación, aunque existe una escalera de diseño consolidada.

---

## 2. Requisitos confirmados y observados

### 2.1. Cuentas de usuario

El sistema deberá proporcionar cuentas autenticadas para los empleados.

Cada cuenta deberá estar asociada a un empleado y deberá contemplar, como mínimo:

- Identificador único.
- Información personal y/o de la cuenta.
- Nivel organizacional.
- Relación con un supervisor o superior.
- Estado de la cuenta.

Los campos exactos de información del empleado todavía deben definirse.

### 2.2. Niveles organizacionales

La organización posee 7 niveles.

Durante el relevamiento inicial se observó la siguiente nomenclatura:

| Nivel interno | Nombre observado    |
|---------------|---------------------|
| Nivel 1       | Vendedor            |
| Nivel 2       | Vendedor Junior     |
| Nivel 3       | Distribuidor        |
| Nivel 4       | Blue                |
| Nivel 5       | Royal               |
| Nivel 6       | Premier             |
| Nivel 7       | Max                 |

Estos nombres se consideran nomenclatura observada, no identificadores estructurales del sistema.

La aplicación deberá trabajar internamente con una representación estable de los niveles, independiente de sus nombres comerciales.

**Comportamiento actualmente conocido:**

- Los empleados de Nivel 1 son vendedores sin un equipo de ventas bajo su responsabilidad.
- Los empleados de Nivel 2 son vendedores sin un equipo de ventas bajo su responsabilidad.
- El Nivel 3 es el primer nivel conocido que posee responsabilidad sobre un equipo de ventas.
- Los empleados de cualquier nivel pueden continuar realizando ventas personalmente.
- El ascenso entre niveles depende de criterios de negocio que incluyen, como mínimo, el rendimiento en ventas y el tiempo dentro de la organización.

> Los nombres comerciales continúan siendo OBSERVADOS. Las responsabilidades y
> permisos oficiales requieren validación; la versión de referencia utiliza
> decisiones de diseño consolidadas.

### 2.3. Antigüedad del empleado

La antigüedad del empleado constituye un dato relevante para el funcionamiento del negocio.

El tiempo transcurrido desde el ingreso del vendedor puede influir en determinados aspectos comerciales, incluyendo potencialmente el porcentaje de comisión recibido.

El sistema deberá conservar una fecha de ingreso suficientemente precisa como para permitir determinar la antigüedad del empleado en un momento determinado.

> **Pendiente:** Confirmar cómo se define exactamente la antigüedad y qué situaciones especiales deben contemplarse, como bajas, reincorporaciones o períodos discontinuos.

### 2.4. Nivel 3 — Gestión de equipos

Un empleado de Nivel 3 deberá poder gestionar a los vendedores que forman parte de su equipo.

**Funcionalidades confirmadas:**

- Crear una cuenta para un nuevo vendedor incorporado.
- Entregar las credenciales o la cuenta creada al nuevo empleado.
- Consultar información de los miembros de su equipo.
- Consultar estadísticas del equipo.
- Consultar gráficos e información de rendimiento del equipo.
- Consultar sus propias estadísticas y ventas.

El usuario de Nivel 3 continúa siendo un vendedor, por lo que debe mantener acceso a su propia información individual además de la información de su equipo.

### 2.5. Rendimiento individual

Los empleados que no tengan un equipo de ventas bajo su responsabilidad deberán poder consultar información relacionada con su propia actividad.

Como mínimo, deberán poder consultar:

- Información de ventas personales.
- Estadísticas personales.
- Gráficos de rendimiento personal.

Las métricas y visualizaciones exactas todavía deben definirse.

### 2.6. Rendimiento de equipos

Los usuarios que posean responsabilidades de supervisión deberán poder consultar información agregada de su equipo.

**La información potencial incluye:**

- Ventas totales.
- Ventas por período.
- Rendimiento individual.
- Rendimiento del equipo.
- Comparaciones de rendimiento.
- Evolución y tendencias.
- Objetivos y porcentaje de cumplimiento.

> **Pendiente:** Confirmar qué métricas son realmente necesarias y cuáles corresponden a cada nivel.

### 2.7. Comisiones

El sistema deberá contemplar información relacionada con las comisiones de los vendedores.

El sistema utiliza reglas de comisión configurables y versionadas según el nivel
histórico del empleado que realiza la venta.

La regla operativa vigente es:

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
aplican actualmente reglas adicionales por antigüedad, volumen o progresión
mensual. La tasa utilizada queda conservada en cada comisión histórica. La
anterior regla general de diseño del 50 % queda 🔄 REEMPLAZADA como antecedente;
el 50 % vigente para N5 proviene exclusivamente de la tabla confirmada actual.

El sistema deberá diseñarse de forma que las reglas de comisión puedan evolucionar sin necesidad de modificar estructuralmente toda la aplicación.

**Aspectos pendientes:**

- Base comercial definitiva si en el futuro se incorporan descuentos, impuestos,
  costos o márgenes; la implementación inicial utiliza técnicamente
  `Sale.totalAmount`.
- Condiciones adicionales para acceder a cada porcentaje.
- Posible relación entre comisión y nivel.
- Tratamiento de cambios de nivel.
- Tratamiento de devoluciones o anulaciones.
- Detalles operativos de cálculos y ajustes posteriores.

### 2.8. Capacitación

Los vendedores nuevos de Nivel 1 deberán disponer de una sección de capacitación dentro de la aplicación.

La sección deberá permitir consultar material de formación proporcionado por la empresa.

La estructura conceptual de capacitación será categoría → curso → módulo →
material. Actualmente se contemplan los siguientes tipos de contenido:

- Archivos PDF.
- Videos de capacitación.
- Otros materiales que puedan incorporarse posteriormente.

La sección de capacitación deberá estar integrada en la navegación principal de la aplicación, por ejemplo mediante una opción del menú lateral.

**Alcance consolidado:**

```
Capacitación
├── Categorías
├── Cursos
├── Módulos
└── Materiales PDF y videos
```

**Funcionalidades consolidadas:**

Dependiendo de los requisitos definitivos, la sección podría incluir:

- Visualización de materiales.
- Descarga de documentos.
- Reproducción de videos.
- Organización por categorías, cursos y módulos.
- Capacitaciones obligatorias, especialmente para nuevos N1.
- Acceso para otros niveles según el contenido correspondiente.

> **Decisión de diseño:** la capacitación no será exclusiva de N1. `ADMIN` la
> administrará inicialmente; los supervisores no gestionarán contenidos en la
> primera versión. No se implementará seguimiento individual de aprendizaje en
> el alcance actual.

---

## 3. Áreas funcionales

### 3.1. Autenticación

El sistema deberá contemplar:

- Inicio de sesión.
- Gestión de sesiones.
- Cierre de sesión.
- Recuperación de cuenta.

> **Decisión de diseño:** el mecanismo inicial será email + contraseña, sin
> emails corporativos obligatorios ni OAuth inicial. El proveedor concreto y la
> infraestructura de correo permanecen pendientes.

> **Decisión de diseño (cerrada):** las cuentas nuevas se crean con una
> contraseña temporal, almacenada únicamente como hash. El usuario debe cambiar
> obligatoriamente la contraseña en el primer inicio de sesión. No se definen
> políticas de expiración, historial de contraseñas ni bloqueo por intentos.

### 3.2. Panel principal

El panel principal deberá adaptarse a la posición y los permisos del usuario.

**Contenido implementado (Phase 9):**

- **4 tarjetas KPI** en grid bento:
  - Ventas Totales del scope (equipo o propio)
  - Ventas Personales del usuario
  - Vendedores Activos con ventas en el período
  - Progreso del Objetivo Mensual (porcentaje + barra de progreso)
- **Filtros de período:** Hoy / Esta Semana / Este Mes (por defecto: Este Mes)
- **Gráfico de barras:** Ventas diarias del período
- **Gráfico donut:** Distribución de ventas por nivel
- **Tabla de rendimiento del equipo:** Vendedor, nivel, ventas, volumen, estado de objetivo

**Comportamiento por nivel:**

- **N1/N2 (sin equipo):** Solo métricas personales. No se muestra tabla de equipo.
- **N3+ (con equipo):** Métricas de equipo + personales. Se muestra tabla de rendimiento.
- **ADMIN:** Métricas globales de toda la organización. Sección [3.12](#312-gestión-administrativa-de-empleados).

**Objetivos mensuales (REG-055):**

- Configurados por nivel en tabla `monthly_target`.
- Para supervisores: objetivo = targetPorVendedor × subordinados directos.
- Cálculo de cumplimiento: ventasLogradas / objetivo × 100.

El contenido exacto dependerá de la matriz de permisos y de las reglas definidas para cada nivel.

### 3.3. Gestión de equipos

Para los usuarios con responsabilidades de gestión:

- Consultar miembros del equipo.
- Consultar información de los empleados.
- Consultar rendimiento del equipo.
- Crear cuentas de nuevos empleados.
- Consultar estadísticas individuales de los miembros del equipo.

Las demás operaciones de gestión todavía deben definirse.

### 3.4. Ventas

El sistema deberá representar información relacionada con las ventas.

La primera versión no depende de un sistema externo. El vendedor cargará su
propia venta utilizando la documentación oficial de la empresa; la venta quedará
pendiente de revisión del supervisor.

**Identificación de ventas:**

Cada venta deberá poseer un número identificador secuencial global (`saleNumber`).
El número se asigna al crear la venta, inicialmente en estado `DRAFT`. La
representación visible utiliza el formato `VT-0001`, `VT-0002`, etc. El número
es único para todo el sistema y no se reinicia por vendedor, equipo, nivel o
período.

El `saleNumber` debe mostrarse en:
- Listado de ventas.
- Detalle de venta.
- Resultados de búsqueda.
- Cualquier referencia operativa de la venta.

La búsqueda de ventas debe permitir localizar una venta por su número.

> **Nota:** `saleNumber` es independiente del identificador técnico interno
> (`Sale.id`). El prefijo `VT-` y el zero-padding pertenecen exclusivamente
> a la representación presentada al usuario.

**Escenarios que podrían incorporarse en futuras etapas:**

- Las ventas se registran manualmente.
- Las ventas se importan desde otro sistema.
- Las ventas se sincronizan mediante una API externa.
- El sistema recibe únicamente información resumida.
- Existe otra fuente de datos todavía no identificada.

> **Decisión de diseño:** el flujo inicial será interno y no incluirá
> sincronización con sistemas externos. Las futuras integraciones deberán quedar
> aisladas mediante adapters/ports.

Estados iniciales de una venta:

```text
DRAFT → PENDING_REVIEW → APPROVED / REJECTED
```

Una venta aprobada puede pasar posteriormente a `CANCELLED` cuando corresponda.
Las ventas aprobadas no se eliminan físicamente y las cancelaciones o
devoluciones generan ajustes sin reescribir silenciosamente el pasado.

Cada venta tendrá inicialmente un único vendedor responsable. Quien la carga y
quien la aprueba pueden ser personas distintas. Las ventas pendientes o
rechazadas no alimentan estadísticas definitivas ni cálculos definitivos de
comisión.

> **Decisión provisional de alcance:** para la carga manual actual se asumirá que
> toda venta proviene de una visita completada y debe conservar la relación con
> esa visita. El modelo mantiene la posibilidad de ventas directas futuras.

**Información adicional de la venta:**

La pantalla de carga deberá permitir registrar, cuando corresponda:

- Cliente: nombre obligatorio, teléfono obligatorio, email opcional y documento
  opcional.
- Método y estado del pago.
- Cuotas para pagos con tarjeta.
- Referencia externa del pago y, únicamente si resulta necesario, marca y últimos
  cuatro dígitos de la tarjeta.
- Dirección de entrega.

El estado y la fecha de entrega pertenecen a la gestión operativa de la empresa
y no son datos que el vendedor deba inferir durante la carga de la venta. Del
mismo modo, el estado y la referencia de facturación externa son gestionados por
administración o por H&Y Cite y no forman parte del formulario del vendedor.

La aplicación no procesa pagos ni emite facturas fiscales en esta etapa. H&Y Cite
es la fuente externa para esas operaciones; esta aplicación conserva referencias
operativas, no credenciales ni números completos de tarjeta.

La aplicación utilizará un catálogo interno pequeño de productos; no será un
ecommerce. El catálogo permitirá seleccionar productos al registrar ventas,
consultar estadísticas por producto o categoría y administrar información
comercial, precios y estado activo/inactivo. `ADMIN` realizará esa administración
cuando corresponda. Los datos históricos de una venta deberán conservarse aunque
cambien los datos actuales del producto.

### 3.5. Estadísticas y reportes

La aplicación deberá proporcionar representaciones numéricas y gráficas de la información relevante para el negocio.

**Se espera contemplar:**

- Indicadores individuales.
- Indicadores de equipo.
- Comparaciones entre períodos.
- Evolución histórica.
- Agregaciones según la jerarquía organizacional.
- Gráficos de rendimiento.
- Información relacionada con objetivos.
- Información relacionada con comisiones.

Los requisitos específicos de reporting se definirán durante el relevamiento.

### 3.6. Comisiones

El sistema deberá permitir consultar la información relacionada con las comisiones correspondientes al usuario.

Dependiendo de las reglas definitivas, podría contemplarse:

- Porcentaje de comisión actual.
- Comisión obtenida por venta.
- Comisión acumulada.
- Evolución de la comisión.
- Historial de porcentajes.
- Proyección de comisión.
- Información necesaria para comprender el cálculo.

La primera versión podrá calcular comisiones mediante reglas configurables y
versionadas. La fórmula definitiva, la base de cálculo y cualquier fuente
externa siguen pendientes.

### 3.7. Capacitación

La aplicación deberá proporcionar una sección específica para el contenido de formación.

Como mínimo, deberá ser capaz de gestionar o mostrar:

- Documentos PDF.
- Videos.
- Información descriptiva de cada material.

La arquitectura deberá permitir ampliar posteriormente la sección con:

- Cursos.
- Módulos.
- Lecciones.
- Progreso.
- Evaluaciones.
- Materiales adicionales.

Los assessments/quizzes quedan preparados conceptualmente, pero no forman parte
obligatoria del MVP.

### 3.8. Visitas y Demostraciones

> **Estado:** ✅ CONFIRMADA (Phase 10)

La aplicación deberá soportar el flujo completo de visitas a domicilio para demostraciones de productos.

**Requisitos:**

- Los vendedores deben poder ver sus visitas asignadas en una tabla.
- Los vendedores deben poder cargar información de visitas realizadas.
- Las visitas pueden resultar en ventas o no (status: completed, no_sale).
- La información cargada debe enviarse a revisión del supervisor.
- El supervisor debe poder aprobar o rechazar la información.

**Flujo operativo:**

- El vendedor registra el resultado desde la visita asignada.
- Si hubo venta, continúa con la carga de productos y datos de la venta; la venta
  queda vinculada automáticamente a la visita y al cliente.
- Si no hubo venta, registra el motivo u observaciones y la visita pasa a
  `no_sale`; no se crea una entidad `Sale`.
- La página de carga de ventas no debe solicitar que el vendedor busque
  manualmente la visita; la visita se recibe como contexto server-side.

**Referencia:** REG-066, REG-067, data-model.md Visit

### 3.9. Gestión de Clientes

> **Estado:** ✅ CONFIRMADA (Phase 10)

La aplicación deberá gestionar una base de datos de clientes.

**Requisitos:**

- Los supervisores N3+ deben poder ver sus clientes en una tabla.
- Los supervisores N3+ deben poder asignar clientes a vendedores de su equipo.
- Los referidos de vendedores N1/N2 se asignan al N3+ superior.
- La asignación automática queda pendiente (botón deshabilitado).

La navegación separa la actividad propia de la información del equipo. `Mis
Ventas` muestra únicamente las ventas del usuario autenticado; las ventas de los
subordinados se consultan desde `Mi Equipo`.

Los supervisores N3+ deben poder asignar una visita a un vendedor de su equipo,
seleccionando un cliente existente o registrando uno nuevo.

La selección de clientes debe poder filtrarse por nombre, número de documento o
número operativo de cliente. Todo cliente nuevo debe contar con una dirección de
domicilio para poder ser utilizado en una visita.

Los supervisores N3+ también deben poder consultar las visitas asignadas a los
vendedores de su equipo desde una vista separada de `Mis Visitas`.

**Referencia:** REG-069, data-model.md Client

### 3.10. Programa de Referidos

> **Estado:** ✅ CONFIRMADA (Phase 10)

La aplicación deberá soportar un programa de referidos con descuentos.

**Requisitos:**

- Si el cliente proporciona 5 contactos, se aplica 20% de descuento sobre toda la compra.
- Los contactos se cargan en la venta (sección de referidos).
- El descuento se aplica en el mismo documento de venta.
- Un cliente puede obtener el descuento múltiples veces.
- Los contactos referidos se agregan a la base de clientes del N3+.

**Referencia:** REG-068, data-model.md ReferralContact

### 3.11. Mi Equipo (N3+)

> **Estado:** ✅ CONFIRMADA (Phase 10)

Los supervisores N3+ deben poder ver los integrantes de su equipo.

**Requisitos:**

- Los supervisores N3+ deben poder ver una tabla con los vendedores de su equipo.
- La tabla debe mostrar información relevante de cada vendedor.
- Los supervisores N3+ deben poder asignar clientes a vendedores de su equipo.

**Referencia:** REG-069, REG-071

### 3.12. Gestión administrativa de empleados

> **Estado:** 🚧 Decisión de diseño

El rol ADMIN es una cuenta de super-usuario con acceso global a todo el sistema.
No realiza ventas ni posee un equipo propio. Su interfaz debe reflejar esta
naturaleza: una vista de sistema completa, no una vista de vendedor.

#### 3.12.1. Dashboard del ADMIN

El dashboard del ADMIN mostrará una vista de sistema completa, diferente
a la de los vendedores:

- **Métricas globales:** total de ventas, total de vendedores activos,
  volumen total, distribución por nivel.
- **Gráficos adaptados:** los gráficos existentes (barras, donut) deberán
  mostrar datos agregados de toda la organización, no de un vendedor
  individual.
- **Tabla de todos los empleados:** listado de todos los vendedores con su
  nivel, rendimiento y estado. No una tabla de "mi equipo" sino de todos.
- **Filtros globales:** período, nivel, estado (activo/inactivo).

> **Nota:** los gráficos actuales están pensados para la perspectiva de un
> vendedor o supervisor. El ADMIN requerirá gráficos diferentes o
> adaptados que representen la salud general del negocio.

#### 3.12.2. Gestión de datos de empleados

El ADMIN deberá poder modificar la información personal y de contacto
de cualquier empleado:

- Nombre y apellido.
- DNI, email, teléfono.
- Fecha de nacimiento.
- Dirección completa (calle, número, piso, departamento, ciudad,
  provincia, código postal).

> **Regla:** ADMIN puede editar datos de cualquier empleado sin
> restricción de alcance. La operación qued registrada en auditoría.

#### 3.12.3. Gestión de niveles y jerarquía

El ADMIN deberá poder:

- **Ascender/descender de nivel** a cualquier vendedor (cambiar su
  `currentLevelId`).
- **Reasignar supervisor** de cualquier empleado.
- **Ver la estructura jerárquica** completa de cualquier rama:
  - Equipo de María García (N4) → sus N3 → los N1/N2 de cada N3.
  - Cualquier subtree de la organización.

> **Nota:** el ascenso/descenso por ADMIN es una operación administrativa
> distinta del reclutamiento normal (REG-019/REG-020). No sigue la
> escalera automática de reclutamiento.

#### 3.12.4. Creación de empleados

El ADMIN deberá poder crear nuevos empleados con acceso global
(sin restricción de equipo propio, ya que no tiene equipo).

> Ya implementado a nivel de permisos (`employee.create` con alcance
> GLOBAL). Falta la interfaz de usuario dedicada.

#### 3.12.5. Navegación por perspectiva

El ADMIN deberá poder visualizar la información desde la perspectiva
de cualquier vendedor del sistema:

- Ver el dashboard "como lo vería" un N1 (solo sus ventas).
- Ver el dashboard "como lo vería" un N3 (su equipo).
- Ver la lista de ventas de un vendedor específico.
- Ver la lista de clientes de un vendedor específico.

> **Decisión de diseño:** se implementará como navegación directa
> (hacer click en un empleado → ver su información) o como selector
> de perspectiva. La decisión de UX se definirá durante la
> implementación.

#### 3.12.6. Restricciones del ADMIN

El ADMIN **no** deberá:

- Realizar ventas (no aparece como vendedor en ninguna venta).
- Tener un equipo propio (no se muestra en métricas de equipo).
- Aparecer en las tablas de rendimiento de equipo.
- Recibir comisiones.

> **Regla:** el ADMIN es un rol operativo, no comercial. Su existencia
> es para gestión, no para participación en el flujo de ventas.

#### Referencia

- `permissions-matrix.md` §7 (Rol administrativo)
- `authorization.md` (Alcance GLOBAL para ADMIN)
- `business-rules.md` (ADMIN es independiente de niveles, §16.1)

### 3.13. Sistema de progresión de nivel

> **Estado:** 🚧 Decisión de diseño (implementado)

El sistema de progresión permite a los vendedores acumular puntos
hacia el siguiente nivel. La promoción es manual por parte del ADMIN.

#### 3.13.1. Acumulación de puntos

Los puntos se obtienen de 4 fuentes (REG-082):

- **Antigüedad:** 1 punto por mes desde el ingreso.
- **Visitas completadas:** 2 puntos por visita (COMPLETED/NO_SALE).
- **Ventas aprobadas:** 5 puntos por venta (APPROVED).
- **Objetivo mensual alcanzado:** 10 puntos de bonus cuando las ventas
  del mes superan el objetivo del nivel.

Los puntos se acumulan de por vida. Al ser promovido, el progreso
vuelve a 0 pero el historial se conserva.

#### 3.13.2. Umbrales por nivel

| Transición | Puntos requeridos |
|------------|------------------|
| N1 → N2 | 100 |
| N2 → N3 | 200 |
| N3 → N4 | 350 |
| N4 → N5 | 500 |
| N5 → N6 | 700 |
| N6 → N7 | 1000 |

#### 3.13.3. Visualización

- **Tabla de empleados (ADMIN):** barra de progreso con puntos.
- **Detalle de empleado (ADMIN):** card con desglose por fuente.
- **Dashboard del vendedor:** card de progreso hacia el siguiente nivel.

#### Referencia

- `business-rules.md` REG-082, REG-083

### 3.14. Gestión de equipo por ADMIN

> **Estado:** 🚧 Decisión de diseño (implementado)

El ADMIN puede gestionar la estructura jerárquica de cualquier empleado
N3+ desde la página de detalle del empleado.

**Capacidades:**

- Ver subordinados directos de cualquier empleado N3+.
- Reasignar un vendedor de un supervisor a otro.
- Crear nuevos empleados (ya implementado en §3.12.4).

**Restricciones:**

- No se permite auto-supervisión.
- No se permiten ciclos en la jerarquía.
- Todas las operaciones quedan registradas en auditoría.

#### Referencia

- `business-rules.md` REG-084, REG-012

---

## 4. Requisitos no funcionales

### 4.1. Seguridad

El sistema deberá implementar:

- Autenticación segura.
- Autorización del lado del servidor.
- Validación de datos de entrada.
- Protección de rutas y recursos.
- Gestión segura de contraseñas cuando corresponda.
- Protección contra accesos no autorizados.
- Control de acceso a datos según la jerarquía organizacional.
- Protección de recursos de capacitación.
- Protección de información comercial y de comisiones.

### 4.2. Mantenibilidad

La arquitectura deberá permitir:

- Incorporar nuevas reglas de negocio.
- Modificar los permisos asociados a los niveles.
- Incorporar nuevos tipos de reportes.
- Modificar la estructura jerárquica.
- Incorporar nuevos roles.
- Incorporar nuevas reglas de comisión.
- Ampliar el sistema de capacitación.
- Incorporar integraciones externas.
- Evolucionar el sistema sin necesidad de reescribir grandes partes de la aplicación.

### 4.3. Auditoría

Las operaciones relevantes del negocio se rastrean mediante un mecanismo de auditoría append-only implementado detrás de un puerto de auditoría (`AuditPort`).

**Eventos auditables implementados (ADR-013):**

| Categoría | Eventos |
|-----------|---------|
| Identidad | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PASSWORD_CHANGED, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED |
| Organización | EMPLOYEE_CREATED, EMPLOYEE_UPDATED, EMPLOYEE_DEACTIVATED, EMPLOYEE_LEVEL_CHANGED, EMPLOYEE_SUPERVISOR_CHANGED |
| Ventas | SALE_CREATED, SALE_UPDATED, SALE_SUBMITTED, SALE_APPROVED, SALE_REJECTED, SALE_CANCELLED |
| Comisiones | COMMISSION_RULE_CREATED, COMMISSION_GENERATED, COMMISSION_REVERSED |

**Garantías:**

- La auditoría es semántica best-effort: el fallo del mecanismo de auditoría no convierte la operación de negocio en fallida.
- Para operaciones críticas (aprobación de venta + generación de comisión), el evento de auditoría se persiste en la misma transacción que la modificación de negocio (`PrismaTransactionScopedAuditAdapter`).
- Los campos `actorId` y `actorEmail` (snapshot del email al momento del evento) preservan legibilidad cuando la cuenta es desactivada.
- Las operaciones derivadas comparten `correlationId` para trazabilidad.

**Lectura de eventos:**

- Consultable únicamente por usuarios con permiso `audit.read` (rol ADMIN).
- `GetAuditEventsUseCase` provee filtros por actor, acción, tipo de recurso, resultado y rango de fechas, con paginación.

> Los detalles de retención de datos, exportación y política operativa de
> limpieza periódica permanecen pendientes.

### 4.4. Rendimiento

La aplicación deberá mantener tiempos de respuesta adecuados al consultar:

- Estadísticas individuales.
- Estadísticas de equipos.
- Datos de ventas.
- Datos agregados.
- Información histórica.
- Rankings y comparaciones.
- Información relacionada con comisiones.

Las consultas y agregaciones deberán diseñarse teniendo en cuenta el crecimiento futuro del volumen de datos.

### 4.5. Escalabilidad

La solución deberá poder crecer en:

- Cantidad de empleados.
- Cantidad de equipos.
- Cantidad de ventas.
- Cantidad de datos históricos.
- Complejidad de las métricas.
- Cantidad de usuarios concurrentes.
- Cantidad de materiales de capacitación.

No se deberá introducir infraestructura adicional innecesaria de forma prematura. La arquitectura deberá permitir incorporar soluciones específicas cuando el crecimiento real del sistema lo justifique.

### 4.6. Gestión de archivos y contenido multimedia

El sistema deberá poder integrarse con una estrategia de almacenamiento adecuada para:

- Documentos PDF.
- Materiales de capacitación.
- Metadatos de los materiales.
- Otros archivos que puedan incorporarse posteriormente.

Los videos podrán almacenarse dentro de la infraestructura del sistema o mediante un proveedor externo, dependiendo de los requisitos y restricciones definitivos.

> **Pendiente:** Definir estrategia de almacenamiento y distribución de archivos y videos.

---

## 5. Alcance actual

El alcance actual es intencionalmente incompleto.

El objetivo de este documento es registrar la base funcional conocida sin convertir supuestos en requisitos definitivos.

**Requisitos actualmente identificados:**

- Aplicación web de uso interno.
- 7 niveles organizacionales.
- Cuentas autenticadas.
- Gestión de equipos a partir del Nivel 3.
- Creación de cuentas por usuarios de Nivel 3.
- Estadísticas individuales.
- Estadísticas de equipos.
- Gráficos de rendimiento.
- Sistema relacionado con comisiones.
- Progresión de comisión según antigüedad para vendedores nuevos de Nivel 1.
- Sección de capacitación para vendedores nuevos de Nivel 1.
- Soporte para documentos PDF.
- Soporte para videos de capacitación.

**Pendientes principales:**

- Validación oficial de responsabilidades y permisos de los Niveles 4 a 7.
- Matriz definitiva de permisos.
- Detalles definitivos de ventas, productos, estados y ajustes.
- Reglas definitivas de comisiones.
- Objetivos y metas.
- Detalles operativos del rol administrativo.
- Reglas adicionales del historial organizacional.
- Retención de datos de auditoría (cleanup periódico).
- Integraciones externas futuras.
- Proveedor de autenticación y correo, sesiones y 2FA operativo.
- Detalles adicionales de capacitación y plataforma de video.
- Estrategia de almacenamiento de archivos y videos.
- Reporting avanzado.

---

## 6. Estado actual de los requisitos

| Área                                     | Estado              |
|------------------------------------------|---------------------|
| Aplicación web de uso interno            | ✅ Confirmado       |
| 7 niveles organizacionales               | ✅ Confirmado       |
| Nombres comerciales de los niveles       | 🔎 Observado        |
| Actividad de ventas Nivel 1              | ✅ Confirmado       |
| Actividad de ventas Nivel 2              | ✅ Confirmado       |
| Gestión de equipos Nivel 3               | ✅ Confirmado       |
| Creación de cuentas por Nivel 3          | ✅ Confirmado       |
| Estadísticas individuales                | ✅ Confirmado       |
| Estadísticas de equipo                   | ✅ Confirmado       |
| Gráficos de rendimiento                  | ✅ Confirmado       |
| Antigüedad del empleado como dato relevante | 🔎 Observado     |
| Sistema de comisiones                    | 🔎 Observado        |
| Comisión progresiva para Nivel 1         | 🔎 Observado        |
| Capacitación para Nivel 1                | ✅ Implementado        |
| Materiales PDF                           | ✅ Implementado        |
| Videos de capacitación                   | ✅ Implementado        |
| Comportamiento Nivel 4                   | 🚧 Decisión de diseño / validar oficialmente |
| Comportamiento Nivel 5                   | 🚧 Decisión de diseño / validar oficialmente |
| Comportamiento Nivel 6                   | 🚧 Decisión de diseño / validar oficialmente |
| Comportamiento Nivel 7                   | 🚧 Decisión de diseño / validar oficialmente |
| Origen inicial de los datos de ventas    | 🚧 Decisión de diseño |
| Reglas definitivas de comisiones         | ⚠️ Pendiente        |
| Objetivos y metas                        | ⚠️ Pendiente        |
| Rol administrativo `ADMIN`               | 🚧 Decisión de diseño (alcance definido en §3.12, UI pendiente) |
| Requisitos de auditoría                  | ✅ Implementado (retención pendiente) |
| Mecanismo inicial de autenticación       | 🚧 Decisión de diseño |
| Estrategia de almacenamiento multimedia  | ⚠️ Pendiente        |
| Integraciones externas iniciales         | 🚧 Decisión de diseño: no hay integración |
| Seguimiento de capacitación              | 🚧 Decisión de diseño |

---

## 7. Criterios para la versión de referencia

En caso de que el proyecto no sea implementado para Royal Prestige, se podrá construir una versión de referencia completamente operativa utilizando reglas provisionales claramente identificadas.

Estas reglas no deberán confundirse con requisitos oficiales del cliente.

**La versión de referencia podrá incorporar:**

- Definición funcional de los siete niveles.
- Sistema de equipos y jerarquía.
- Sistema de permisos.
- Gestión de empleados.
- Registro de ventas.
- Motor de comisiones.
- Estadísticas y reporting.
- Sistema de capacitación.
- Administración de materiales.
- Auditoría.
- Roles administrativos.

Las decisiones adoptadas para esta versión deberán documentarse como supuestos o decisiones de diseño.

---

## 8. Historial de cambios

| Fecha      | Versión | Cambio                                                                              |
|------------|---------|-------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial del documento a partir del relevamiento informal.                  |
| 01/09/2026 | 0.2     | Incorporación de información sobre niveles comerciales, antigüedad, comisiones y capacitación. |
| 03/09/2026 | 0.3     | Consolidación de niveles, reclutamiento, ventas, autenticación, capacitación y estado de pendientes. |
| 03/09/2026 | 0.4     | Consolidación del flujo de ventas, catálogo, auditoría y autenticación inicial. |
| 03/09/2026 | 0.5     | Consolidación de regla inicial de comisión y simplificación de capacitación. |
| 07/09/2026 | 0.7     | Confirmación de las tasas vigentes N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %. |
| 03/09/2026 | 0.6     | Comisión inicial vigente N1 → 15 % (la regla de 50 % queda REEMPLAZADA como antecedente). Cierre de contraseña temporal y cambio obligatorio en primer inicio. |
| 08/09/2026 | 0.8     | Fase 7: mecanismo de auditoría implementado con AuditPort, 20 eventos auditables, lectura restringida y correlación transaccional. |
| 11/09/2026 | 0.9     | Se consolida la carga operativa de cliente, visita, pago, facturación externa y entrega para ventas manuales. |
| 21/09/2026 | 1.0     | Definición del alcance funcional del rol ADMIN: dashboard global, gestión de empleados, niveles, jerarquía y navegación por perspectiva (§3.12). |
| 21/09/2026 | 1.1     | Sistema de progresión de nivel (§3.13) y gestión de equipo por ADMIN (§3.14). |
