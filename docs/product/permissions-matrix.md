# Matriz de permisos

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Matriz de permisos  
**Estado:** En definición / consolidación  
**Versión:** 0.8  
**Última actualización:** 29/09/2026

---

Este documento define las capacidades y el alcance de acceso de los diferentes niveles y roles del sistema.

Las capacidades marcadas como confirmadas provienen de la información disponible del cliente. Las capacidades marcadas como observadas provienen de información obtenida durante el relevamiento pero todavía pendiente de validación formal. Las capacidades marcadas como asumidas forman parte del diseño provisional de la versión de referencia.

Las capacidades de diseño consolidadas que todavía requieren validación funcional
se mantienen con el símbolo `🔸`, junto con los supuestos de referencia. El texto
de cada sección distingue ambos casos y evita presentarlos como confirmaciones del
cliente.

---

## 1. Objetivo

La matriz de permisos tiene como objetivo establecer, de manera centralizada, qué operaciones e información puede utilizar cada tipo de usuario.

**La matriz deberá servir como referencia para:**

- Reglas de autorización.
- Casos de uso.
- Diseño de API y Server Actions.
- Componentes de interfaz.
- Pruebas de autorización.
- Documentación funcional.
- Revisión de seguridad.
- Diseño de los servicios de aplicación.

La interfaz no deberá utilizar esta matriz como único mecanismo de protección.

Las restricciones reales deberán validarse siempre del lado del servidor.

---

## 2. Convenciones

### 2.1. Estados

| Símbolo | Significado                                |
|---------|--------------------------------------------|
| ✅      | Permitido y confirmado                     |
| 🔎      | Permitido según información observada      |
| 🔸      | Permitido bajo condiciones / asumido       |
| ⚠️      | Pendiente de definición                    |
| ❌      | No permitido                               |

### 2.2. Tipos de alcance

Las operaciones pueden tener diferentes niveles de alcance:

```
PROPIO
    Información perteneciente al usuario actual.

EQUIPO
    Información de los subordinados o miembros del equipo directo.

RAMA
    Información de toda la estructura subordinada al usuario.

GLOBAL
    Información de toda la organización.

SISTEMA
    Configuración o información transversal al sistema,
    independientemente de la estructura comercial.
```

### 2.3. Dimensiones de autorización

El permiso efectivo de una operación no deberá determinarse únicamente por el nivel.

**Conceptualmente:**

```
Usuario
    ↓
Rol
    +
Nivel
    +
Posición jerárquica
    +
Permiso
    +
Alcance
    ↓
¿Operación autorizada?
```

Esto permite diferenciar entre:

```
Nivel 3
    +
employee.read
    +
alcance: EQUIPO
```

y:

```
Administrador
    +
employee.read
    +
alcance: GLOBAL
```

---

## 3. Principios de autorización

### 3.1. PERM-PRINCIPLE-001 — El acceso se determina en el servidor

La aplicación deberá validar los permisos del usuario en el servidor antes de ejecutar una operación protegida.

> **Estado:** 🚧 DECISIÓN DE DISEÑO

### 3.2. PERM-PRINCIPLE-002 — La autenticación no implica autorización global

Estar autenticado no significa que el usuario pueda consultar o modificar cualquier recurso.

> **Estado:** 🚧 DECISIÓN DE DISEÑO

### 3.3. PERM-PRINCIPLE-003 — El alcance del acceso depende del contexto

Un permiso no necesariamente proporciona acceso global.

**Por ejemplo:**

```
employee.read
```

Puede significar:

```
Nivel 3
    ↓
leer empleados
    ↓
solamente empleados de su estructura autorizada
```

> **Estado:** 🚧 DECISIÓN DE DISEÑO

### 3.4. PERM-PRINCIPLE-004 — Un usuario no puede ampliar su propio alcance

Un usuario no podrá obtener acceso adicional simplemente modificando identificadores enviados desde el cliente.

**Ejemplos:**

- `userId`
- `employeeId`
- `teamId`

El servidor deberá determinar el alcance permitido a partir del usuario autenticado y las reglas correspondientes.

> **Estado:** 🚧 DECISIÓN DE DISEÑO

### 3.5. PERM-PRINCIPLE-005 — Los permisos de consulta y modificación son independientes

El hecho de que un usuario pueda consultar un recurso no implica que pueda modificarlo.

**Por ejemplo:**

```
employee.read
```

No implica:

```
employee.update
```

> **Estado:** 🚧 DECISIÓN DE DISEÑO

