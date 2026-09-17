# AGENTS.md — Plantilla Web App (Next.js + Convex)

Guía para agentes/IA que trabajen en este repo.

## Estado actual: plantilla, no una app

**Acá todavía no hay aplicación ejecutable.** El repo solo contiene convenciones, tooling de git y la arquitectura de referencia. Verificado a la fecha:

- No existen `app/`, `src/`, `convex/`, `docs/`, ni un `README`.
- No hay CI (`.github/` solo tiene `pull_request_template.md`).
- El código de un proyecto real irá en `app/` (ver "Arrancar un proyecto nuevo").
- El stack de abajo es **objetivo/planificado**, no está instalado ni hay comandos de app que corran hoy.

Referencia de arquitectura completa: `ARCHITECTURE_TEMPLATE.md`.

## Qué hay aquí

```
.
├── AGENTS.md                 # este archivo (fuente de verdad para agentes)
├── CLAUDE.md                 # solo contiene @AGENTS.md
├── ARCHITECTURE_TEMPLATE.md  # stack, estructura y patrones de referencia
├── LICENSE                   # MIT
├── .env.example              # plantilla de variables (copiar a app/.env.local)
├── package.json              # tooling del repo, NO el de la app: husky + commitlint
├── package-lock.json
├── commitlint.config.mjs     # Conventional Commits
├── .github/pull_request_template.md
├── .husky/commit-msg         # valida el mensaje de commit
├── .opencode/                # definiciones nativas de OpenCode (las activas)
│   ├── agents/               # changelog-updater, development-retrospective, playwright-test-runner
│   └── commands/             # update-docs-and-commit
└── .claude/                  # assets originales de Claude Code
    ├── agents/               # equivalente a .opencode/agents — OpenCode NO lee esta carpeta
    ├── commands/             # OpenCode NO lee esta carpeta
    └── skills/               # frontend-design, vercel-react-best-practices (OpenCode SÍ los descubre)
```

## Tooling del repo (raíz)

El `package.json` de la **raíz** no es el de la app: solo declara git hooks (husky + commitlint). La app tendrá el suyo en `app/`.

```bash
npm install                               # instala tooling y activa el hook (prepare → husky)
npm run commitlint -- --edit <archivo>    # valida un mensaje suelto
npm run lint:commits                      # valida los commits de la rama vs origin/main
```

- **Formato obligatorio**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…), validado por el hook `commit-msg` en cada commit.
- `subject-case` está desactivado a propósito (los asuntos van en español). `body`/`footer-max-line-length` también. Se exige tipo y asunto no vacíos (header ≤ 100 caracteres).
- Si un commit válido es rechazado, verificar que `git config core.hooksPath` sea `.husky/_` (lo setea `npm install`). `.husky/_/` es generado y auto-ignorado.
- `npm run lint:commits` compara contra `origin/main`: sin remoto `origin` (o sin esa rama) el comando falla.
- `--no-verify` existe para emergencias, no como hábito.
- Al usar la plantilla (`git clone` / "Use this template"), correr `npm install` **una vez** en la raíz para activar el hook.

## Stack objetivo (no instalado)

Next.js 16 (App Router, React 19) · Convex (DB reactiva + funciones serverless TS) · `@convex-dev/auth` con provider `Password` · Tailwind CSS v4 + shadcn/ui (`base-nova`, base `neutral`) · lucide-react · Recharts (si hace falta) · Vitest + Testing Library + jsdom · `next-themes` · `clsx` + `tailwind-merge` (`cn()`).

Estructura y patrones detallados (schema, `AuthGuard`, `useRole`, `ConvexClientProvider`, capas `queries`/`mutations`, cache): ver `ARCHITECTURE_TEMPLATE.md`. No duplicar acá.

## Comandos de la app (solo tras crear `app/`)

```bash
npx convex dev                # backend Convex en modo dev (watch de convex/)
npm run dev                   # Next.js
npm test                      # vitest run
npm run lint
npm run build
npx shadcn add <componente>   # agrega componentes a src/components/ui/
```

Hoy **ninguno corre desde la raíz** (el `package.json` de la raíz no tiene estos scripts).

## Gotchas de Convex (aprendidos, no obvios)

