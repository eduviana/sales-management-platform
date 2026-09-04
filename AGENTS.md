<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in node_modules/next/dist/docs/ (resolved from this file's directory; in monorepos the next package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by next dev — verify at node_modules/next/dist/server/lib/generate-agent-files.js. Removing it from a diff only re-creates the uncommitted change; committing it with the work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Instrucciones del proyecto
1. Propósito

Este archivo define las convenciones y reglas que deben seguir los agentes de desarrollo al trabajar en este repositorio.

El proyecto es una aplicación web interna de gestión y analítica para una organización comercial jerárquica.

La documentación del proyecto y los artefactos de diseño son parte integral del proceso de diseño y desarrollo y deben mantenerse consistentes con el código.

2. Principios generales
Priorizar claridad, mantenibilidad y coherencia sobre soluciones rápidas.
No introducir complejidad innecesaria.
Evitar decisiones técnicas irreversibles cuando todavía existan incertidumbres de negocio.
Separar claramente reglas de negocio, decisiones técnicas, referencias de diseño y detalles de implementación.
No convertir supuestos en requisitos confirmados.
No modificar información funcional sin una razón explícita.
Favorecer soluciones que puedan evolucionar ante cambios de requisitos.
3. Documentación

La documentación se encuentra principalmente dentro de:

docs/

Los nombres de los archivos deben estar escritos en inglés.

El contenido de los documentos debe estar escrito en español.

Ejemplo:

docs/product/requirements.md

El nombre del archivo está en inglés y su contenido está en español.

4. Estructura documental

La documentación está organizada por responsabilidad.

docs/

├── product/
│   ├── requirements.md
│   ├── open-questions.md
│   └── permissions-matrix.md
│
├── domain/
│   ├── organizational-model.md
│   └── business-rules.md
│
├── architecture/
│   ├── architecture-decisions.md
│   ├── system-architecture.md
│   ├── authorization.md
│   └── data-architecture.md
│
└── database/
    └── data-model.md

Cada documento debe tener un propósito claramente definido.

5. Fuente de verdad

Cada tipo de información debe tener un documento principal responsable de definirla.

Información	Documento responsable
Requisitos funcionales y no funcionales	docs/product/requirements.md
Preguntas e incertidumbres	docs/product/open-questions.md
Modelo organizacional	docs/domain/organizational-model.md
Reglas de negocio	docs/domain/business-rules.md
Permisos y alcances	docs/product/permissions-matrix.md
Decisiones arquitectónicas	docs/architecture/architecture-decisions.md
Arquitectura general del sistema	docs/architecture/system-architecture.md
Autorización técnica	docs/architecture/authorization.md
Arquitectura de datos	docs/architecture/data-architecture.md
Modelo conceptual de datos	docs/database/data-model.md

Un documento puede referenciar información de otro, pero no debe convertirse innecesariamente en una segunda fuente de verdad para el mismo concepto.

`data-model.md` define el modelo conceptual de datos. El futuro modelo físico de PostgreSQL y su representación en Prisma deberán derivarse de ese modelo y de la arquitectura de datos, pero no constituyen una fuente adicional para requisitos, reglas de negocio o conceptos organizacionales.

Los artefactos de diseño visual no forman parte de esta tabla de fuentes de verdad. Su función es servir como referencia para la implementación de la interfaz.

6. Estados de la información

La documentación utiliza estados para distinguir información confirmada de hipótesis o decisiones provisionales.

✅ CONFIRMADO — Información confirmada por el cliente o establecida como requisito oficial.
🔎 OBSERVADO — Información obtenida durante reuniones, bocetos, documentos u otras fuentes de relevamiento que todavía no fue validada formalmente.
⚠️ ASUMIDO — Decisión provisional adoptada para permitir continuar con una versión de referencia.
❓ PENDIENTE — Información que todavía no fue definida.
🚧 DECISIÓN DE DISEÑO — Decisión técnica o estructural tomada deliberadamente para el proyecto.
🔄 REEMPLAZADO — Información que dejó de ser válida y fue sustituida por una nueva definición.
7. Diseño visual y referencias de Stitch

Los artefactos de diseño visual se encuentran principalmente dentro de:

design/

Los diseños generados mediante herramientas como Google Stitch se almacenan dentro de:

design/stitch/

Estos artefactos pueden incluir, entre otros:

code.html
DESIGN.md
pagina-1.png
Propósito

Estos archivos representan referencias visuales y de interacción para la interfaz.

Deben utilizarse como referencia cuando una tarea implique:

crear una nueva interfaz;
modificar una pantalla existente;
crear componentes visuales;
definir layouts;
implementar estilos;
reproducir una interacción representada en el diseño.

Antes de implementar una interfaz que tenga un diseño correspondiente, el agente debe consultar los artefactos de diseño relevantes.

Naturaleza de los diseños

Los archivos dentro de design/ no constituyen por sí mismos requisitos funcionales, reglas de negocio, decisiones arquitectónicas, permisos ni fuentes de verdad del sistema.

Si existe una contradicción entre un diseño visual y la documentación funcional o de dominio, el diseño no debe utilizarse para inventar o modificar requisitos.

La implementación debe respetar las fuentes de verdad definidas en docs/.

Cuando un diseño visual revele una necesidad funcional no documentada, el agente debe señalar la discrepancia en lugar de convertirla automáticamente en un requisito.

code.html

El archivo code.html generado por Stitch es una referencia de implementación visual.

No debe copiarse automáticamente al código de producción ni considerarse una implementación definitiva.

Antes de reutilizar cualquier parte de su contenido, el agente debe evaluar su compatibilidad con:

la arquitectura existente;
las tecnologías utilizadas por el proyecto;
los componentes existentes;
las convenciones del código;
la accesibilidad;
la responsividad;
la mantenibilidad;
las reglas de negocio y autorización.

Debe preferirse la integración con la arquitectura y los componentes existentes antes que una copia directa del HTML generado.

DESIGN.md

DESIGN.md debe considerarse una especificación o referencia visual del diseño generado.

Su contenido puede orientar decisiones visuales, pero no reemplaza los documentos funcionales, de dominio o arquitectura.

Imágenes

Las imágenes generadas como pagina-1.png son referencias visuales.

Cuando sea necesario verificar detalles de layout, jerarquía visual, espaciado, componentes o apariencia, el agente debe utilizar la imagen como referencia.

8. Reglas para modificar documentación

Cuando se modifique una regla o requisito:

Identificar cuál es el documento responsable.
Determinar qué otros documentos podrían verse afectados.
Actualizar solamente los documentos realmente afectados.
Mantener consistencia entre referencias cruzadas.
No modificar documentos no relacionados.
Mantener los identificadores existentes.
Registrar cambios relevantes en el historial del documento.
Utilizar Git para conservar la trazabilidad completa.

No se deben realizar modificaciones masivas únicamente por conveniencia.

Los cambios realizados únicamente sobre referencias visuales deben mantenerse dentro de design/, salvo que impliquen una modificación real de requisitos, dominio, arquitectura u otra fuente de verdad.

9. Identificadores

Los identificadores documentales son permanentes.

Se utilizan las siguientes convenciones:

REQ-xxx     Requisito

Q-xxx       Pregunta

REG-xxx     Regla de negocio

PERM-xxx    Permiso

ADR-xxx     Decisión arquitectónica

UC-xxx      Caso de uso

TEST-xxx    Prueba

Los identificadores existentes no deben reutilizarse para otros conceptos.

Si un elemento deja de ser válido, debe marcarse como reemplazado o descartado según corresponda.

10. Trazabilidad

Cuando sea relevante, las entidades documentales deberán relacionarse entre sí.

El flujo conceptual es:

Requisito

    ↓

Regla de negocio

    ↓

Permiso / Caso de uso

    ↓

Implementación

    ↓

Prueba

Ejemplo:

REQ-xxx

    ↓

REG-xxx

    ↓

PERM-xxx

    ↓

UC-xxx

    ↓

TEST-xxx

No es obligatorio crear una relación artificial para cada elemento. La trazabilidad debe utilizarse cuando aporte valor.

Los diseños visuales pueden actuar como referencia complementaria de la implementación, pero no sustituyen la trazabilidad funcional o técnica.

11. Mantenimiento mediante agentes

Los agentes pueden modificar documentación del proyecto.

Antes de hacerlo deberán:

Analizar el cambio solicitado.
Identificar documentos potencialmente afectados.
Respetar la fuente de verdad de cada documento.
Mantener identificadores existentes.
No inventar requisitos.
No convertir una hipótesis en un hecho.
No modificar decisiones no relacionadas.
Mantener la coherencia entre documentos.
Evitar duplicar información.

Cuando una solicitud pueda afectar múltiples documentos, el agente deberá explicar brevemente qué documentos considera afectados antes de realizar cambios extensos.

Los agentes deben distinguir entre cambios sobre documentación normativa y cambios sobre referencias visuales dentro de design/.

12. Seguridad documental

La documentación nunca debe utilizarse para justificar una implementación insegura.

En particular:

Un permiso documentado debe validarse también en el servidor.
Ocultar funcionalidades en el frontend no constituye autorización.
Los identificadores enviados por el cliente no deben determinar por sí mismos el alcance del acceso.
Las reglas de autorización deben aplicarse sobre el contexto del usuario autenticado.

Un diseño visual tampoco constituye una definición de permisos o autorización.

Si una interfaz diseñada muestra una acción que requiere autorización, dicha autorización debe determinarse mediante las reglas documentadas y la implementación server-side correspondiente.

13. Reglas para el código

Cuando se implemente funcionalidad:

Mantener separación entre presentación, lógica de aplicación, dominio y persistencia cuando corresponda.
Evitar lógica de negocio importante dentro de componentes visuales.
Validar datos de entrada.
Centralizar reglas de autorización.
Mantener nombres descriptivos.
Evitar duplicación.
Priorizar tipos explícitos y seguridad de tipos.
Escribir código preparado para mantenimiento por otros desarrolladores.
Cuando exista un diseño visual de referencia, respetarlo sin sacrificar las reglas arquitectónicas, funcionales o de accesibilidad del proyecto.

Los diseños generados por Stitch deben adaptarse a la arquitectura existente, no al revés.

14. Dependencias

No instalar dependencias únicamente porque podrían ser útiles en el futuro.

Antes de incorporar una dependencia:

Determinar qué problema resuelve.
Confirmar que no exista una solución adecuada ya presente en el proyecto.
Evaluar su impacto en mantenimiento y complejidad.
Incorporarla únicamente cuando aporte valor real.

El código generado por herramientas de diseño no justifica por sí mismo la incorporación de nuevas dependencias.

15. Cambios importantes

Los cambios que puedan afectar arquitectura, modelo de datos, autorización o reglas fundamentales del dominio deben documentarse.

Cuando una decisión tenga impacto significativo, deberá evaluarse la creación de un:

ADR-xxx

en:

docs/architecture/architecture-decisions.md

Los diseños visuales pueden evolucionar independientemente de la arquitectura, siempre que no introduzcan cambios funcionales no documentados.

Si un diseño requiere modificar una regla de negocio, un requisito, una estructura de datos, un permiso o una decisión arquitectónica, primero debe actualizarse la fuente de verdad correspondiente.

16. Regla principal

Cuando exista conflicto entre:

Una implementación existente.
Un supuesto.
Una referencia visual.
Una regla de negocio.
Un requisito confirmado.

Debe prevalecer la fuente de mayor autoridad definida por este documento y por la estructura documental del proyecto.

Cuando existan varias fuentes con igual nivel de autoridad, debe prevalecer la definición más reciente.

Toda modificación relevante debe quedar registrada en la fuente de verdad correspondiente.

No se deben ocultar contradicciones.

Recomendación sobre el bloque generado por Next.js

El bloque:

<!-- BEGIN:nextjs-agent-rules -->
...
<!-- END:nextjs-agent-rules -->

es generado y mantenido por Next.js.

No modificarlo, traducirlo ni eliminarlo manualmente.

Las reglas propias del proyecto comienzan después de:

<!-- END:nextjs-agent-rules -->

De esta forma se mantiene separada la configuración generada por Next.js de las reglas específicas del proyecto.

La estructura conceptual queda:

Next.js

└── reglas propias de Next.js


Proyecto

├── AGENTS.md
│
├── docs/
│   ├── product/
│   ├── domain/
│   ├── architecture/
│   └── database/
│
└── design/
    └── stitch/