### 3.6. PERM-PRINCIPLE-006 — Un permiso nunca debe omitir la validación del alcance

Aunque un usuario posea un permiso determinado, deberá verificarse también si el recurso solicitado se encuentra dentro de su alcance autorizado.

> **Estado:** 🚧 DECISIÓN DE DISEÑO

---

## 4. Permisos funcionales

A continuación se definen los permisos conceptuales que se utilizarán como base del sistema.

### 4.1. Dashboard

| Permiso                       | Descripción                                |
|-------------------------------|--------------------------------------------|
| `dashboard.view`              | Acceder al panel principal                 |
| `dashboard.viewOwnMetrics`    | Consultar métricas propias                 |
| `dashboard.viewTeamMetrics`   | Consultar métricas del equipo              |
| `dashboard.viewBranchMetrics` | Consultar métricas de la rama subordinada  |
| `dashboard.viewGlobalMetrics` | Consultar métricas globales                |

### 4.2. Empleados

| Permiso                      | Descripción                                |
|------------------------------|--------------------------------------------|
| `employee.read`              | Consultar información de empleados         |
| `employee.create`            | Crear nuevos empleados                     |
| `employee.update`            | Modificar información de empleados         |
| `employee.deactivate`        | Desactivar cuentas/empleados               |
| `employee.assignSupervisor`  | Asignar o cambiar supervisor               |
| `employee.assignLevel`       | Asignar o modificar nivel                  |
| `employee.assignTeam`        | Asignar o cambiar equipo                   |

### 4.3. Equipos

| Permiso                | Descripción                          |
|------------------------|--------------------------------------|
| `team.read`            | Consultar información de equipos     |
| `team.create`          | Crear equipos                        |
| `team.update`          | Modificar equipos                    |
| `team.manageMembers`   | Gestionar integrantes                |
| `team.viewMetrics`     | Consultar métricas del equipo        |
| `team.viewSubteams`    | Consultar equipos subordinados       |

### 4.4. Ventas

| Permiso            | Descripción                                |
|--------------------|--------------------------------------------|
| `sale.readOwn`     | Consultar ventas propias                   |
| `sale.readTeam`    | Consultar ventas del equipo                |
| `sale.readBranch`  | Consultar ventas de la rama subordinada    |
| `sale.readGlobal`  | Consultar todas las ventas                 |
| `sale.create`      | Registrar una venta                        |
| `sale.update`      | Modificar una venta en estado DRAFT        |
| `sale.approve`     | Aprobar una venta pendiente de revisión    |
| `sale.reject`      | Rechazar una venta pendiente de revisión   |
| `sale.cancel`      | Cancelar una venta aprobada                |

> **Alcance de `sale.approve` y `sale.reject`:** el supervisor debe poder
> operar sobre ventas de su equipo o rama, según su alcance autorizado.
> Un vendedor no debe poder aprobar o rechazar ventas propias ni ajenas
> sin permiso explícito.

> Los permisos relacionados con ventas deberán ajustarse al origen real de los datos.
>
> Si las ventas se importan automáticamente desde otro sistema, por ejemplo, `sale.create` podría no estar disponible para usuarios internos.

Para la versión consolidada, la venta es cargada por el vendedor responsable,
queda pendiente de revisión y luego es aprobada o rechazada por el supervisor.
La carga, la revisión y la aprobación son responsabilidades separadas; los
permisos exactos de cada transición deberán mantenerse alineados con la matriz
aprobada.

> **Datos personales y operativos:** el vendedor puede consultar los datos de sus
> propias ventas; los supervisores pueden consultar los datos de ventas dentro de
> su alcance de equipo o rama; `ADMIN` puede consultarlos globalmente. Los datos
> de tarjeta, si existieran, deben mostrarse siempre limitados a marca y últimos
> cuatro dígitos. El número completo de tarjeta y el CVV nunca son accesibles
> porque no se almacenan.

> Los estados de entrega y facturación externa no son editables por vendedores.
> Su futura gestión deberá quedar restringida a roles administrativos u
> operativos autorizados.

`Mis Ventas` utiliza siempre `sale.readOwn`. La consulta de ventas de
subordinados se realiza mediante una capacidad separada dentro de `Mi Equipo`
con `sale.readTeam` (o el alcance superior que corresponda).

### 4.5. Catálogo de productos

| Permiso             | Descripción                                     |
|---------------------|-------------------------------------------------|
| `catalog.read`      | Consultar productos y categorías del catálogo    |
| `catalog.create`    | Crear productos o categorías en el catálogo      |
| `catalog.update`    | Modificar productos o categorías del catálogo    |

