# Preguntas abiertas

**Proyecto:** Royal Prestige — Plataforma de Gestión de Ventas  
**Documento:** Preguntas abiertas  
**Estado:** En consolidación  
**Versión:** 0.5  
**Última actualización:** 03/09/2026

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

> **Estado:** ✅ RESPONDIDA — Sí. Las cuentas nuevas se crean con una contraseña
> temporal, almacenada únicamente como hash, con cambio obligatorio en el primer
> inicio de sesión.

**27.** ¿El empleado debe cambiar la contraseña en el primer inicio de sesión?

> **Estado:** ✅ RESPONDIDA — Sí. Hasta completar el cambio no puede continuar
> con el uso normal de la aplicación.

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

**36.1.** ¿El documento del cliente es obligatorio para facturar o para algún
medio de pago específico?

**36.2.** ¿Qué tipos de comprobante y datos fiscales devuelve H&Y Cite?

**36.3.** ¿Qué estados y referencias de pago deben sincronizarse desde H&Y Cite?

**36.4.** ¿Los últimos cuatro dígitos y la marca de tarjeta tienen una utilidad
operativa real para los usuarios internos?

**36.5.** ¿Qué estados y eventos forman parte del seguimiento de entrega?

**36.6.** ¿Se habilitarán ventas directas sin visita en una etapa posterior?

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
| Regla inicial (anterior, 🔄 REEMPLAZADA) | 50 %                 |

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

- Proveedor de autenticación y correo.
- Detalles operativos de sesiones, recuperación y 2FA.
- PostgreSQL remoto/cloud y sus restricciones.
- Detalles físicos del modelo de autorización.
- Arquitectura de reporting.
- Sistema de notificaciones.
- Requisitos de almacenamiento de archivos y documentos.
- Estrategia de almacenamiento de videos.
- Implementación del sistema de auditoría.
- Necesidad de procesos en segundo plano o colas.
- Diseño de futuras integraciones externas.
- Fórmula y base definitiva del cálculo de comisiones.
- Casos particulares de reglas de comisión.
- Detalles operativos de gestión de contenidos de capacitación.

---

## 16. Registro de respuestas

Esta sección deberá utilizarse para registrar las respuestas obtenidas durante las reuniones con el cliente.

La numeración de las preguntas es permanente para facilitar la trazabilidad.

### 16.1. Estados posibles

- **PENDIENTE** — Todavía no respondida.
- **RESPONDIDA** — Existe una respuesta confirmada.
- **VALIDAR** — Existe una respuesta, pero requiere confirmación.
- **DESCARTADA** — Se determinó que no aplica.

### 16.2. Registro inicial (REEMPLAZADO)

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

Este registro conserva el estado inicial de las preguntas y queda reemplazado
por el registro consolidado de la sección 16.3.

### 16.3. Registro consolidado de resolución

La siguiente tabla conserva la numeración permanente y distingue respuestas
confirmadas de decisiones de diseño, validaciones pendientes y cuestiones aún no
resueltas. `RESPONDIDA` no significa necesariamente confirmación de Royal
Prestige: la fuente indicada identifica el tipo de resolución.

