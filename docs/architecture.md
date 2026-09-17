# Arquitectura

Documento vivo de la estructura, el stack y las convenciones del proyecto.
Para el detalle de la plantilla de referencia, ver `ARCHITECTURE_TEMPLATE.md` (raíz).

## Estado

Este repo es todavía una **plantilla**: no existe `app/`, `src/` ni `convex/`. El stack de abajo es
**objetivo/planificado**, no está instalado. El diseño del primer proyecto (MVP de gestión de
tareas) está decidido y planificado — ver `IMPLEMENTATION_PLAN.md`.

## Stack objetivo (no instalado)

- **Framework**: Next.js 16 (App Router, React 19)
- **Backend/DB**: Convex (base reactiva + funciones serverless en TypeScript)
- **Auth**: `@convex-dev/auth` con provider `Password`
- **Estilos**: Tailwind CSS v4 + shadcn/ui (`base-nova`, base `neutral`), lucide-react
- **Tema**: `next-themes`
- **Utils**: `clsx` + `tailwind-merge` (`cn()`)
- **Tests**: Vitest + Testing Library + jsdom; E2E con Playwright

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
├── .opencode/                # definiciones nativas de OpenCode (las activas)
│   ├── agents/               # changelog-updater, development-retrospective, playwright-test-runner
│   └── commands/             # update-docs-and-commit
└── .claude/                  # assets originales de Claude Code
    ├── agents/               # equivalente a .opencode/agents — OpenCode NO lee esta carpeta
    ├── commands/             # OpenCode NO lee esta carpeta
    └── skills/               # frontend-design, vercel-react-best-practices (OpenCode SÍ los descubre)
```

## Estructura objetivo de la app (`app/`)

Todo el código de un proyecto real vive en `app/`:

```
app/
├── convex/
│   ├── schema.ts        # tablas + índices
│   ├── auth.ts          # convexAuth() con providers
│   ├── auth.config.ts   # config de dominio para auth
│   ├── http.ts          # HTTP endpoints de Convex (webhooks, emails)
│   ├── queries.ts       # queries (lecturas reactivas)
│   ├── mutations.ts     # mutations (escrituras)
│   └── seed.ts          # datos semilla
├── src/
│   ├── app/             # App Router: cada carpeta = ruta
│   ├── components/
│   │   ├── ui/          # componentes shadcn
│   │   ├── AuthGuard.tsx
│   │   ├── ConvexClientProvider.tsx
│   │   └── Header.tsx
│   ├── hooks/           # hooks custom
│   ├── lib/             # utils (cn() y helpers)
│   └── test/            # setup de Vitest
├── components.json      # config shadcn
├── vitest.config.ts
└── package.json
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
  `NEXT_PUBLIC_CONVEX_URL`, con autocuración de cookies `__session` inválidas.
- **`AuthGuard`**: client component con `useConvexAuth()` que redirige a `/signin` si no hay sesión.

## Gotchas conocidos

- `JWT_PRIVATE_KEY` mal seteado = login colgado. Setear siempre multilínea:
  `npx convex env set JWT_PRIVATE_KEY -- "$(cat ruta.pem)"` y re-setear `JWKS` a juego.
- Sign-ins repetidos pueden crear `users` duplicados por email y romper consultas con `unique()`.
- En local, httpActions y storage se sirven en `127.0.0.1:3210/3211`.
- BD 100% local sin cuenta cloud: `CONVEX_AGENT_MODE=anonymous npx convex dev`.

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