> El catálogo es interno y pequeño; no es un ecommerce.
>
> `catalog.read` está disponible para cualquier usuario autenticado, ya que
> el catálogo se utiliza para seleccionar productos al registrar ventas.
>
> `catalog.create` y `catalog.update` son capacidades administrativas
> destinadas a `ADMIN`. La necesidad de que supervisores gestionen el
> catálogo queda pendiente de validación.

### 4.6. Clientes (Phase 10)

| Permiso               | Descripción                                     |
|-----------------------|-------------------------------------------------|
| `client.view`         | Consultar clientes                              |
| `client.create`       | Crear clientes                                  |
| `client.update`       | Modificar información de clientes               |
| `client.assign`       | Asignar clientes a vendedores                   |

> `client.view` aplica según scope: OWN (propios), TEAM (equipo), BRANCH (rama).
> `client.assign` solo para N3+ (supervisores con equipo).

> La asignación de una visita a un vendedor también requiere `visit.create` y
> debe limitarse server-side a subordinados directos del supervisor autenticado.

> `Visitas del equipo` utiliza `visit.view` con alcance TEAM. `Mis Visitas`
> continúa utilizando alcance OWN.

### 4.7. Visitas (Phase 10)

| Permiso               | Descripción                                     |
|-----------------------|-------------------------------------------------|
| `visit.view`          | Consultar visitas                               |
| `visit.create`        | Registrar visitas                               |
| `visit.update`        | Actualizar estado de visitas                    |

> `visit.view` aplica según scope: OWN (propias), TEAM (equipo), BRANCH (rama).
> `visit.create` y `visit.update` solo para el vendedor asignado.

> La carga de una venta debe utilizar una visita completada perteneciente al
> vendedor autenticado. La validación se realiza server-side y no depende del
> `visitId` recibido desde el cliente.

### 4.8. Referidos (Phase 10)

| Permiso               | Descripción                                     |
|-----------------------|-------------------------------------------------|
| `referral.view`       | Consultar contactos referidos                   |
| `referral.create`     | Registrar contactos referidos                   |

> Los referidos se cargan como parte de una venta.
> `referral.create` requiere `sale.create`.

### 4.9. Estadísticas y reporting

| Permiso                      | Descripción                          |
|------------------------------|--------------------------------------|
| `analytics.viewOwn`          | Consultar estadísticas propias       |
| `analytics.viewTeam`         | Consultar estadísticas del equipo    |
| `analytics.viewBranch`       | Consultar estadísticas de la rama    |
| `analytics.viewGlobal`       | Consultar estadísticas globales      |
| `analytics.comparePeriods`   | Comparar períodos                    |
| `analytics.compareEmployees` | Comparar empleados                   |
| `analytics.viewRanking`      | Consultar rankings                   |
| `report.generate`            | Generar reportes                     |
| `report.export`              | Exportar reportes                    |

> **Estado de implementación:** `analytics.viewOwn`, `analytics.viewTeam`,
> `analytics.viewBranch` y `analytics.viewGlobal` se resuelven por alcance
> jerárquico en el dashboard. `analytics.comparePeriods`,
> `analytics.compareEmployees`, `analytics.viewRanking`, `report.generate` y
> `report.export` están definidos pero no implementados: su funcionalidad está
> diferida hasta resolver Q48–Q54 (ver requirements.md §3.5). La exportación en
> CSV no se implementa por ahora.

### 4.10. Objetivos

| Permiso            | Descripción                    |
|--------------------|--------------------------------|
| `goal.readOwn`     | Consultar objetivos propios    |
| `goal.readTeam`    | Consultar objetivos del equipo |
| `goal.readBranch`  | Consultar objetivos de la rama |
| `goal.create`      | Crear objetivos                |
| `goal.update`      | Modificar objetivos            |
| `goal.delete`      | Eliminar objetivos             |

> **Estado:** ❓ PENDIENTE
>
> Los objetivos todavía no están confirmados como funcionalidad del sistema.

### 4.11. Niveles y jerarquía

| Permiso                  | Descripción                          |
|--------------------------|--------------------------------------|
| `hierarchy.readOwn`      | Consultar posición propia            |
| `hierarchy.readTeam`     | Consultar estructura directa         |
| `hierarchy.readBranch`   | Consultar estructura subordinada     |
| `hierarchy.readGlobal`   | Consultar estructura global          |
| `hierarchy.update`       | Modificar relaciones jerárquicas     |
| `level.read`             | Consultar niveles                    |
| `level.update`           | Modificar niveles                    |