| Nº | Estado | Resolución / fuente |
|---:|---|---|
| 01 | VALIDAR | Nombres observados adoptados como referencia de diseño; falta validación oficial. |
| 02 | RESPONDIDA | Responsabilidades consolidadas como diseño; validación oficial pendiente. |
| 03 | PENDIENTE | Criterios exactos de promoción. |
| 04 | PENDIENTE | Factores exactos de promoción. |
| 05 | RESPONDIDA | Se contemplan promociones y demociones explícitas, no automáticas. |
| 06 | RESPONDIDA | La decisión final de cambio de nivel la toma una persona con autoridad. |
| 07 | RESPONDIDA | Se conserva historial de nivel y organizacional. |
| 08 | PENDIENTE | No se definió la política futura de cambio de nombres comerciales. |
| 09 | RESPONDIDA | El nombre comercial se mantiene separado del identificador interno. |
| 10 | RESPONDIDA | Como máximo un supervisor directo activo por empleado. |
| 11 | RESPONDIDA | No se permiten múltiples supervisores en la versión consolidada. |
| 12 | RESPONDIDA | Los cambios de estructura/equipo son explícitos. |
| 13 | RESPONDIDA | El cambio de supervisor conserva historial; no hay reasignación implícita. |
| 14 | RESPONDIDA | Los subordinados no se reasignan automáticamente al salir un supervisor. |
| 15 | RESPONDIDA | Escalera normal: N3→N1, N4→N3, N5→N4, N6→N5, N7→N6. |
| 16 | VALIDAR | Se utiliza una jerarquía comercial normal; las excepciones requieren definición. |
| 17 | RESPONDIDA | La visibilidad de rama depende de autorización y scope. |
| 18 | PENDIENTE | Uso simultáneo de múltiples equipos por niveles superiores. |
| 19 | VALIDAR | Resolución inicial derivada de jerarquía; identidad funcional de Team pendiente. |
| 20 | RESPONDIDA | N3 y ADMIN pueden crear/integrar cuentas según su alcance de diseño. |
| 21 | RESPONDIDA | N3 puede reclutar/integrar N1 en su estructura. |
| 22 | RESPONDIDA | N3 recluta dentro de su propia estructura autorizada. |
| 23 | PENDIENTE | Campos obligatorios de alta. |
| 24 | RESPONDIDA | La carga inicial conserva nivel real; reclutamiento usa la escalera definida. |
| 25 | VALIDAR | La asignación debe ser explícita y respetar el alcance; responsable operativo pendiente. |
| 26 | RESPONDIDA | Contraseña temporal en primer inicio de sesión (hash, cambio obligatorio). |
| 27 | RESPONDIDA | Cambio obligatorio de contraseña en primer inicio; sin expiración, historial ni bloqueo. |
| 28 | RESPONDIDA | ADMIN puede desactivar; la capacidad de N3 requiere validación específica. |
| 29 | PENDIENTE | Alcance de modificación posterior por cada rol. |
| 30 | RESPONDIDA | La salida desactiva empleado/cuenta sin eliminación física. |
| 31 | RESPONDIDA | Los empleados inactivos conservan visibilidad histórica autorizada. |
| 32 | RESPONDIDA | Venta basada en documentación oficial y flujo de revisión. |
| 33 | RESPONDIDA | Registro manual inicial por el vendedor. |
| 34 | RESPONDIDA | No hay importación en la primera versión; puede existir a futuro. |
| 35 | PENDIENTE | La primera versión no depende de un sistema externo; la existencia de uno en la empresa no está confirmada. |
| 36 | VALIDAR | El comprador se conserva como referencia contextual de la venta; los datos mínimos definitivos siguen pendientes. |
| 37 | RESPONDIDA | Modificaciones relevantes controladas y auditables. |
| 38 | RESPONDIDA | Una venta aprobada puede cancelarse cuando corresponda. |
| 39 | RESPONDIDA | Devoluciones/anulaciones generan ajustes, no reescritura silenciosa. |
| 40 | RESPONDIDA | Cada venta tiene inicialmente un único vendedor responsable. |
| 41 | RESPONDIDA | No hay co-vendedores inicialmente. |
| 42 | PENDIENTE | Relación exacta entre ventas y promoción. |
| 43 | RESPONDIDA | Catálogo interno pequeño, no ecommerce. |
| 44 | RESPONDIDA | Productos y precios se administran dentro de la aplicación. |
| 45 | RESPONDIDA | Productos sirven para registrar ventas y reporting. |
| 46 | VALIDAR | Categorías previstas si resultan necesarias para el catálogo. |
| 47 | RESPONDIDA | Estadísticas por producto/categoría previstas. |
| 48 | PENDIENTE | Métricas individuales exactas. |
| 49 | PENDIENTE | Métricas exactas de supervisión. |
| 50 | PENDIENTE | Períodos disponibles. |
| 51 | PENDIENTE | Comparación de períodos. |
| 52 | PENDIENTE | Comparación de empleados. |
| 53 | PENDIENTE | Rankings. |
| 54 | PENDIENTE | Identificación de bajo rendimiento. |
| 55 | RESPONDIDA | Sí existen objetivos oficiales de ventas. |
| 56 | RESPONDIDA | Objetivos individuales (por nivel) y de equipo (target × subordinados). |
| 57 | RESPONDIDA | Sí, diferentes por nivel: N1=10, N2=15, N3-N7=10 por vendedor. |
| 58 | RESPONDIDA | Sí, el sistema calcula porcentaje de cumplimiento (ventas logradas / objetivo). |
| 59 | RESPONDIDA | N4–N7 siguen la escalera comercial consolidada de diseño. |
| 60 | RESPONDIDA | Los niveles superiores operan sobre estructuras mayores según diseño. |
| 61 | RESPONDIDA | La visibilidad de subordinados depende de permisos y scope. |
| 62 | RESPONDIDA | N4→N3, N5→N4, N6→N5 y N7→N6 para reclutamiento normal. |
| 63 | PENDIENTE | Capacidad de modificar estructura fuera del reclutamiento normal. |
| 64 | PENDIENTE | Estadísticas exactas por nivel. |
| 65 | VALIDAR | Se prevén agregaciones de ramas; alcance funcional exacto pendiente. |
| 66 | PENDIENTE | Drill-down desde agregados. |
| 67 | PENDIENTE | Métricas exclusivas de niveles superiores. |
| 68 | RESPONDIDA | La primera versión calcula comisiones internamente. |
| 69 | RESPONDIDA | Las tasas vigentes de Fase 6 no dependen de la antigüedad. |
| 70 | RESPONDIDA | Las tasas vigentes de Fase 6 no dependen del volumen. |
| 71 | RESPONDIDA | La tasa depende del nivel histórico del empleado vendedor. |
| 72 | RESPONDIDA | La comisión de Fase 6 corresponde al empleado que realiza la venta; no se implementan comisiones de equipo. |
| 73 | PENDIENTE | Base exacta de cálculo. |
| 74 | RESPONDIDA | Reglas configurables y versionadas. |
| 75 | REEMPLAZADA | La tabla observada fue reemplazada por las tasas confirmadas N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %. |
| 76 | REEMPLAZADA | No se utilizan porcentajes mensuales observados. |
| 77 | REEMPLAZADA | No se utilizan porcentajes mensuales observados. |
| 78 | REEMPLAZADA | No se utiliza una progresión mensual observada. |
| 79 | RESPONDIDA | Las tasas vigentes confirmadas son N1 15 %, N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %. |
| 80 | RESPONDIDA | La antigüedad no interviene en las tasas vigentes de Fase 6. |
| 81 | RESPONDIDA | El nivel histórico vigente en la fecha de la venta determina la tasa aplicada. |
| 82 | RESPONDIDA | Un cambio posterior de nivel no modifica una comisión histórica. |
| 83 | RESPONDIDA | No existen condiciones adicionales vigentes por antigüedad, volumen, equipo o progresión mensual. |
| 84 | RESPONDIDA | Cancelaciones/devoluciones producen ajustes. |
| 85 | RESPONDIDA | Los cálculos históricos no se reescriben al cambiar reglas. |
| 86 | RESPONDIDA | La primera versión no depende de fuente externa; detalles del cálculo pendiente. |
| 87 | RESPONDIDA | `ADMIN` existe como rol independiente de diseño. |
| 88 | RESPONDIDA | ADMIN gestiona aspectos fuera de la jerarquía comercial. |
| 89 | RESPONDIDA | ADMIN puede ejecutar cambios de nivel. |
| 90 | RESPONDIDA | ADMIN puede ejecutar cambios de supervisor. |
| 91 | RESPONDIDA | ADMIN puede desactivar cuentas. |
| 92 | RESPONDIDA | ADMIN puede consultar globalmente según permisos de diseño. |
| 93 | RESPONDIDA | Se contempla panel administrativo. |
| 94 | RESPONDIDA | ADMIN puede buscar empleados globalmente según diseño. |
| 95 | RESPONDIDA | Se definió un conjunto mínimo de acciones sensibles auditables. |
| 96 | RESPONDIDA | Debe registrarse quién creó una cuenta. |
| 97 | RESPONDIDA | Debe registrarse quién cambió el nivel. |
| 98 | RESPONDIDA | Debe existir historial organizacional. |
| 99 | RESPONDIDA | Los reportes deben poder reconstruir la estructura consultada. |
| 100 | RESPONDIDA | Email + contraseña inicialmente. |
| 101 | RESPONDIDA | No se utilizarán emails corporativos obligatorios. |
| 102 | RESPONDIDA | Google/Microsoft OAuth no se utilizará inicialmente. |
| 103 | VALIDAR | 2FA para ADMIN como diseño de seguridad; no universal. |
| 104 | RESPONDIDA | Recuperación por email y token temporal de un solo uso. |
| 105 | PENDIENTE | Políticas de seguridad corporativas externas. |
| 106 | RESPONDIDA | Se permiten sesiones simultáneas inicialmente. |
| 107 | RESPONDIDA | Vercel Free para la aplicación inicialmente. |
| 108 | PENDIENTE | Existencia y uso de infraestructura propia de la empresa; el despliegue inicial no depende de ella. |
| 109 | RESPONDIDA | PostgreSQL local mediante Docker en desarrollo; cloud después. |
| 110 | PENDIENTE | Autorización corporativa de proveedores cloud. |
| 111 | VALIDAR | Backups periódicos y restauración son necesarios; parámetros pendientes. |
| 112 | PENDIENTE | Retención de datos. |
| 113 | RESPONDIDA | Se separan development, staging y production. |
| 114 | PENDIENTE | La primera versión no depende de sistemas existentes; su existencia en la empresa no está confirmada. |
| 115 | PENDIENTE | No hay integración inicial; la necesidad futura debe determinarse. |
| 116 | PENDIENTE | No se requieren APIs externas inicialmente; la disponibilidad futura no está confirmada. |
| 117 | RESPONDIDA | No hay sincronización inicial. |
| 118 | PENDIENTE | Frecuencia de futuras sincronizaciones. |
| 119 | RESPONDIDA | Capacitación no exclusiva de N1. |
| 120 | RESPONDIDA | Otros niveles pueden acceder a contenidos correspondientes. |
| 121 | RESPONDIDA | Categoría → curso → módulo → material. |
| 122 | RESPONDIDA | PDFs visualizables y descargables. |
| 123 | RESPONDIDA | Videos mediante abstracción de contenido/almacenamiento. |
| 124 | PENDIENTE | Plataforma de video. |
| 125 | RESPONDIDA | Categorías, niveles, cursos, módulos y tags previstos. |
| 126 | RESPONDIDA | Estados `DRAFT`, `PUBLISHED`, `ARCHIVED`. |
| 127 | RESPONDIDA | ADMIN crea materiales. |
| 128 | RESPONDIDA | ADMIN modifica y archiva materiales. |
| 129 | RESPONDIDA | Supervisores no administran materiales inicialmente. |
| 130 | DESCARTADA | No se implementará seguimiento individual de materiales en el alcance actual. |
| 131 | DESCARTADA | No se implementará progreso individual en el alcance actual. |
| 132 | DESCARTADA | No se implementará completitud individual en el alcance actual. |
| 133 | RESPONDIDA | Existe capacitación obligatoria, especialmente para nuevos N1. |
| 134 | DESCARTADA | Assessments/quizzes quedan fuera del alcance actual. |
| 135 | RESPONDIDA | El contenido puede dirigirse por nivel, con acceso acumulativo. |
| 136 | DESCARTADA | No se conservará historial individual de progreso en el alcance actual. |

