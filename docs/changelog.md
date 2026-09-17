# Changelog

Todos los cambios relevantes de este proyecto se documentan acá.
Las entradas nuevas van **arriba**. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/)
y [Conventional Commits](https://www.conventionalcommits.org/). Fechas en `YYYY-MM-DD`.

Proyecto pre-1.0: se sube versión **minor** al cerrar un hito o batch de features y **patch** en
fixes y adiciones chicas.

## [Unreleased]

## [0.3.0] - 2026-09-16

### Agregado

- **Fase 0 del plan completada.** Se creó `app/`: la primera aplicación ejecutable del repo,
  con Next.js 16.3.5 (App Router, React 19, TypeScript, Tailwind v4, `src/` y alias `@/*`).
- Backend Convex instalado (`convex@1.46.0`, `@convex-dev/auth@0.0.95`, `@auth/core`), con
  `app/convex/schema.ts` mínimo y `_generated/` generado en modo local anónimo
  (`CONVEX_AGENT_MODE=anonymous`).
- shadcn/ui inicializado con estilo `base-nova` y base `neutral` (`app/components.json`), más los
  componentes `button`, `input`, `textarea`, `card`, `checkbox`, `label`, `dialog`, `avatar` y
  `sonner` en `app/src/components/ui/`.
- Dependencias de UI/tema: `next-themes` y `lucide-react`.
- Tests unitarios con Vitest + Testing Library + jsdom (`app/vitest.config.ts`,
  `app/src/test/setup.ts`), con smoke test de `cn()` en `app/src/lib/utils.test.ts`.
- E2E con Playwright + Chromium (`app/playwright.config.ts` con `webServer` sobre `npm run dev` y
  `app/tests/smoke.spec.ts`), más los scripts `test`, `test:watch` y `test:e2e` en
  `app/package.json`.
- `app/.env.local` a partir de `.env.example` (ignorado por git).
- Subagentes de proyecto `.opencode/agents/convex-dev.md` y `.opencode/agents/nextjs-ui-dev.md`.
- `.gitignore`: se ignoran `playwright-report/`, `test-results/` y `blob-report/`.

### Cambiado

- `app/src/lib/utils.ts` reexporta `cn` desde el paquete `cn` (drop-in de `clsx` +
  `tailwind-merge`) que trae el preset `base-nova` de shadcn 4.x; los componentes de `ui/` lo
  consumen directo. Queda como desvío a revisar contra `ARCHITECTURE_TEMPLATE.md`.
- `app/next.config.ts` fija `turbopack.root` en `app/` para evitar el warning por lockfiles
  duplicados (raíz + app).
- `.env.example` no es usable tal cual para el modo local anónimo: su `CONVEX_DEPLOYMENT`
  (`local:local-...`) hace que el CLI pida login; hay que quitar esa línea y dejar que Convex la
  complete con `anonymous:anonymous-agent`.

### Corregido

- Revisión del PR de Fase 0: se agregó el script `typecheck` (`next typegen && tsc --noEmit`)
  para que el chequeo de tipos funcione en un clon limpio (los tipos de rutas de Next 16 son
  generados); la plantilla de PR ahora pide `npm run typecheck`.
- Vitest extiende los `exclude` por defecto (`configDefaults.exclude`) en vez de pisarlos.
- Se dieron de baja las dependencias muertas `clsx` y `tailwind-merge` (nadie las importaba;
  el paquete `cn` trae su propio engine).
- ESLint ignora `convex/_generated/**` (código generado) y queda sin warnings por ese motivo.
- `cn` unificado: los componentes de `ui/` lo importan desde `@/lib/utils`.
- Setup de tests importa `@testing-library/jest-dom/vitest` (matchers tipados).
- Playwright usa `reuseExistingServer: !process.env.CI`.
- Metadata en español (`title: "Tareas"`, descripción de la app) y `lang="es"`.
- `app/README.md` propio del proyecto (cómo correr, verificación y Convex local anónimo).

## [0.2.0] - 2026-09-16

### Agregado

- Se creó la documentación Markdown base en `docs/` (`changelog.md`, `architecture.md`,
  `project_status.md`) como fuente de verdad, generada por `/update-docs-and-commit`.
- Se agregó `IMPLEMENTATION_PLAN.md`: plan del MVP en 7 fases con gates de salida, modelo de datos
  borrador, mapa de agentes por fase y riesgos.
- Se agregó la nota de decisiones del MVP en
  `cooked-ideas/que-entra-en-el-mvp-de-la-web-app-de-tareas.md` (alcance, no-objetivos y 5
  preguntas abiertas).
- Se agregaron los agentes nativos de OpenCode en `.opencode/agents/` (`changelog-updater`,
  `development-retrospective`, `playwright-test-runner`) y el comando `/update-docs-and-commit`
  en `.opencode/commands/`, como wrappers de los originales de `.claude/`.

### Cambiado

- Se reescribió `AGENTS.md` para reflejar el estado real de la plantilla (sin `app/` ejecutable),
  documentar la estructura de `.opencode/`, los gotchas de Convex y el flujo de documentación
  Markdown.

## [0.1.0] - 2026-09-16

### Agregado

- Se inicializó la plantilla con `ARCHITECTURE_TEMPLATE.md`: stack objetivo Next.js 16 (App Router,
  React 19) + Convex + Tailwind v4 + shadcn/ui, y estructura de proyecto de referencia.
- Se agregaron skills en `.claude/skills/`: `frontend-design` y `vercel-react-best-practices`
  (auto-descubiertos por OpenCode).
- Se agregó tooling de git en la raíz: husky + commitlint (`commitlint.config.mjs`, `.husky/commit-msg`)
  para validar Conventional Commits.
- Se agregó `LICENSE` (MIT), `.env.example` (plantilla de variables) y la plantilla de PR en
  `.github/pull_request_template.md`.
- Se agregaron los subagentes originales en `.claude/agents/` y el comando en `.claude/commands/`.

### Seguridad

- Se configuró `.gitignore` para excluir `.env*`, `.convex/`, `app/convex/_generated/`, artefactos
  de build y archivos locales del editor. `.env.example` es la única plantilla de variables trackeada.
