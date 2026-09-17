# Arquitectura

Documento vivo de la estructura, el stack y las convenciones del proyecto.
Para el detalle de la plantilla de referencia, ver `ARCHITECTURE_TEMPLATE.md` (raíz).

## Estado

`app/` ya existe y corre (**Fase 0 del plan completada**): el stack de abajo está **instalado** y
verificado con `npm run build`, `npm test` y `npx playwright test` en verde. La app todavía no
tiene auth ni dominio de tareas — eso son las Fases 1 y 2 (ver `IMPLEMENTATION_PLAN.md`). El
esquema de datos del MVP sigue siendo **borrador** hasta cerrarse en la Fase 2.

## Stack (instalado en `app/`)

- **Framework**: Next.js 16.3.5 (App Router, React 19.2.8), TypeScript, alias `@/*`
- **Backend/DB**: Convex 1.46.0 (base reactiva + funciones serverless en TypeScript) en modo local
  anónimo (`CONVEX_AGENT_MODE=anonymous`)
- **Auth**: `@convex-dev/auth` 0.0.95 con provider `Password` (se cablea en Fase 1)
- **Estilos**: Tailwind CSS v4 + shadcn/ui (`base-nova`, base `neutral`), `lucide-react`.
  `shadcn` queda en `dependencies` (no en `devDependencies`) porque `src/app/globals.css`
  hace `@import "shadcn/tailwind.css"`: se resuelve en el build de estilos.
- **Tema**: `next-themes`
- **Utils**: `cn` (paquete `cn`, drop-in de `clsx` + `tailwind-merge`) reexportado en
  `src/lib/utils.ts`
- **Tests**: Vitest 3 + Testing Library + jsdom (unit) y Playwright + Chromium (E2E)
- **Gestor**: npm (lockfile propio en `app/package-lock.json`)

## Estructura del repo

```
.
├── AGENTS.md                 # fuente de verdad para agentes
├── CLAUDE.md                 # solo contiene @AGENTS.md
├── ARCHITECTURE_TEMPLATE.md  # plantilla de arquitectura de referencia
├── IMPLEMENTATION_PLAN.md    # plan del MVP por fases
├── LICENSE                   # MIT
├── .env.example              # plantilla de variables (copiar a app/.env.local)
├── package.json              # tooling del repo (husky + commitlint), NO de la app
├── commitlint.config.mjs     # Conventional Commits
├── .github/pull_request_template.md
├── .husky/commit-msg         # valida el mensaje de commit
├── docs/                     # documentación Markdown (fuente de verdad)
│   ├── changelog.md
│   ├── architecture.md
│   └── project_status.md
├── cooked-ideas/             # notas de decisiones (grill-me)
├── app/                      # app Next.js + Convex (Fase 0 completa, ver abajo)
├── .opencode/                # definiciones nativas de OpenCode (las activas)
│   ├── agents/               # changelog-updater, development-retrospective, playwright-test-runner, convex-dev, nextjs-ui-dev
│   └── commands/             # update-docs-and-commit
└── .claude/                  # assets originales de Claude Code
    ├── agents/               # equivalente a .opencode/agents — OpenCode NO lee esta carpeta
    ├── commands/             # OpenCode NO lee esta carpeta
    └── skills/               # frontend-design, vercel-react-best-practices (OpenCode SÍ los descubre)
```

## Estructura de la app (`app/`)

Todo el código vive en `app/`. Hoy solo existe el andamiaje de la Fase 0; los archivos de auth y
de tareas (`auth.ts`, `queries.ts`, `mutations.ts`, `AuthGuard.tsx`, …) llegan en las Fases 1–2.

```
app/
├── convex/
│   ├── schema.ts        # hoy vacío (defineSchema({})); tablas en Fase 2
│   ├── tsconfig.json
│   └── _generated/      # generado por Convex (gitignored)
├── src/
│   ├── app/             # App Router: layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   └── ui/          # componentes shadcn (button, input, card, dialog, …)
│   ├── lib/             # utils.ts (re-exporta cn) + utils.test.ts
│   └── test/            # setup.ts de Vitest
├── tests/               # specs E2E de Playwright (smoke.spec.ts)
├── public/
├── components.json      # config shadcn (style base-nova, base neutral)
├── vitest.config.ts     # excluye tests/** (los toma Playwright)
├── playwright.config.ts # webServer: npm run dev en :3000
├── next.config.ts       # turbopack.root fijado en app/
└── package.json         # scripts dev/build/test/test:e2e
```

## Estructura objetivo de rutas y capas (Fases 1–2)

