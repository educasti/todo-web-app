# Changelog

Todos los cambios relevantes de este proyecto se documentan acá.
Las entradas nuevas van **arriba**. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/)
y [Conventional Commits](https://www.conventionalcommits.org/). Fechas en `YYYY-MM-DD`.

Proyecto pre-1.0: se sube versión **minor** al cerrar un hito o batch de features y **patch** en
fixes y adiciones chicas.

## [Unreleased]

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
