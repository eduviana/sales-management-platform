# Modelo de datos

**Estado:** 🚧 DECISIÓN DE DISEÑO  
**Versión:** 0.1  
**Última actualización:** 2026-09-01

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
├── TrainingContent
└── TrainingProgress
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
firstName
lastName
...
joinedAt
currentLevelId
supervisorId
status
createdAt
updatedAt
```

**Responsabilidades:**

`Employee` representa:

- Identidad de la persona dentro de la organización.
- Fecha de ingreso.
- Estado dentro de la organización.
- Nivel actual.
- Superior directo actual.

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

Las consultas sobre ramas completas podrán resolverse posteriormente mediante consultas recursivas de PostgreSQL y una capa de dominio específica.

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
employeeId
saleDate
status
totalAmount
...
```

La venta pertenece al empleado que la realizó.

**Todavía está ❓ PENDIENTE determinar:**

- Quién registra la venta.
- Si se registra manualmente.
- Si se importa desde otro sistema.
- Si existe una integración externa.
- Qué estados puede tener.
- Qué información comercial debe conservarse.
- Cuándo una venta se considera válida para estadísticas.
- Cuándo una venta genera comisión.

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

El modelo exacto dependerá de cómo Royal Prestige gestione actualmente su catálogo y sus operaciones comerciales.

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

**Todavía está ❓ PENDIENTE determinar si el sistema tendrá:**

- Catálogo completo.
- Catálogo reducido.
- Precios históricos.
- Productos descontinuados.
- Variantes.
- Categorías.
- Importación desde otro sistema.

Por lo tanto, no se debe diseñar todavía un catálogo excesivamente complejo.

---

## 14. Comisiones

Las comisiones deben modelarse como un dominio independiente de la jerarquía.

La información disponible actualmente indica una progresión observada para vendedores de nivel 1:

| Antigüedad  | Comisión observada   |
|-------------|----------------------|
| Mes 1       | 10 %                 |
| Mes 2       | 15 %                 |
| Mes 3       | 30 %                 |
| Mes 4       | Pendiente            |
| Mes 5       | Pendiente            |
| Mes 6–12    | 40 %–60 %            |

Estos valores requieren validación.

---

## 15. CommissionRule

No se deben hardcodear los porcentajes directamente en el código de la aplicación.

Conceptualmente se propone una entidad como:

```
CommissionRule
--------------
id
levelId
fromMonth
toMonth
percentage
effectiveFrom
effectiveTo
```

**Ejemplo conceptual:**

```
Nivel 1
Mes 1 → 10 %

Nivel 1
Mes 2 → 15 %

Nivel 1
Mes 3 → 30 %

...
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

---

## 16. Comisión y nivel

No debe asumirse todavía que la comisión depende exclusivamente del nivel actual.

El modelo deberá poder representar al menos:

```
Nivel
+
Antigüedad
+
Regla de comisión vigente
```

Esto es importante porque el sistema ya presenta evidencia de que antigüedad y nivel son variables independientes.

La fórmula definitiva para calcular una comisión queda ❓ PENDIENTE.

---

## 17. Formación

Se conoce que los nuevos vendedores de nivel 1 deberán disponer de material de capacitación.

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

Y posteriormente incorporar:

```
TrainingProgress
----------------
id
employeeId
trainingContentId
completedAt
progress
```

Sin embargo, todavía no está confirmado si el sistema tendrá cursos, módulos, progreso, evaluaciones u otro mecanismo.

Por esta razón, formación se mantiene como modelo conceptual pendiente de definición funcional.

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

## 19. Estado del modelo

| Entidad / concepto       | Estado                          | Observación                          |
|--------------------------|---------------------------------|--------------------------------------|
| Employee                 | ✅ CONFIRMADO                   | Concepto central                     |
| Level                    | ✅ CONFIRMADO                   | Existen 7 niveles                    |
| Nombres comerciales      | 🔎 OBSERVADO                    | Deben validarse                      |
| EmployeeLevelHistory     | 🚧 DECISIÓN DE DISEÑO           | Se conserva historial                |
| Supervisor hierarchy     | ✅ CONFIRMADO / 🔎 OBSERVADO    | Existe estructura jerárquica         |
| Adjacency List           | 🚧 DECISIÓN DE DISEÑO           | Estrategia inicial                   |
| UserAccount              | ✅ CONFIRMADO                   | Se separa de Employee                |
| Sale                     | ❓ PENDIENTE                    | Falta conocer origen y proceso       |
| SaleItem                 | ❓ PENDIENTE                    | Depende del modelo comercial         |
| Product                  | ❓ PENDIENTE                    | Falta conocer catálogo               |
| CommissionRule           | 🚧 DECISIÓN DE DISEÑO           | Reglas configurables y temporales    |
| Formación                | ✅ CONFIRMADO                   | Debe existir para nivel 1            |
| TrainingProgress         | ❓ PENDIENTE                    | Funcionalidad todavía desconocida    |

---

## 20. Información que todavía no debe convertirse en restricciones de base de datos

Hasta recibir confirmación de la empresa, no deben establecerse como restricciones rígidas:

- Tiempos mínimos para ascender.
- Criterios de promoción.
- Relaciones exactas entre niveles 4–7.
- Cantidad máxima de subordinados.
- Obligación de que determinados niveles tengan equipo.
- Porcentaje definitivo de comisión por antigüedad.
- Fórmula final para calcular comisiones.
- Origen de las ventas.
- Estructura definitiva del catálogo.
- Funcionamiento exacto de la capacitación.

El modelo debe permitir representar estos escenarios posteriormente sin requerir una reestructuración completa de la base.

---

## 21. Próximo paso

El siguiente nivel de detalle será transformar este modelo conceptual en un modelo relacional, definiendo:

- Claves primarias.
- Claves foráneas.
- Cardinalidades.
- Restricciones.
- Índices.
- Unicidad.
- Integridad temporal.
- Estrategia para consultas jerárquicas.
- Estrategia de auditoría.
- Entidades definitivas del esquema Prisma.

Antes de llegar a ese punto deberá reducirse la cantidad de incógnitas de `open-questions.md`, especialmente en ventas, promociones, niveles 4–7 y comisiones.
