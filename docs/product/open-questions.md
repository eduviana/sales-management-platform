# Preguntas abiertas

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Preguntas abiertas  
**Estado:** En relevamiento  
**Versión:** 0.2  
**Última actualización:** 01/09/2026

---

Este documento contiene las preguntas de negocio y técnicas que deberán responderse durante el relevamiento.

Las preguntas mantienen una numeración permanente para facilitar la trazabilidad entre reuniones, requisitos, reglas de negocio, decisiones de arquitectura, casos de uso y pruebas.

---

## 1. Estructura organizacional

### 1.1. Niveles

**01.** ¿Cuáles son los nombres exactos de los 7 niveles?

**02.** ¿Cuáles son las responsabilidades específicas de cada nivel?

**03.** ¿Qué criterios son necesarios para pasar de un nivel a otro?

**04.** ¿El ascenso se determina mediante:

- Antigüedad dentro de la empresa.
- Cantidad de ventas.
- Volumen de ventas.
- Facturación.
- Rendimiento del equipo.
- Una combinación de factores.
- Aprobación manual.
- Otro criterio.

**05.** ¿Un empleado puede descender de nivel?

**06.** ¿El cambio de nivel es realizado manualmente por un administrador o automáticamente por el sistema?

**07.** ¿Es necesario conservar un historial de niveles del empleado?

**08.** ¿Los nombres comerciales de los niveles pueden cambiar con el tiempo?

**09.** ¿El nombre comercial de un nivel es independiente de su posición dentro de la jerarquía?

---

## 2. Jerarquía

**10.** ¿Cada empleado tiene exactamente un supervisor?

**11.** ¿Un empleado puede tener más de un supervisor?

**12.** ¿Un vendedor puede cambiar de equipo?

**13.** ¿Qué sucede con los empleados cuando cambia su supervisor?

**14.** ¿Qué sucede con los subordinados cuando un supervisor abandona la empresa?

**15.** ¿Un empleado de Nivel 3 puede supervisar únicamente empleados de Nivel 1 y 2 o puede supervisar empleados de otros niveles?

**16.** ¿Las relaciones organizacionales son estrictamente jerárquicas?

**17.** ¿Un usuario de nivel superior puede consultar a todos los empleados subordinados que se encuentran debajo de él en la jerarquía?

**18.** ¿Un usuario de nivel superior puede consultar múltiples equipos simultáneamente?

**19.** ¿Un equipo constituye una entidad propia dentro del negocio o simplemente representa un conjunto de empleados asociados a un supervisor?

---

## 3. Cuentas de usuario

**20.** ¿Quién es responsable de crear las cuentas?

**21.** ¿Un usuario de Nivel 3 puede realmente crear cuentas directamente, tal como se indicó inicialmente?

**22.** ¿Los usuarios de Nivel 3 pueden crear cuentas únicamente para personas que pertenecerán a su propio equipo?

**23.** ¿Qué información es obligatoria al crear un nuevo empleado?

**24.** ¿Quién asigna el nivel inicial del empleado?

**25.** ¿Quién asigna el supervisor del empleado?

**26.** ¿El nuevo empleado recibe una contraseña temporal?

**27.** ¿El empleado debe cambiar la contraseña en el primer inicio de sesión?

**28.** ¿Un usuario de Nivel 3 puede desactivar a un empleado?

**29.** ¿Puede modificar la información de un empleado después de crear su cuenta?

**30.** ¿Qué sucede con la cuenta cuando el empleado abandona la empresa?

**31.** ¿Las cuentas inactivas deben mantenerse visibles dentro de las estadísticas históricas?

---

## 4. Ventas

**32.** ¿Qué se considera exactamente una venta dentro del sistema?

**33.** ¿Las ventas se registran manualmente?

**34.** ¿Las ventas se importan desde otro sistema?

**35.** ¿Royal Prestige ya posee un sistema del cual esta aplicación deberá obtener las ventas?

**36.** ¿Cada venta contiene información como:

- Cliente.
- Vendedor.
- Producto.
- Cantidad.
- Precio.
- Fecha.
- Información de pago.
- Estado.
- Comisión.

**37.** ¿Una venta puede modificarse después de ser registrada?

**38.** ¿Una venta puede cancelarse?

**39.** ¿Existen devoluciones o anulaciones de ventas?

**40.** ¿Las ventas se atribuyen exclusivamente al vendedor que las realizó?