La tabla anterior reemplaza el carácter vigente del registro inicial de la
sección 16.2, que se conserva únicamente como trazabilidad del estado previo.

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

Posteriormente se adoptó una regla inicial de diseño para comisiones:

| Antigüedad  | Comisión observada |
|-------------|--------------------|
| Mes 1       | 10 %               |
| Mes 2       | 15 %               |
| Mes 3       | 30 %               |
| Mes 4       | Pendiente          |
| Mes 5       | Pendiente          |
| Regla inicial (anterior, 🔄 REEMPLAZADA) | 50 %               |

Las observaciones históricas previas de progresión mensual quedan reemplazadas
como base de la regla operativa. Las tasas confirmadas vigentes son **N1 15 %,
N2 20 %, N3 30 %, N4 40 %, N5 50 %, N6 60 % y N7 70 %**, configurables y
versionadas. La anterior regla general del 50 % queda 🔄 REEMPLAZADA como
antecedente; el 50 % vigente para N5 proviene de la tabla confirmada.

**⚠️ Aún sin definir en la reunión inicial:**

- Responsabilidades exactas de los Niveles 4–7.
- Matriz exacta de permisos.
- Modelo exacto de ventas.
- Origen de los datos de ventas.
- Reglas comerciales adicionales de comisiones fuera de las tasas vigentes por nivel.
- ~~Objetivos y metas.~~ Resueltos en Q55–Q58 (Phase 9).
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

