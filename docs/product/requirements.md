# Requisitos del sistema

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Tipo:** Aplicación web de uso interno  
**Estado:** En relevamiento  
**Versión:** 0.2  
**Última actualización:** 01/09/2026

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

> **Nota:** Los comportamientos específicos de los Niveles 4 a 7 todavía no están definidos. La nomenclatura comercial asociada a cada nivel también deberá validarse antes de considerarse definitiva.

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

> **Pendiente:** Confirmar oficialmente los nombres, responsabilidades, permisos y comportamiento específico de los siete niveles.

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

Durante el relevamiento inicial se observó una estructura de comisión progresiva para vendedores nuevos de Nivel 1, relacionada con su antigüedad.

**Información observada:**

| Antigüedad  | Comisión observada   |
|-------------|----------------------|
| Mes 1       | 10 %                 |
| Mes 2       | 15 %                 |
| Mes 3       | 30 %                 |
| Mes 4       | Pendiente            |
| Mes 5       | Pendiente            |
| Mes 6 a 12  | Entre 45 % y 60 %   |

Estos valores todavía deben ser validados con la empresa.

El sistema deberá diseñarse de forma que las reglas de comisión puedan evolucionar sin necesidad de modificar estructuralmente toda la aplicación.

**Aspectos pendientes:**

- Porcentaje exacto correspondiente a los meses 4 y 5.
- Progresión exacta entre los meses 6 y 12.
- Porcentaje aplicable después del mes 12.
- Base sobre la cual se calcula la comisión.
- Condiciones adicionales para acceder a cada porcentaje.
- Posible relación entre comisión y nivel.
- Tratamiento de cambios de nivel.
- Tratamiento de devoluciones o anulaciones.
- Si el sistema calcula la comisión o recibe el valor desde otro sistema.

### 2.8. Capacitación

Los vendedores nuevos de Nivel 1 deberán disponer de una sección de capacitación dentro de la aplicación.

La sección deberá permitir consultar material de formación proporcionado por la empresa.

Actualmente se identifican los siguientes tipos de contenido:

- Archivos PDF.
- Videos de capacitación.
- Otros materiales que puedan incorporarse posteriormente.

La sección de capacitación deberá estar integrada en la navegación principal de la aplicación, por ejemplo mediante una opción del menú lateral.

**Alcance inicial conocido:**

```
Nivel 1
└── Capacitación
    ├── Documentos PDF
    └── Videos
```

**Funcionalidades potenciales:**

Dependiendo de los requisitos definitivos, la sección podría incluir:

- Visualización de materiales.
- Descarga de documentos.
- Reproducción de videos.
- Organización por módulos o categorías.
- Seguimiento del progreso.
- Registro de materiales completados.
- Capacitaciones obligatorias.

> **Pendiente:** Definir el alcance exacto de la capacitación, quién puede administrarla y si otros niveles también deben acceder.

---

## 3. Áreas funcionales

### 3.1. Autenticación

El sistema deberá contemplar:

- Inicio de sesión.
- Gestión de sesiones.
- Cierre de sesión.
- Recuperación de cuenta.

> **Pendiente:** Definir proveedor y estrategia de autenticación.

### 3.2. Panel principal

El panel principal deberá adaptarse a la posición y los permisos del usuario.

Dependiendo del usuario, podrá incluir:

- Rendimiento personal.
- Métricas de ventas.
- Gráficos.
- Rendimiento del equipo.
- Resúmenes de equipos.
- Objetivos y metas.
- Indicadores de evolución.
- Información relacionada con comisiones.

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

Actualmente se desconoce cómo ingresará esta información al sistema.

**Posibles escenarios:**

- Las ventas se registran manualmente.
- Las ventas se importan desde otro sistema.
- Las ventas se sincronizan mediante una API externa.
- El sistema recibe únicamente información resumida.
- Existe otra fuente de datos todavía no identificada.

> **Pendiente crítico:** Determinar el origen de los datos de ventas antes de definir definitivamente el modelo de datos.

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

La implementación final dependerá de si las comisiones son calculadas internamente o provienen de un sistema externo.

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

Estas funcionalidades adicionales no forman parte todavía de los requisitos confirmados.

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

Las operaciones relevantes del negocio deberían poder ser rastreadas.

**Entre las acciones potencialmente auditables se encuentran:**

- Creación de cuentas.
- Modificación de información de empleados.
- Cambios de nivel.
- Cambios de supervisor.
- Cambios de equipo.
- Desactivación de cuentas.
- Modificaciones relacionadas con comisiones.
- Administración de materiales de capacitación.
- Acciones administrativas relevantes.

> **Pendiente:** Determinar exactamente qué eventos deberán ser auditados y durante cuánto tiempo deberán conservarse.

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

- Responsabilidades de los Niveles 4 a 7.
- Matriz definitiva de permisos.
- Modelo definitivo de ventas.
- Origen de los datos de ventas.
- Reglas definitivas de comisiones.
- Objetivos y metas.
- Roles administrativos.
- Historial organizacional.
- Auditoría.
- Integraciones externas.
- Requisitos exactos de autenticación.
- Requisitos detallados de capacitación.
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
| Capacitación para Nivel 1                | 🔎 Observado        |
| Materiales PDF                           | 🔎 Observado        |
| Videos de capacitación                   | 🔎 Observado        |
| Comportamiento Nivel 4                   | ⚠️ Pendiente        |
| Comportamiento Nivel 5                   | ⚠️ Pendiente        |
| Comportamiento Nivel 6                   | ⚠️ Pendiente        |
| Comportamiento Nivel 7                   | ⚠️ Pendiente        |
| Origen de los datos de ventas            | ⚠️ Pendiente        |
| Reglas definitivas de comisiones         | ⚠️ Pendiente        |
| Objetivos y metas                        | ⚠️ Pendiente        |
| Roles administrativos                    | ⚠️ Pendiente        |
| Requisitos de auditoría                  | ⚠️ Pendiente        |
| Mecanismo de autenticación               | ⚠️ Pendiente        |
| Estrategia de almacenamiento multimedia  | ⚠️ Pendiente        |
| Integraciones externas                   | ⚠️ Pendiente        |
| Seguimiento de capacitación              | ⚠️ Pendiente        |

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