```
app/
├── convex/
│   ├── auth.ts               # convexAuth({ providers: [Password] })
│   ├── auth.config.ts        # config de dominio para auth
│   ├── http.ts               # HTTP endpoints (emails, Fase 4)
│   ├── queries.ts            # solo lectura: listTasks, getMyTeam, …
│   ├── mutations.ts          # escritura: createTask, toggleComplete, …
│   └── teams.ts              # helpers de equipo/invitación
└── src/
    ├── app/                  # /, /signin, /signup, /join/[code], /account
    └── components/
        ├── AuthGuard.tsx
        ├── ConvexClientProvider.tsx
        ├── Header.tsx
        └── tasks/            # TaskList, TaskItem, TaskComposer, AssigneePicker
```

## Modelo de datos del MVP (borrador)

Diseño decidido para el MVP de tareas; se cierra durante la Fase 2 del plan.

```ts
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables, // users, authAccounts, authSessions, ...

  teams: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    createdAt: v.number(),
  }).index("by_inviteCode", ["inviteCode"]),

  memberships: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  tasks: defineTable({
    teamId: v.id("teams"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    assigneeId: v.optional(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_completed", ["teamId", "completed"]),
});
```

**Notas de diseño:**

- Se **omite** la tabla `user_roles` (`pending`/`active`) de la plantilla: el MVP no tiene roles ni
  aprobación por admin. El control de acceso es "ser miembro del equipo".
- Se asume **un solo equipo visible por instancia**; el schema soporta varios pero la UI no los expone.
- Auth **client-side** (`AuthGuard` + `ConvexAuthProvider`), sin middleware de Next.

## Patrones clave

### Convex

- **Schema** tipado con `defineTable` + `.index()` en todo campo por el que se filtre.
- **Actions** no tienen `ctx.db`: usar `ctx.runQuery`/`ctx.runMutation`.
- **Capas**: `queries.ts` solo lectura, `mutations.ts` escritura. Nada de lógica de negocio pesada
  en componentes.
- **Env vars se incrustan al empujar**: tras cambiarlas, correr `npx convex dev --once`.

### Frontend

- **`ConvexClientProvider`** envuelve la app con `ConvexAuthProvider` + `ConvexReactClient` desde
  `NEXT_PUBLIC_CONVEX_URL`, con autocuración de cookies `__session` inválidas (**Fase 1**).
- **`AuthGuard`**: client component con `useConvexAuth()` que redirige a `/signin` si no hay sesión
  (**Fase 1**).
- **`cn()`**: `src/lib/utils.ts` re-exporta `cn` del paquete `cn` (el drop-in de `clsx` +
  `tailwind-merge` que instala el preset `base-nova` de shadcn 4.x). Los componentes de `ui/`
  lo importan desde `@/lib/utils`.

### Tests

- **Unit (Vitest)**: `vitest.config.ts` usa `jsdom`, `globals: true` y setup en `src/test/setup.ts`;
  `exclude` incluye `tests/**` para no levantar los specs de Playwright con Vitest.
- **E2E (Playwright)**: `playwright.config.ts` corre Chromium y levanta `npm run dev` como
  `webServer` en `:3000`. Scripts: `npm test` (unit) y `npm run test:e2e` (E2E).

## Gotchas conocidos

- `JWT_PRIVATE_KEY` mal seteado = login colgado. Setear siempre multilínea:
  `npx convex env set JWT_PRIVATE_KEY -- "$(cat ruta.pem)"` y re-setear `JWKS` a juego.
- Sign-ins repetidos pueden crear `users` duplicados por email y romper consultas con `unique()`.
- En local, httpActions y storage se sirven en `127.0.0.1:3210/3211`.
- BD 100% local sin cuenta cloud: `CONVEX_AGENT_MODE=anonymous npx convex dev`. Ojo: el
  `CONVEX_DEPLOYMENT=local:local-...` de `.env.example` **rompe** ese modo (el CLI intenta resolverlo
  y pide login); hay que quitar la línea de `.env.local` y dejar que Convex la complete como
  `anonymous:anonymous-agent`.
- La raíz del repo y `app/` tienen cada uno su `package-lock.json`; `next.config.ts` fija
  `turbopack.root` en `app/` para silenciar el warning.
- `npx create-next-app`/`next dev` de Next 16 generan `app/AGENTS.md` y `app/CLAUDE.md`
  (agent-rules); se commitean para no dejar el árbol sucio.

## Convenciones

- **Español** en UI, docs y commits.
- **Commits**: Conventional Commits (validado por husky + commitlint); asuntos en español.
- **Documentación**: Markdown en `docs/`, mantenida por `/update-docs-and-commit`.
- **Secretos**: nunca commitear `.env*` ni secretos.
- Las variables de Convex Auth (`SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`) se setean en el deployment
  con `npx convex env set`, no en `.env.local`.

## Referencias

- `ARCHITECTURE_TEMPLATE.md` — stack y estructura de referencia.
- `IMPLEMENTATION_PLAN.md` — fases de implementación del MVP.
- `cooked-ideas/que-entra-en-el-mvp-de-la-web-app-de-tareas.md` — alcance y no-objetivos del MVP.