> Los permisos de modificación deberán estar restringidos a roles con capacidad administrativa.

### 4.12. Comisiones

| Permiso                      | Descripción                                |
|------------------------------|--------------------------------------------|
| `commission.readOwn`         | Consultar comisiones propias               |
| `commission.readTeam`        | Consultar comisiones del equipo            |
| `commission.readBranch`      | Consultar comisiones de la rama            |
| `commission.readGlobal`      | Consultar comisiones globales              |
| `commission.viewRules`       | Consultar las reglas aplicables al cálculo |
| `commission.manageRules`     | Crear o modificar reglas de comisión       |
| `commission.recalculate`     | Solicitar/realizar recálculos              |
| `commission.export`          | Exportar información de comisiones         |

> Los permisos relacionados con el cálculo y administración de comisiones son provisionales.
>
> La necesidad real dependerá de si las comisiones son calculadas internamente o recibidas desde otro sistema.

### 4.13. Capacitación

| Permiso                    | Descripción                          |
|----------------------------|--------------------------------------|
| `training.read`            | Consultar contenido de capacitación  |
| `training.download`        | Descargar materiales                 |
| `training.manage`          | Administrar contenidos               |
| `training.create`          | Crear materiales                     |
| `training.update`          | Modificar materiales                 |
| `training.delete`          | Eliminar materiales                  |
| `training.publish`         | Publicar u ocultar materiales        |
| `training.viewProgress`    | Consultar progreso (fuera del alcance actual) |
| `training.updateProgress`  | Registrar progreso (fuera del alcance actual) |
| `training.manageCourses`   | Administrar cursos/módulos           |

> El acceso a capacitación para Nivel 1 está basado en información observada durante el relevamiento.
>
> El resto de las capacidades de administración y seguimiento son provisionales.

### 4.14. Auditoría

| Permiso          | Descripción                          |
|------------------|--------------------------------------|
| `audit.read`     | Consultar registros de auditoría     |
| `audit.export`   | Exportar registros de auditoría      |

> `audit.read` está implementado y restringido al rol ADMIN. La consulta
> retorna eventos de auditoría con filtros por actor, acción, recurso,
> resultado y rango de fechas.
>
> `audit.export` está definido pero no implementado como endpoint. Podrá
> incorporarse futuramente.
>
> El acceso a auditoría se considera una capacidad administrativa exclusiva.

---

## 5. Matriz de permisos por nivel

La siguiente matriz representa la propuesta inicial para la versión de referencia.

Los permisos de los Niveles 4–7 son provisionales y deberán revisarse cuando se conozcan las reglas reales de Royal Prestige.

### 5.1. Nivel 1 — Vendedor

> **Nombre comercial observado:** Vendedor

| Capacidad                                    | Alcance    | Estado              |
|----------------------------------------------|------------|---------------------|
| Acceder al dashboard                         | Propio     | ✅ Confirmado       |
| Ver métricas personales                      | Propio     | ✅ Confirmado       |
| Ver ventas propias                           | Propio     | 🔸 Asumido          |
| Registrar ventas                             | Propio     | 🔸 Asumido          |
| Consultar otros empleados                    | —          | ❌                  |
| Consultar equipos                            | —          | ❌                  |
| Crear empleados                              | —          | ❌                  |
| Modificar empleados                          | —          | ❌                  |
| Consultar estadísticas de equipo             | —          | ❌                  |
| Consultar estadísticas de rama               | —          | ❌                  |
| Consultar comisiones propias                 | Propio     | 🔎 Observado        |
| Consultar reglas de comisión aplicables      | Propio     | 🔸 Asumido          |
| Acceder a capacitación                       | Propio     | 🔎 Observado        |
| Descargar materiales de capacitación         | Propio     | 🔎 Observado        |
| Consultar progreso de capacitación           | —          | ❌ Fuera del alcance actual |
| Gestionar capacitación                       | —          | ❌                  |
| Gestionar niveles                            | —          | ❌                  |

### 5.2. Nivel 2 — Vendedor Junior

> **Nombre comercial observado:** Vendedor Junior

