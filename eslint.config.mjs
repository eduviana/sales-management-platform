import path from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ADR-020 — fronteras entre capas (decisión 9, "Enforcement").
 *
 * Once the layer migration is complete (P0–P3), these rules block regressions:
 *
 * - `domain` depends only on itself and on `shared` kernel utilities.
 * - `application` talks to the outside through repository ports, never through
 *   Prisma or other infrastructure adapters.
 * - `presentation` (Server Actions and components) never reads the database.
 * - `app/` routes only compose modules: they never assemble infrastructure, and
 *   they import `application` **only as types** (read model contracts) — the
 *   object graph lives in the composition roots.
 * - `shared` stays free of module and infrastructure dependencies.
 * - Infrastructure adapters never depend on presentation.
 *
 * Enforcement uses `@typescript-eslint/no-restricted-imports` (the same syntax
 * as the core rule, plus `allowTypeImports`) with the plugin already registered
 * by `eslint-config-next`, so no new dependency is required.
 *
 * Patterns use the project's `@/` alias, which is how cross-module imports are
 * written in this codebase. Relative imports that leave the current module are
 * caught by the local rule below, which resolves paths instead of matching
 * strings. Composition roots (`src/modules/<módulo>/composition-root.ts`) are
 * deliberately outside these groups: they are the only place allowed to wire
 * infrastructure (ADR-019, ADR-020).
 */

const modulesRoot = path.join(import.meta.dirname, "src", "modules");

/**
 * Local rule — relative imports may not leave the current module.
 *
 * String patterns cannot express this: `../../organization/x` from a file one
 * level deep and `../../domain/x` from a file two levels deep have the same
 * shape but only the first crosses a module. This rule resolves the specifier
 * against the file location and compares the `src/modules/<A>` segments, so it
 * works at any depth and never flags same-module imports.
 */
const crossModuleRelativeImports = {
  rules: {
    "no-cross-module-relative-imports": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Prohíbe imports relativos que salen del módulo actual (ADR-020, decisión 4).",
        },
        schema: [],
        messages: {
          crossModule:
            "Import relativo fuera del módulo '{{from}}' hacia '{{to}}' (ADR-020, decisión 4). Un módulo sólo se relaciona con otro a través de las fronteras permitidas (`@/modules/...`).",
        },
      },
      create(context) {
        const filename = context.filename;
        const relImporter = path.relative(modulesRoot, filename);
        // Sólo aplican a archivos dentro de src/modules/<módulo>/.
        if (relImporter.startsWith("..") || path.isAbsolute(relImporter)) {
          return {};
        }
        const importerModule = relImporter.split(path.sep)[0];

        const checkSource = (node) => {
          const specifier = node.source?.value;
          if (typeof specifier !== "string" || !specifier.startsWith(".")) {
            return;
          }
          const target = path.resolve(path.dirname(filename), specifier);
          const relTarget = path.relative(modulesRoot, target);
          // El destino queda fuera de src/modules (p. ej. shared kernel): lo
          // cubren las reglas de alias, no ésta.
          if (relTarget.startsWith("..") || path.isAbsolute(relTarget)) {
            return;
          }
          const targetModule = relTarget.split(path.sep)[0];
          if (targetModule && targetModule !== importerModule) {
            context.report({
              node,
              messageId: "crossModule",
              data: { from: importerModule, to: targetModule },
            });
          }
        };

        return {
          ImportDeclaration: checkSource,
          ExportNamedDeclaration: checkSource,
          ExportAllDeclaration: checkSource,
          ImportExpression: checkSource,
        };
      },
    },
  },
};
const layerBoundaries = [
  {
    // domain: no infrastructure, no Prisma, no presentation, no other layer.
    files: ["src/modules/*/domain/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure", "@/infrastructure/**", "@prisma/*"],
              message:
                "El dominio no depende de infraestructura (ADR-020, decisión 1).",
            },
            {
              group: ["@/shared/presentation", "@/shared/presentation/**"],
              message:
                "El dominio no depende de presentación (ADR-020, decisión 8).",
            },
            {
              group: [
                "@/modules/*/application",
                "@/modules/*/application/**",
                "@/modules/*/presentation",
                "@/modules/*/presentation/**",
              ],
              message:
                "El dominio no depende de application ni de presentation (ADR-020, decisión 1).",
            },
          ],
        },
      ],
    },
  },
  {
    // application: repository ports only — no Prisma, no presentation.
    files: ["src/modules/*/application/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure", "@/infrastructure/**", "@prisma/*"],
              message:
                "Application depende de puertos, no de infraestructura (ADR-020, decisión 1).",
            },
            {
              group: ["@/shared/presentation", "@/shared/presentation/**"],
              message:
                "Application no depende de presentación (ADR-020, decisión 8).",
            },
            {
              group: [
                "@/modules/*/presentation",
                "@/modules/*/presentation/**",
              ],
              message:
                "Application no depende de presentation (ADR-020, decisión 1).",
            },
          ],
        },
      ],
    },
  },
  {
    // presentation (Server Actions and components): no database access.
    files: ["src/modules/*/presentation/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure", "@/infrastructure/**", "@prisma/*"],
              message:
                "presentation no importa Prisma ni infraestructura (ADR-020, decisión 1 y 3).",
            },
            {
              group: [
                "@/modules/*/presentation",
                "@/modules/*/presentation/**",
              ],
              message:
                "Un módulo no importa la capa presentation de otro módulo (ADR-020, decisión 4).",
            },
          ],
        },
      ],
    },
  },
  {
    // routes: composition roots of screens — no direct data access.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure", "@/infrastructure/**", "@prisma/*"],
              message:
                "Las rutas no ejecutan acceso a datos directo (ADR-020, decisiones 1 y 2).",
            },
            {
              group: ["@/modules/*/application", "@/modules/*/application/**"],
              allowTypeImports: true,
              message:
                "Las rutas importan de application sólo como tipos (contratos de read models); el grafo se arma en los composition roots (ADR-020, decisiones 2 y 3).",
            },
          ],
        },
      ],
    },
  },
  {
    // relative imports may not leave the current module (alias patterns only
    // see `@/`, so the relative form needs path resolution).
    files: ["src/modules/**/*.{ts,tsx}"],
    plugins: { boundaries: crossModuleRelativeImports },
    rules: {
      "boundaries/no-cross-module-relative-imports": "error",
    },
  },
  {
    // shared kernel: no module or infrastructure dependencies.
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure", "@/infrastructure/**", "@prisma/*"],
              message:
                "El kernel compartido no depende de infraestructura (ADR-019).",
            },
            {
              group: ["@/modules/*", "@/modules/**"],
              message:
                "El kernel compartido no depende de módulos (ADR-019).",
            },
          ],
        },
      ],
    },
  },
  {
    // infrastructure: implements ports, never presentation.
    files: [
      "src/infrastructure/**/*.{ts,tsx}",
      "src/modules/*/infrastructure/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/presentation",
                "@/modules/*/presentation/**",
                "@/shared/presentation",
                "@/shared/presentation/**",
              ],
              message:
                "La infraestructura no depende de presentación (ADR-020, decisión 1).",
            },
          ],
        },
      ],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