Las decisiones adoptadas posteriormente durante la consolidación se registran en
la sección 16.3 y no deben reinterpretarse como confirmaciones de aquella
reunión.

---

## 17. Preguntas resueltas (Phase 10)

### Q137 — ¿Cómo se asignan las visitas?

> **Estado:** RESPONDIDA (Phase 10)

Las visitas son asignadas por usuarios de nivel superior a uno inferior. Los supervisores N3+ asignan clientes a vendedores de su equipo.

### Q138 — ¿Existe entidad Client?

> **Estado:** RESPONDIDA (Phase 10)

Sí. Se crea la entidad `Client` con campos: name, phone, email, address, referredBySaleId, ownerEmployeeId.

### Q139 — ¿Cómo funciona el programa de referidos?

> **Estado:** RESPONDIDA (Phase 10)

Si el cliente proporciona 5 contactos de futuros clientes, se aplica 20% de descuento sobre toda la compra. Los contactos se cargan en la venta y se agregan a la base de clientes del N3+.

### Q140 — ¿El descuento es para nuevos o existentes?

> **Estado:** RESPONDIDA (Phase 10)

Para nuevos y existentes. Un cliente puede obtener el descuento múltiples veces.

### Q141 — ¿Cómo asignación automática?

> **Estado:** RESPONDIDA (Phase 10)