| Capacidad                                    | Alcance    | Estado              |
|----------------------------------------------|------------|---------------------|
| Acceder al dashboard                         | Propio     | ✅ Confirmado       |
| Ver métricas personales                      | Propio     | ✅ Confirmado       |
| Ver ventas propias                           | Propio     | 🔸 Asumido          |
| Registrar ventas                             | Propio     | 🔸 Asumido          |
| Consultar otros empleados                    | —          | ❌                  |
| Consultar equipos                            | —          | ❌                  |
| Crear empleados                              | —          | ❌                  |
| Modificar empleados                          | —          | ❌                  |
| Consultar estadísticas de equipo             | —          | ❌                  |
| Consultar estadísticas de rama               | —          | ❌                  |
| Consultar comisiones propias                 | Propio     | 🔸 Asumido          |
| Acceder a capacitación                       | Propio     | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                       | —          | ❌                  |
| Gestionar niveles                            | —          | ❌                  |

### 5.3. Nivel 3 — Distribuidor

> **Nombre comercial observado:** Distribuidor

| Capacidad                                    | Alcance        | Estado              |
|----------------------------------------------|----------------|---------------------|
| Acceder al dashboard                         | Propio + equipo| ✅ Confirmado       |
| Ver métricas personales                      | Propio         | ✅ Confirmado       |
| Ver métricas del equipo                      | Equipo         | ✅ Confirmado       |
| Ver ventas propias                           | Propio         | 🔸 Asumido          |
| Ver ventas del equipo                        | Equipo         | 🔸 Asumido          |
| Registrar ventas                             | Propio         | 🔸 Asumido          |
| Consultar integrantes                        | Equipo         | ✅ Confirmado       |
| Crear empleados                              | Propio equipo  | ✅ Confirmado       |
| Modificar empleados                          | Propio equipo  | 🔸 Asumido          |
| Desactivar empleados                         | Propio equipo  | ⚠️ Pendiente        |
| Cambiar supervisor                           | Propio equipo  | ⚠️ Pendiente        |
| Cambiar nivel                                | —              | ❌                  |
| Ver rankings                                 | Equipo         | 🔸 Asumido          |
| Ver estadísticas históricas                  | Equipo         | 🔸 Asumido          |
| Consultar comisiones propias                 | Propio         | 🔸 Asumido          |
| Consultar comisiones del equipo              | Equipo         | ⚠️ Pendiente        |
| Acceder a capacitación                       | Propio         | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                       | —              | ❌                  |
| Gestionar reglas de comisión                 | —              | ❌                  |

---

## 6. Diseño consolidado para Niveles 4–7

Las responsabilidades oficiales de estos niveles todavía requieren validación.
Para la versión de referencia se adopta una estructura progresiva de diseño,
sin presentarla como confirmación funcional de Royal Prestige.

El objetivo es que cada nivel superior tenga un alcance organizacional mayor, sin introducir nombres específicos de estructuras que todavía no están confirmados.

### 6.1. Nivel 4 — Blue

> **Nombre comercial observado:** Blue
>
> **Decisión de diseño:** puede reclutar/integrar empleados de Nivel 3 y operar
> sobre su estructura autorizada.

| Capacidad                                | Alcance        | Estado              |
|------------------------------------------|----------------|---------------------|
| Dashboard                                | Propio + rama  | 🔸 Asumido          |
| Métricas propias                         | Propio         | 🔸 Asumido          |
| Métricas de equipos                      | Rama           | 🔸 Asumido          |
| Ventas propias                           | Propio         | 🔸 Asumido          |
| Ventas subordinadas                      | Rama           | 🔸 Asumido          |
| Consultar empleados                      | Rama           | 🔸 Asumido          |
| Consultar equipos                        | Rama           | 🔸 Asumido          |
| Crear empleados                          | Estructura propia | 🔸 Asumido / diseño consolidado |
| Gestionar equipos                        | Rama           | ⚠️ Pendiente        |
| Ver rankings                             | Rama           | 🔸 Asumido          |
| Reportes                                 | Rama           | 🔸 Asumido          |
| Consultar comisiones propias             | Propio         | 🔸 Asumido          |
| Consultar comisiones de la rama          | Rama           | 🔸 Asumido          |
| Acceder a capacitación                   | Propio         | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                   | Rama           | ⚠️ Pendiente        |

### 6.2. Nivel 5 — Royal

> **Nombre comercial observado:** Royal
>
> **Decisión de diseño:** puede reclutar/integrar empleados de Nivel 4 y operar
> sobre su estructura autorizada.