**41.** ¿Una venta puede involucrar a más de un empleado?

**42.** ¿Las ventas son utilizadas para determinar el ascenso de nivel?

---

## 5. Productos

**43.** ¿La aplicación deberá contener un catálogo de productos?

**44.** ¿Los productos serán gestionados dentro de esta aplicación o desde otro sistema?

**45.** ¿Los productos serán utilizados únicamente para reporting o los empleados deberán interactuar directamente con ellos?

**46.** ¿Se necesitan categorías de productos?

**47.** ¿Las estadísticas de ventas deberán poder consultarse por producto o categoría?

---

## 6. Rendimiento y estadísticas

**48.** ¿Qué métricas debe poder consultar un vendedor individual?

**49.** ¿Qué métricas debe poder consultar un supervisor de equipo?

**50.** ¿Qué períodos de tiempo deben estar disponibles?

Por ejemplo:

- Hoy.
- Semana actual.
- Mes actual.
- Mes anterior.
- Año actual.
- Rango de fechas personalizado.

**51.** ¿Los usuarios deben poder comparar períodos?

**52.** ¿Los usuarios deben poder comparar el rendimiento de diferentes empleados?

**53.** ¿El sistema debe mostrar rankings?

**54.** ¿Un supervisor debe poder identificar miembros de su equipo con bajo rendimiento?

**55.** ¿Existen objetivos oficiales de ventas?

**56.** ¿Los objetivos son individuales, por equipo o ambos?

**57.** ¿Los objetivos son diferentes para cada nivel?

**58.** ¿El sistema debe calcular el porcentaje de cumplimiento de objetivos?

---

## 7. Niveles 4–7

Esta es una de las áreas más importantes que todavía no está definida.

**59.** ¿Qué representa exactamente cada uno de los Niveles 4, 5, 6 y 7?

**60.** ¿Cada nivel administra una estructura organizacional mayor?

**61.** ¿Cada nivel tiene visibilidad sobre los equipos subordinados?

**62.** ¿Los Niveles 4–7 pueden crear cuentas?

**63.** ¿Los Niveles 4–7 pueden modificar la estructura de equipos?

**64.** ¿Qué estadísticas debe visualizar cada nivel?

**65.** ¿Los niveles superiores pueden consultar estadísticas agregadas de múltiples equipos?

**66.** ¿Pueden profundizar desde una métrica agregada hasta equipos y empleados individuales?

**67.** ¿Existen métricas exclusivas para los niveles superiores?

---

## 8. Comisiones

**68.** ¿La aplicación debe calcular las comisiones?

**69.** ¿Las comisiones dependen de la antigüedad del vendedor?

**70.** ¿Las comisiones dependen del volumen de ventas?

**71.** ¿Las comisiones dependen del nivel del empleado?

**72.** ¿Los supervisores reciben comisiones sobre las ventas de sus equipos?

**73.** ¿La comisión se calcula sobre el importe total de la venta o sobre otra base?

**74.** ¿Las reglas de comisión son fijas o configurables?

**75.** ¿Los porcentajes de comisión observados para Nivel 1 son exactamente los siguientes?

| Antigüedad  | Porcentaje observado |
|-------------|----------------------|
| Mes 1       | 10 %                 |
| Mes 2       | 15 %                 |
| Mes 3       | 30 %                 |
| Mes 4       | Pendiente            |
| Mes 5       | Pendiente            |
| Mes 6–12    | 45 %–60 %            |

**76.** ¿Qué porcentaje corresponde exactamente al mes 4?

**77.** ¿Qué porcentaje corresponde exactamente al mes 5?

**78.** ¿Cómo evoluciona exactamente el porcentaje entre los meses 6 y 12?

**79.** ¿Qué porcentaje corresponde después del mes 12?

**80.** ¿La antigüedad utilizada para calcular una comisión se determina según la fecha de ingreso original del empleado?

**81.** ¿Qué ocurre con la comisión cuando un empleado asciende de nivel?

**82.** ¿Las reglas de comisión cambian cuando el vendedor alcanza un nuevo nivel?

**83.** ¿Existen condiciones adicionales para acceder a cada porcentaje de comisión?

**84.** ¿Qué ocurre con la comisión cuando una venta es cancelada o devuelta?

**85.** ¿Los cálculos históricos de comisión deben permanecer sin cambios cuando se modifiquen las reglas del negocio?

