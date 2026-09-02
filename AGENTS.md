<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Instrucciones del proyecto

## 1. Propósito

Este archivo define las convenciones y reglas que deben seguir los agentes de desarrollo al trabajar en este repositorio.

El proyecto es una aplicación web interna de gestión y analítica para una organización comercial jerárquica.

La documentación del proyecto es parte integral del proceso de diseño y desarrollo y debe mantenerse consistente con el código.

---

## 2. Principios generales

- Priorizar claridad, mantenibilidad y coherencia sobre soluciones rápidas.
- No introducir complejidad innecesaria.
- Evitar decisiones técnicas irreversibles cuando todavía existan incertidumbres de negocio.
- Separar claramente reglas de negocio, decisiones técnicas y detalles de implementación.
- No convertir supuestos en requisitos confirmados.
- No modificar información funcional sin una razón explícita.
- Favorecer soluciones que puedan evolucionar ante cambios de requisitos.

---

## 3. Documentación

La documentación se encuentra principalmente dentro de:

```
docs/
```

Los nombres de los archivos deben estar escritos en inglés.

El contenido de los documentos debe estar escrito en español.

**Ejemplo:**

```
docs/product/requirements.md
```

El nombre del archivo está en inglés y su contenido está en español.

---

## 4. Estructura documental

La documentación está organizada por responsabilidad.

```
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
│   └── ...
│
└── database/
    └── ...
```

Cada documento debe tener un propósito claramente definido.

---

## 5. Fuente de verdad

Cada tipo de información debe tener un documento principal responsable de definirla.

| Información                                | Documento responsable            |
|--------------------------------------------|----------------------------------|
| Requisitos funcionales y no funcionales    | `requirements.md`                |
| Preguntas e incertidumbres                 | `open-questions.md`              |
| Modelo organizacional                      | `organizational-model.md`        |
| Reglas de negocio                          | `business-rules.md`              |
| Permisos y alcances                        | `permissions-matrix.md`          |
| Decisiones arquitectónicas                 | `architecture-decisions.md`      |
| Arquitectura general del sistema           | `system-architecture.md`         |
| Autorización técnica                       | `authorization.md`               |
| Modelo de datos                            | `data-model.md`                  |

Un documento puede referenciar información de otro, pero no debe convertirse innecesariamente en una segunda fuente de verdad para el mismo concepto.

---

## 6. Estados de la información

La documentación utiliza estados para distinguir información confirmada de hipótesis o decisiones provisionales.

- ✅ **CONFIRMADO** — Información confirmada por el cliente o establecida como requisito oficial.
- 🔎 **OBSERVADO** — Información obtenida durante reuniones, bocetos, documentos u otras fuentes de relevamiento que todavía no fue validada formalmente.
- ⚠️ **ASUMIDO** — Decisión provisional adoptada para permitir continuar con una versión de referencia.
- ❓ **PENDIENTE** — Información que todavía no fue definida.
- 🚧 **DECISIÓN DE DISEÑO** — Decisión técnica o estructural tomada deliberadamente para el proyecto.
- 🔄 **REEMPLAZADO** — Información que dejó de ser válida y fue sustituida por una nueva definición.

---

## 7. Reglas para modificar documentación

Cuando se modifique una regla o requisito:

- Identificar cuál es el documento responsable.
- Determinar qué otros documentos podrían verse afectados.
- Actualizar solamente los documentos realmente afectados.
- Mantener consistencia entre referencias cruzadas.
- No modificar documentos no relacionados.
- Mantener los identificadores existentes.
- Registrar cambios relevantes en el historial del documento.
- Utilizar Git para conservar la trazabilidad completa.

No se deben realizar modificaciones masivas únicamente por conveniencia.

---

## 8. Identificadores

Los identificadores documentales son permanentes.

**Se utilizan las siguientes convenciones:**

```
REQ-xxx     Requisito
Q-xxx       Pregunta abierta
REG-xxx     Regla de negocio
PERM-xxx    Permiso
ADR-xxx     Decisión arquitectónica
UC-xxx      Caso de uso
TEST-xxx    Prueba
```

Los identificadores existentes no deben reutilizarse para otros conceptos.

Si un elemento deja de ser válido, debe marcarse como reemplazado o descartado según corresponda.

---

## 9. Trazabilidad

Cuando sea relevante, las entidades documentales deberán relacionarse entre sí.

**El flujo conceptual es:**

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
REQ-xxx
    ↓
REG-xxx
    ↓
PERM-xxx
    ↓
UC-xxx
    ↓
TEST-xxx
```

No es obligatorio crear una relación artificial para cada elemento. La trazabilidad debe utilizarse cuando aporte valor.

---

## 10. Mantenimiento mediante agentes

Los agentes pueden modificar documentación del proyecto.

**Antes de hacerlo deberán:**

- Analizar el cambio solicitado.
- Identificar documentos potencialmente afectados.
- Respetar la fuente de verdad de cada documento.
- Mantener identificadores existentes.
- No inventar requisitos.
- No convertir una hipótesis en un hecho.
- No modificar decisiones no relacionadas.
- Mantener la coherencia entre documentos.
- Evitar duplicar información.

Cuando una solicitud pueda afectar múltiples documentos, el agente deberá explicar brevemente qué documentos considera afectados antes de realizar cambios extensos.

---

## 11. Seguridad documental

La documentación nunca debe utilizarse para justificar una implementación insegura.

**En particular:**

- Un permiso documentado debe validarse también en el servidor.
- Ocultar funcionalidades en el frontend no constituye autorización.
- Los identificadores enviados por el cliente no deben determinar por sí mismos el alcance del acceso.
- Las reglas de autorización deben aplicarse sobre el contexto del usuario autenticado.

---

## 12. Reglas para el código

Cuando se implemente funcionalidad:

- Mantener separación entre presentación, lógica de aplicación, dominio y persistencia cuando corresponda.
- Evitar lógica de negocio importante dentro de componentes visuales.
- Validar datos de entrada.
- Centralizar reglas de autorización.
- Mantener nombres descriptivos.
- Evitar duplicación.
- Priorizar tipos explícitos y seguridad de tipos.
- Escribir código preparado para mantenimiento por otros desarrolladores.

---

## 13. Dependencias

No instalar dependencias únicamente porque podrían ser útiles en el futuro.

**Antes de incorporar una dependencia:**

- Determinar qué problema resuelve.
- Confirmar que no exista una solución adecuada ya presente en el proyecto.
- Evaluar su impacto en mantenimiento y complejidad.
- Incorporarla únicamente cuando aporte valor real.

---

## 14. Cambios importantes

Los cambios que puedan afectar arquitectura, modelo de datos, autorización o reglas fundamentales del dominio deben documentarse.

Cuando una decisión tenga impacto significativo, deberá evaluarse la creación de un:

```
ADR-xxx
```

en:

```
docs/architecture/architecture-decisions.md
```

---

## 15. Regla principal

Cuando exista conflicto entre:

- Una implementación existente.
- Un supuesto.
- Una regla de negocio.
- Un requisito confirmado.

La información más reciente y de mayor autoridad debe prevalecer, siempre dejando registrada la modificación correspondiente.

No se deben ocultar contradicciones.

---

### Una única recomendación

Como el `AGENTS.md` que generó Next.js dice explícitamente que ese bloque es regenerado por `next dev`, **no lo modifiques ni lo traduzcas**. Nuestras reglas empiezan después de `<!-- END:nextjs-agent-rules -->`.

Así tenemos:

```text
Next.js
└── reglas propias de Next.js

Proyecto
└── reglas nuestras
```