| Capacidad                                | Alcance        | Estado              |
|------------------------------------------|----------------|---------------------|
| Dashboard                                | Propio + rama  | 🔸 Asumido          |
| Métricas propias                         | Propio         | 🔸 Asumido          |
| Métricas de equipos                      | Rama           | 🔸 Asumido          |
| Métricas comparativas                    | Rama           | 🔸 Asumido          |
| Ventas propias                           | Propio         | 🔸 Asumido          |
| Ventas subordinadas                      | Rama           | 🔸 Asumido          |
| Consultar empleados                      | Rama           | 🔸 Asumido          |
| Consultar equipos                        | Rama           | 🔸 Asumido          |
| Crear empleados                          | Estructura propia | 🔸 Asumido / diseño consolidado |
| Gestionar equipos                        | Rama           | 🔸 Asumido          |
| Ver rankings                             | Rama           | 🔸 Asumido          |
| Reportes                                 | Rama           | 🔸 Asumido          |
| Exportar reportes                        | Rama           | 🔸 Asumido          |
| Consultar comisiones propias             | Propio         | 🔸 Asumido          |
| Consultar comisiones de la rama          | Rama           | 🔸 Asumido          |
| Acceder a capacitación                   | Propio         | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                   | Rama           | ⚠️ Pendiente        |

### 6.3. Nivel 6 — Premier

> **Nombre comercial observado:** Premier
>
> **Decisión de diseño:** puede reclutar/integrar empleados de Nivel 5 y operar
> sobre su estructura autorizada.

| Capacidad                                | Alcance        | Estado              |
|------------------------------------------|----------------|---------------------|
| Dashboard                                | Propio + rama  | 🔸 Asumido          |
| Métricas propias                         | Propio         | 🔸 Asumido          |
| Métricas agregadas                       | Rama           | 🔸 Asumido          |
| Comparaciones                            | Rama           | 🔸 Asumido          |
| Ventas propias                           | Propio         | 🔸 Asumido          |
| Ventas subordinadas                      | Rama           | 🔸 Asumido          |
| Consultar empleados                      | Rama           | 🔸 Asumido          |
| Consultar equipos                        | Rama           | 🔸 Asumido          |
| Gestionar equipos                        | Rama           | 🔸 Asumido          |
| Rankings                                 | Rama           | 🔸 Asumido          |
| Reportes avanzados                       | Rama           | 🔸 Asumido          |
| Exportar reportes                        | Rama           | 🔸 Asumido          |
| Consultar comisiones propias             | Propio         | 🔸 Asumido          |
| Consultar comisiones de la rama          | Rama           | 🔸 Asumido          |
| Acceder a capacitación                   | Propio         | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                   | Rama           | ⚠️ Pendiente        |

### 6.4. Nivel 7 — Max

> **Nombre comercial observado:** Max
>
> **Decisión de diseño:** puede reclutar/integrar empleados de Nivel 6 y operar
> sobre la estructura comercial global de referencia.

Para la versión de referencia se utilizará visibilidad global para el Nivel 7.
Esto continúa siendo una decisión de diseño y no una confirmación funcional.

| Capacidad                                | Alcance    | Estado              |
|------------------------------------------|------------|---------------------|
| Dashboard                                | Global     | 🔸 Asumido          |
| Métricas propias                         | Propio     | 🔸 Asumido          |
| Métricas globales                        | Global     | 🔸 Asumido          |
| Comparaciones                            | Global     | 🔸 Asumido          |
| Ventas propias                           | Propio     | 🔸 Asumido          |
| Ventas globales                          | Global     | 🔸 Asumido          |
| Consultar empleados                      | Global     | 🔸 Asumido          |
| Consultar equipos                        | Global     | 🔸 Asumido          |
| Gestionar equipos                        | Global     | 🔸 Asumido / diseño consolidado |
| Rankings                                 | Global     | 🔸 Asumido          |
| Reportes avanzados                       | Global     | 🔸 Asumido          |
| Exportar reportes                        | Global     | 🔸 Asumido          |
| Consultar comisiones propias             | Propio     | 🔸 Asumido          |
| Consultar comisiones globales            | Global     | 🔸 Asumido          |
| Consultar reglas de comisión             | Global     | ⚠️ Pendiente        |
| Gestionar reglas de comisión             | Global     | ⚠️ Pendiente        |
| Acceder a capacitación                   | Global     | 🔸 Asumido / diseño consolidado |
| Gestionar capacitación                   | Global     | ⚠️ Pendiente        |

---

## 7. Rol administrativo

Además de los siete niveles comerciales, se contempla un rol administrativo
independiente de la jerarquía comercial como decisión de diseño.