Queda pendiente. Se crea el botón pero no funciona todavía.

### Q142 — ¿Los campos de buyerName se mantienen?

> **Estado:** RESPONDIDA (Phase 10)

Sí. `buyerName` se conserva por compatibilidad con datos existentes. Se agrega `clientId` como opcional.

---

## 18. Historial de cambios

| Fecha      | Versión | Cambio                                                                              |
|------------|---------|-------------------------------------------------------------------------------------|
| 01/09/2026 | 0.1     | Creación inicial del documento a partir del relevamiento informal.                  |
| 01/09/2026 | 0.2     | Incorporación de nomenclatura observada, comisiones y requisitos de capacitación.   |
| 03/09/2026 | 0.3     | Registro de resolución y clasificación de Q01–Q136 según decisiones consolidadas.  |
| 03/09/2026 | 0.4     | Consolidación de comisión inicial y descarte del seguimiento individual de capacitación. |
| 07/09/2026 | 0.5     | Confirmación de las tasas vigentes de comisión N1–N7 y resolución de las preguntas relacionadas con porcentajes y progresión mensual. |
| 08/09/2026 | 0.6     | Resolución de Q55–Q58: objetivos de ventas confirmados (individuales y por equipo, diferenciados por nivel, con cálculo de cumplimiento). |
| 03/09/2026 | 0.5     | Comisión inicial vigente N1 → 15 % (50 % queda REEMPLAZADO como antecedente). Cierre de Q26/Q27: contraseña temporal y cambio obligatorio en primer inicio. |