- Los **actions** no tienen `ctx.db`: usar `ctx.runQuery`/`ctx.runMutation`. Igual los httpActions.
- La HTTP API distingue `/api/mutation` de `/api/action` (importa al llamar funciones por `fetch`).
- Las **env vars se incrustan al empujar**: tras cambiarlas hay que correr `npx convex dev --once` de nuevo.
- **`JWT_PRIVATE_KEY` mal seteado = login colgado.** Si se setea en una línea con espacios o padding inválido, la verificación del magic link muere (`atob: Invalid byte 61`) y el login queda en "cargando" infinito. Setear siempre multilínea: `npx convex env set JWT_PRIVATE_KEY -- "$(cat ruta.pem)"` (con `--`) y re-setear `JWKS` a juego.
- **Usuarios duplicados por email**: sign-ins repetidos pueden crear `users` duplicados y romper consultas con `unique() returned more than one result`. Dedupear antes de operar sobre ese email.
- En local, httpActions y storage se sirven en `127.0.0.1:3210/3211`; cookies `__session` de deployments previos causan `Can't parse refresh token` (conviene autocuración en `ConvexClientProvider`).
- BD 100% local sin cuenta cloud: `CONVEX_AGENT_MODE=anonymous npx convex dev` (datos → `npx convex export` / `import --replace-all`; dashboard en `npx convex dashboard`).

## Variables de entorno (`.env.local`, gitignored)

```
CONVEX_DEPLOYMENT=local:local-{team}-{project}
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211
```

Nunca commitear `.env*` ni secretos. `.env.example` (trackeado) es la plantilla: copiarlo a `app/.env.local` y ajustar. Las variables de Convex Auth (`SITE_URL`, `ADMIN_BOOTSTRAP_SECRET`, `JWT_PRIVATE_KEY`, `JWKS`) se setean en el deployment con `npx convex env set`, no en el archivo.

## Documentación

**La documentación real es Markdown**: `docs/changelog.md`, `docs/architecture.md` y `docs/project_status.md`, mantenidos por `/update-docs-and-commit` (y por los subagentes `.opencode/agents/*`, que asumen esos mismos paths). `docs/` todavía no existe: el flujo lo crea con plantilla base si falta.

> **Ojo:** `ARCHITECTURE_TEMPLATE.md` describe docs como HTML (`docs/*.html`). Eso es aspiracional y **no está cableado** — ningún comando ni agente lo lee. Seguir el flujo Markdown de `/update-docs-and-commit`.

`AGENTS.md` es el puntero para agentes y `CLAUDE.md` solo hace `@AGENTS.md`.

## Agentes, comandos y skills (OpenCode)

- **Agentes**: `.opencode/agents/<id>.md` — frontmatter `description` + `mode: subagent`; el cuerpo es el system prompt. Sin `model`: heredan el modelo del agente que los invoca.
- **Comandos**: `.opencode/commands/<id>.md` — el cuerpo es el template y `$ARGUMENTS` se expande. El `/update-docs-and-commit` local pisa al global de `~/.config/opencode/`.
- **Skills**: OpenCode descubre solo `.claude/skills/` (compatibilidad de proyecto), así que `frontend-design` y `vercel-react-best-practices` ya funcionan sin copiarlos. No hay `.opencode/skills/`.
- Los archivos de `.opencode/` son wrappers nativos de los originales de `.claude/`. Si editás un agente o comando, hacelo en `.opencode/` — OpenCode **no** lee `.claude/agents` ni `.claude/commands`.

## Convenciones

- Español en UI, docs y commits.
- No commitear secretos ni `.env*`.
- Mantener consistencia con el estilo ya definido (tipografías mono, paleta, textos decorativos tipo `// comentario` y `[brackets]` si aplica).
- Si cambia el stack, los comandos o las convenciones, actualizar este archivo **en el mismo commit**.

## Arrancar un proyecto nuevo desde esta plantilla

1. `npx create-next-app@latest` (TypeScript + Tailwind + App Router) dentro de `app/`.
2. `npm install convex @convex-dev/auth @auth/core` y `npx convex dev` para inicializar `convex/`.
3. Copiar los patrones de `auth.ts`, `auth.config.ts`, `schema.ts` (`user_roles`) y el flujo `AuthGuard` + `useRole` desde `ARCHITECTURE_TEMPLATE.md`.
4. `npx shadcn init` con `base-nova` / `neutral` y agregar componentes según necesidad.
5. Adaptar `schema.ts` al dominio del proyecto (tablas propias).
6. Crear `docs/changelog.md` + `docs/project_status.md` (los crea `/update-docs-and-commit`).

## Licencia

MIT (`LICENSE`, © 2026 Eduardo Castillo). Si el proyecto derivado necesita otra licencia, reemplazar el archivo — es un template, no una obligación.

## Pendientes de la plantilla

- [x] LICENSE (MIT)
- [x] `.env.example`
- [x] Template de PR (`.github/pull_request_template.md`)
- [x] commitlint + husky
- [x] Agentes y comandos nativos en `.opencode/` (skills auto-descubiertos desde `.claude/skills`)
- [ ] `app/` con el primer proyecto real
- [ ] `docs/` Markdown (se crea con el primer proyecto real / `/update-docs-and-commit`)
- [ ] Tests E2E con Playwright — ya existe el subagente `playwright-test-runner`, falta configurar la suite.