**Rol:** `ADMIN`

Este rol no representa un nivel comercial.

Su finalidad es permitir gestionar aspectos estructurales del sistema.

**Capacidades potenciales:**

| Capacidad                            | Alcance | Estado     |
|--------------------------------------|---------|------------|
| Gestionar empleados                  | Global  | 🔸 Asumido |
| Gestionar cuentas                    | Global  | 🔸 Asumido |
| Gestionar niveles                    | Global  | 🔸 Asumido |
| Gestionar relaciones jerárquicas     | Global  | 🔸 Asumido |
| Gestionar equipos                    | Global  | 🔸 Asumido |
| Consultar estadísticas               | Global  | 🔸 Asumido |
| Consultar ventas                     | Global  | 🔸 Asumido |
| Gestionar reglas de comisión         | Global  | 🔸 Asumido |
| Consultar auditoría                  | Global  | 🔸 Asumido |
| Gestionar capacitación               | Global  | 🔸 Asumido |
| Gestionar objetivos                  | Global  | ⚠️ Pendiente |

> La existencia y alcance funcional de este rol todavía requieren validación con
> el cliente.
>
> **Estado:** 🚧 DECISIÓN DE DISEÑO PARA LA VERSIÓN DE REFERENCIA.

---

## 8. Separación entre nivel y rol

El nivel y el rol no deben tratarse como conceptos idénticos.

**Usuario comercial:**

```
Usuario
├── Rol: SELLER
└── Nivel: 3
```

**Usuario administrativo:**

```
Usuario
├── Rol: ADMIN
└── Nivel: —
```

Esto permite que las responsabilidades administrativas no dependan artificialmente de los niveles comerciales.

---

## 9. Permisos y alcance jerárquico

Un permiso debe evaluarse junto con su alcance.

Por ejemplo, el permiso:

```
employee.read
```

No significa necesariamente:

```
leer cualquier empleado
```

Puede significar:

```
leer empleados
        +
limitación al alcance organizacional permitido
```

**Conceptualmente:**

```
Usuario
   ↓
Rol / Nivel
   ↓
Permiso
   ↓
Alcance
   ↓
Recurso solicitado
   ↓
Autorización
```

---

## 10. Permisos relacionados con comisiones

Las comisiones deberán tratarse como una capacidad independiente de las ventas.

Por ejemplo:

```
sale.readOwn
```

No implica automáticamente:

```
commission.readOwn
```

La aplicación deberá determinar explícitamente qué información de comisión puede consultar cada usuario.

También deberá distinguir entre:

```
Consultar comisión
```

y:

```
Modificar reglas de comisión
```

Un vendedor puede consultar su comisión sin tener capacidad para modificar el sistema de cálculo.

---

## 11. Permisos relacionados con capacitación

La sección de capacitación deberá tratarse como un recurso independiente.

Un usuario puede tener:

```
training.read
```

Sin tener:

```
training.manage
```

**Por ejemplo:**

```
Nivel 1
    ↓
training.read
training.download
```

Mientras que:

```
ADMIN
    ↓
training.read
training.create
training.update
training.delete
training.publish
```

El seguimiento individual del progreso queda fuera del alcance actual y no se
asignará como capacidad funcional en esta versión.

---

## 12. Principio de mínimo privilegio

Los usuarios deberán disponer únicamente de los permisos necesarios para realizar las funciones correspondientes a su posición.

No se deberá conceder acceso global cuando sea suficiente un alcance limitado.

**Ejemplo:**

```
Nivel 3
    ↓
employee.read
    ↓
alcance: equipo propio
```

En lugar de:

```
Nivel 3
    ↓
employee.read
    ↓
alcance: global
```

---

## 13. Permisos vs. capacidades de interfaz

La interfaz puede utilizar la matriz para decidir qué funcionalidades mostrar.

**Por ejemplo:**

```
¿Puede crear empleados?
    ↓
Sí → mostrar botón "Nuevo vendedor"
No → ocultarlo
```

Sin embargo, ocultar el botón no es una medida de seguridad.

La operación deberá validarse nuevamente cuando llegue al servidor:

```
Usuario autenticado
        ↓
Verificar permiso
        ↓
Verificar alcance
        ↓
Validar datos
        ↓
Ejecutar operación
```

---

## 14. Evolución de la matriz

La matriz deberá poder modificarse cuando:

- Se definan las responsabilidades reales de los Niveles 4–7.
- Aparezcan nuevos roles.
- Se agreguen nuevas funcionalidades.
- Cambien las reglas del negocio.
- Se incorporen integraciones.
- Se modifique el modelo organizacional.
- Se agreguen nuevas reglas de comisión.
- Se amplíe el sistema de capacitación.

Las modificaciones relevantes deberán quedar registradas en el historial del documento y, cuando corresponda, en `architecture-decisions.md`.

---

## 15. Relación con otros documentos

La matriz de permisos debe mantenerse alineada con:

- `docs/product/requirements.md`
- `docs/product/open-questions.md`
- `docs/domain/organizational-model.md`
- `docs/domain/business-rules.md`

Posteriormente servirá como referencia para:

- `docs/architecture/authorization.md`

Y para definir:

- Casos de uso.
- Servicios de aplicación.
- Protección de rutas.
- Server Actions / API.
- Pruebas de autorización.
- Reglas de acceso a datos.

---

## 16. Casos de prueba de autorización previstos

La matriz deberá traducirse posteriormente a pruebas automatizadas.

**Nivel 1:**

```
✓ puede consultar sus estadísticas
✓ puede consultar su información de comisión
✓ puede acceder a capacitación
✓ puede descargar materiales autorizados
✗ no puede crear empleados
✗ no puede consultar otro equipo
✗ no puede modificar reglas de comisión
```

**Nivel 2:**

```
✓ puede consultar sus estadísticas
✓ puede consultar su información de comisión
✗ no puede crear empleados
✗ no puede consultar estadísticas de otro equipo
```

**Nivel 3:**

```
✓ puede consultar sus estadísticas
✓ puede consultar estadísticas de su equipo
✓ puede consultar información de miembros de su equipo
✓ puede crear un empleado para su estructura
✗ no puede consultar otro equipo fuera de su alcance
✗ no puede modificar reglas globales de comisión
```

**Nivel 7:**

```
✓ puede consultar información global
✓ puede consultar múltiples equipos
✓ puede consultar estadísticas agregadas
✓ puede consultar información global de ventas
✓ puede consultar información global de comisiones
⚠️ capacidades administrativas adicionales pendientes
```

**Administrador:**

```
✓ puede gestionar empleados
✓ puede gestionar equipos
✓ puede gestionar niveles
✓ puede consultar auditoría
✓ puede gestionar capacitación
✓ puede gestionar reglas de comisión
```

Los casos definitivos deberán derivarse de la matriz aprobada.

---

## 17. Estado del documento

La matriz actual combina:

- Requisitos confirmados.
- Información observada.
- Decisiones de diseño.
- Supuestos necesarios para la versión de referencia.
- Capacidades pendientes de definición.

Las reglas correspondientes a los Niveles 4–7 son deliberadamente provisionales.

Cuando se obtenga información oficial del cliente, se deberá actualizar esta matriz y revisar cualquier:

- Regla de negocio.
- Caso de uso.
- Prueba.
- Servicio.
- Componente.
- Restricción de acceso.

que resulte afectado.

---

## 18. Historial de cambios

| Fecha      | Versión | Cambio                                                                                          |
|------------|---------|-------------------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial de la matriz de permisos.                                                      |
| 01/09/2026 | 0.2     | Incorporación de capacitación, comisiones, nomenclatura observada y separación explícita entre permisos y alcance. |
| 03/09/2026 | 0.3     | Consolidación de capacidades de niveles, rol administrativo, capacitación y flujo inicial de ventas. |
| 03/09/2026 | 0.4     | Sincronización global de estados y decisiones de la matriz. |
| 03/09/2026 | 0.5     | Exclusión del seguimiento individual de capacitación del alcance actual. |
| 07/09/2026 | 0.6     | Incorporación de permisos `sale.approve`, `sale.reject` (revisión de ventas) y `catalog.read`, `catalog.create`, `catalog.update` (catálogo de productos). |
| 29/09/2026 | 0.7     | Corrección de numeración de la sección 4: se elimina la duplicación de §4.6/§4.7/§4.8. Las secciones de Clientes, Visitas y Referidos (Phase 10) conservan §4.6–§4.8; las secciones posteriores se renumeran a §4.9–§4.14. Se actualizan las referencias de trazabilidad en código y documentación. |
| 29/09/2026 | 0.8     | §4.9: se documenta el estado de implementación de los permisos de estadísticas y reporting. Comparaciones, rankings y generación/exportación de reportes quedan diferidos (Q48–Q54); la exportación CSV no se implementa por ahora. |