**86.** ¿La comisión es calculada por esta aplicación o proviene de otro sistema?

---

## 9. Administración

**87.** ¿Existe un rol de administrador global?

**88.** ¿Quién administra a los empleados que se encuentran fuera de la jerarquía comercial?

**89.** ¿Quién puede modificar el nivel de un empleado?

**90.** ¿Quién puede modificar el supervisor de un empleado?

**91.** ¿Quién puede desactivar cuentas?

**92.** ¿Quién puede consultar la totalidad de la organización?

**93.** ¿La empresa necesita un panel administrativo?

**94.** ¿La empresa necesita realizar búsquedas de empleados en toda la organización?

---

## 10. Auditoría e historial

**95.** ¿Qué acciones deben quedar registradas?

**96.** ¿La empresa necesita saber quién creó una cuenta de empleado?

**97.** ¿La empresa necesita saber quién modificó el nivel de un empleado?

**98.** ¿Es necesario conservar el historial de la estructura organizacional?

**99.** ¿Los reportes históricos deben poder reproducirse según la estructura que existía en un momento determinado?

---

## 11. Autenticación y seguridad

**100.** ¿Cómo se autentican los empleados?

**101.** ¿Utilizan direcciones de correo corporativas?

**102.** ¿Debe permitirse autenticación mediante Google o Microsoft?

**103.** ¿Se requiere autenticación de dos factores (2FA)?

**104.** ¿Cómo debe funcionar la recuperación de contraseña?

**105.** ¿La empresa posee requisitos o políticas de seguridad que deban cumplirse?

**106.** ¿Existen restricciones sobre sesiones simultáneas?

---

## 12. Despliegue e infraestructura

**107.** ¿Dónde se alojará la aplicación?

**108.** ¿Royal Prestige ya posee infraestructura propia?

**109.** ¿Dónde se alojará la base de datos?

**110.** ¿Está permitido utilizar proveedores externos de infraestructura cloud?

**111.** ¿Existen requisitos de backup?

**112.** ¿Existen requisitos de retención de datos?

**113.** ¿La empresa requiere ambientes separados de desarrollo, staging y producción?

---

## 13. Integraciones

**114.** ¿Royal Prestige ya posee sistemas que contienen información de:

- Empleados.
- Ventas.
- Productos.
- Clientes.
- Comisiones.

**115.** ¿La aplicación necesita integrarse con algún software existente?

**116.** ¿Existen APIs disponibles?

**117.** ¿Se requiere sincronización de datos?

**118.** ¿Con qué frecuencia deben actualizarse los datos sincronizados?

---

## 14. Capacitación

**119.** ¿La sección de capacitación está destinada exclusivamente a vendedores nuevos de Nivel 1?

**120.** ¿Otros niveles también deben tener acceso a contenido de capacitación?

**121.** ¿La capacitación está organizada por cursos, módulos, categorías o algún otro criterio?

**122.** ¿Los documentos PDF deben poder descargarse, visualizarse o ambas opciones?

**123.** ¿Los videos serán archivos almacenados por la empresa o enlaces a una plataforma externa?

**124.** ¿Qué plataforma se utilizará para alojar los videos?

**125.** ¿Los materiales de capacitación deben poder clasificarse o etiquetarse?

**126.** ¿Los materiales deben tener un estado de publicación?

**127.** ¿Quién puede crear nuevos materiales?

**128.** ¿Quién puede modificar o eliminar materiales existentes?

**129.** ¿Los supervisores pueden gestionar materiales de capacitación?

**130.** ¿Es necesario registrar qué materiales consultó cada vendedor?

**131.** ¿Es necesario registrar el progreso de un vendedor dentro de una capacitación?

**132.** ¿Es necesario marcar una capacitación como completada?

**133.** ¿Existen capacitaciones obligatorias?

**134.** ¿Es necesario realizar evaluaciones o cuestionarios?

**135.** ¿El contenido de capacitación cambia según el nivel del empleado?

**136.** ¿Debe conservarse un historial del progreso de capacitación?

---

## 15. Decisiones técnicas pendientes

Las siguientes decisiones dependen de las respuestas obtenidas durante el relevamiento funcional:

- Proveedor de autenticación.
- Plataforma de despliegue.
- Alojamiento de la base de datos.
- Modelo exacto de autorización.
- Estrategia de incorporación de datos de ventas.
- Arquitectura de reporting.
- Sistema de notificaciones.
- Requisitos de almacenamiento de archivos y documentos.
- Estrategia de almacenamiento de videos.
- Implementación del sistema de auditoría.
- Necesidad de procesos en segundo plano o colas.
- Integraciones externas.
- Estrategia de cálculo de comisiones.
- Modelo de reglas de comisión.
- Estrategia de gestión de contenidos de capacitación.
- Seguimiento del progreso de capacitación.

---

## 16. Registro de respuestas

Esta sección deberá utilizarse para registrar las respuestas obtenidas durante las reuniones con el cliente.

La numeración de las preguntas es permanente para facilitar la trazabilidad.

### 16.1. Estados posibles

- **PENDIENTE** — Todavía no respondida.
- **RESPONDIDA** — Existe una respuesta confirmada.
- **VALIDAR** — Existe una respuesta, pero requiere confirmación.
- **DESCARTADA** — Se determinó que no aplica.

### 16.2. Registro

| Nº    | Estado    | Respuesta   | Fecha   | Fuente   |
|-------|-----------|-------------|---------|----------|
| 01    | PENDIENTE | —           | —       | —        |
| 02    | PENDIENTE | —           | —       | —        |
| 03    | PENDIENTE | —           | —       | —        |
| 04    | PENDIENTE | —           | —       | —        |
| 05    | PENDIENTE | —           | —       | —        |
| 06    | PENDIENTE | —           | —       | —        |
| 07    | PENDIENTE | —           | —       | —        |
| ...   | ...       | ...         | ...     | ...      |
| 136   | PENDIENTE | —           | —       | —        |

El registro deberá actualizarse a medida que avance el relevamiento.

---

## 17. Notas de reuniones

### 17.1. Reunión — Conversación inicial informal

**✅ Información confirmada:**

- Aplicación web de uso interno.
- La organización posee 7 niveles.
- Los usuarios de Nivel 3 administran un equipo de ventas.
- Los usuarios de Nivel 3 necesitan crear cuentas para nuevos empleados.
- Los usuarios de Nivel 3 necesitan consultar información y estadísticas de su equipo.
- Los usuarios de Nivel 3 también necesitan consultar sus propias estadísticas.
- Los niveles inferiores necesitan consultar estadísticas personales.
- Se requieren gráficos y estadísticas.
- Los vendedores nuevos de Nivel 1 deben disponer de una sección de capacitación.
- La capacitación debe contemplar material en formato PDF.
- La capacitación debe contemplar videos.

**🔎 Información observada durante el relevamiento:**

Durante la reunión se observó una representación de los niveles con la siguiente nomenclatura:

| Nivel interno | Nombre observado |
|---------------|------------------|
| Nivel 1       | Vendedor         |
| Nivel 2       | Vendedor Junior  |
| Nivel 3       | Distribuidor     |
| Nivel 4       | Blue             |
| Nivel 5       | Royal            |
| Nivel 6       | Premier          |
| Nivel 7       | Max              |

Los nombres anteriores se consideran observados y todavía deben ser validados formalmente.

También se observó una estructura de comisiones para vendedores nuevos de Nivel 1:

| Antigüedad  | Comisión observada |
|-------------|--------------------|
| Mes 1       | 10 %               |
| Mes 2       | 15 %               |
| Mes 3       | 30 %               |
| Mes 4       | Pendiente          |
| Mes 5       | Pendiente          |
| Mes 6–12    | 45 %–60 %          |

Los porcentajes anteriores todavía deben validarse y completarse.

**⚠️ Aún sin definir:**

- Responsabilidades exactas de los Niveles 4–7.
- Matriz exacta de permisos.
- Modelo exacto de ventas.
- Origen de los datos de ventas.
- Reglas definitivas de comisiones.
- Objetivos y metas.
- Roles administrativos.
- Requisitos de historial organizacional.
- Requisitos de auditoría.
- Requisitos de autenticación.
- Requisitos de integración.
- Funcionamiento exacto de la capacitación.
- Administración de los materiales de capacitación.
- Estrategia de almacenamiento de documentos.
- Estrategia de alojamiento de videos.
- Seguimiento del progreso de capacitación.

---

## 18. Historial de cambios

| Fecha      | Versión | Cambio                                                                              |
|------------|---------|-------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial del documento a partir del relevamiento informal.                  |
| 01/09/2026 | 0.2     | Incorporación de nomenclatura observada, comisiones y requisitos de capacitación.   |
