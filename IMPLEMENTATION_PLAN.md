# Plan de implementación — Web app de tareas (MVP por fases)

> **Alcance y no-objetivos:** `cooked-ideas/que-entra-en-el-mvp-de-la-web-app-de-tareas.md`
> **Arquitectura de referencia:** `ARCHITECTURE_TEMPLATE.md`
> **Convenciones del repo:** `AGENTS.md`

Este plan convierte las decisiones del grill en fases ejecutables. Cada fase tiene un
**entregable verificable** y un **gate de salida**: no se avanza a la siguiente sin
cumplirlo. Cada fase cierra con `/update-docs-and-commit`.

---

## 0. Resumen

**Objetivo del MVP:** una web app donde un equipo chico (2–5 personas, sin roles) comparte
una única lista de tareas en tiempo real: crear, ver, completar, editar y borrar; con
descripción y fecha límite; alta por código de invitación y un responsable por tarea.

**Supuestos fijados** (si alguno cambia, avisar antes de arrancar la fase afectada):

- El código vive en `app/` (raíz = tooling del repo, no de la app).
- **Un solo equipo visible por instancia.** El schema soporta varios, pero la UI no los expone.
- **Auth client-side** (`AuthGuard` + `ConvexAuthProvider`), como en la plantilla — sin middleware de Next.
- **Sin roles ni permisos**: autenticado = puede todo dentro de su equipo.
- **Sin deadline**: el cierre real es el criterio conductual (Fase 6).

| Fase | Nombre | Entregable verificable | Depende de |
| --- | --- | --- | --- |
| 0 | Bootstrap | `app/` levanta `dev`, `build` y `test` en verde | — |
| 1 | Identidad base | registro + login + logout y ruta protegida | 0 |
| 2 | Tareas (**hito usable**) | CRUD de tareas en una lista compartida en tiempo real | 1 |
| 3 | Equipo y colaboración | dos usuarios comparten la lista, invitan y asignan | 2 |
| 4 | Auth completa | verificación de email + reset de contraseña end-to-end | 3 + proveedor de email |
| 5 | Atributos y pulido | descripción, fecha límite, cuenta y responsive | 2, 3 |
| 6 | Calidad y cierre | E2E + docs + deploy + equipo usándola 1 semana | 4, 5 |

---

## 1. Principios de ejecución

1. **Vertical slices.** Cada fase deja algo que se puede usar y mostrar, no una capa a medias.
2. **Contract-first.** Primero schema y firmas de queries/mutations; después la UI. Si cambia el
   contrato, se actualiza el schema en el mismo commit.
3. **Lógica de negocio en Convex.** Los componentes no calculan ni persisten: leen `useQuery` y
   llaman `useMutation`.
4. **Gate por fase.** El criterio de salida se verifica a mano antes de seguir (incluye el flujo
   E2E de esa fase en verde).
5. **No-objetivos congelados.** Nada de la lista de "fuera" entra sin reabrir la nota de decisiones.

---

## 2. Decisiones técnicas (ya tomadas)

| Tema | Decisión |
| --- | --- |
| Framework | Next.js 16 App Router + React 19, en `app/` |
| Backend/DB | Convex (reactivo), `convex/` dentro de `app/` |
| Auth | `@convex-dev/auth`, provider `Password` |
| UI | Tailwind v4 + shadcn/ui (`base-nova`, `neutral`), lucide-react |
| Tema | `next-themes` |
| Unit tests | Vitest + Testing Library + jsdom (`convex-test` para backend en Fase 6) |
| E2E | Playwright (se inicializa en Fase 0, crece por fase) |
| Docs | Markdown: `docs/changelog.md`, `docs/architecture.md`, `docs/project_status.md` |
| Commits | Conventional Commits en español; prohibido `push`; sin secretos ni `.env*` |

**Gotchas que el plan asume resueltos** (de `AGENTS.md`): `JWT_PRIVATE_KEY` siempre multilínea con
`npx convex env set VAR -- "$(cat archivo)"`; re-setear `JWKS` a juego; `npx convex dev --once`
tras cambiar env vars; dedupe de usuarios por email; autocuración de cookies `__session` viejas.

---

## 3. Modelo de datos (borrador — se cierra en Fase 2)

`app/convex/schema.ts`:

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

- Se **omite** la tabla `user_roles` (`pending`/`active`) de la plantilla: no hay aprobación por
  admin ni roles. El control de acceso es "ser miembro del equipo".
- `description` y `dueDate` entran al schema desde Fase 2 aunque su UI completa llegue en Fase 5.
- `assigneeId` se modela desde Fase 2; la UI de asignación llega en Fase 3.
- **Nunca** `unique()` sobre `email` sin dedupe previo (gotcha conocido).

---

## 4. Rutas y capas

```
app/convex/
  schema.ts        # tablas + índices
  auth.ts          # convexAuth({ providers: [Password] })
  auth.config.ts   # config de dominio
  http.ts          # endpoints (emails en Fase 4)
  queries.ts       # solo lectura: listTasks, getMyTeam, getTeamMembers
  mutations.ts     # escritura: createTask, toggleComplete, updateTask, deleteTask, joinTeam, assignTask
  teams.ts         # helpers de equipo/invitación
  emails.ts        # envío transaccional (Fase 4)

app/src/app/
  layout.tsx            # fonts, ThemeProvider, ConvexClientProvider, Header
  page.tsx              # lista de tareas (protegida por AuthGuard) ← única vista de tareas
  signin/ signup/       # Fase 1
  forgot-password/ reset-password/ verify-email/   # Fase 4
  join/[code]/          # Fase 3
  account/              # Fase 5

app/src/components/
  ui/                   # shadcn
  AuthGuard.tsx
  ConvexClientProvider.tsx
  Header.tsx
  tasks/                # TaskList, TaskItem, TaskComposer, AssigneePicker
```

---

## 5. Fases en detalle

### Fase 0 — Bootstrap y fundaciones

**Objetivo:** que `app/` exista, corra y tenga el tooling del stack objetivo.

**Tareas**

1. `npx create-next-app@latest app` (TypeScript, Tailwind, App Router, alias `@/*`).
2. `npm i convex @convex-dev/auth @auth/core` dentro de `app/`; `npx convex dev` para crear `convex/`.
3. `npx shadcn init` (`base-nova`, base `neutral`) y agregar: `button`, `input`, `textarea`,
   `card`, `checkbox`, `label`, `dialog`, `avatar`, `sonner` (o el set mínimo).
4. `npm i next-themes clsx tailwind-merge lucide-react`.
5. Vitest + Testing Library + jsdom (`vitest.config.ts`, `src/test/setup.ts`).
6. Inicializar Playwright (`npm init playwright@latest`) con `playwright.config.ts`.
7. Copiar `.env.example` → `app/.env.local` y ajustar `CONVEX_DEPLOYMENT`/URLs.
8. Crear `docs/` con plantilla base (`changelog.md`, `architecture.md`, `project_status.md`).
9. Crear los dos subagentes de proyecto (ver §6): `.opencode/agents/convex-dev.md` y
   `.opencode/agents/nextjs-ui-dev.md`.

**Gate de salida**

- `npm run dev`, `npm run build` y `npm test` en verde dentro de `app/`.
- `npx convex dev` arranca sin errores y el dashboard local abre.
- `npx playwright test` corre (suite vacía o smoke pasa).
- `git status` limpio tras el commit.

**Agentes:** main (orquestación), `explore` (verificar versiones/API), `nextjs-ui-dev` y
`convex-dev` (crear). **Commit:** `chore: bootstrappear app Next.js + Convex sobre la plantilla`

---

### Fase 1 — Identidad base (password)

**Objetivo:** un usuario puede registrarse, entrar, salir y ver una ruta protegida.

**Tareas**

1. `convex/schema.ts` con `...authTables`.
2. `convex/auth.ts` con `Password`; `convex/auth.config.ts`.
3. Setear env del deployment: `SITE_URL`, `JWT_PRIVATE_KEY` (multilínea, con `--`), `JWKS`.
4. `ConvexClientProvider.tsx` (con autocuración de cookie `__session` inválida) y `layout.tsx`
   con fonts + `ThemeProvider` + `Header`.
5. `AuthGuard.tsx` (`useConvexAuth()` → redirect a `/signin`).
6. Pantallas `/signin` y `/signup`; botón de logout en `Header`.
7. E2E `tests/auth.spec.ts`: registro, login, logout, acceso a `/` sin sesión redirige.

**Gate de salida**

- Registro → login → logout funciona en navegador; la sesión persiste al refrescar.
- `/` sin sesión redirige a `/signin`; con sesión muestra el shell.
- E2E de auth en verde. Sin `user_roles` ni pantallas de aprobación.

**Agentes:** `convex-dev`, `nextjs-ui-dev` (skill `vercel-react-best-practices`), `playwright-test-runner`.
**Commit:** `feat: autenticación con password (registro, login, logout)`

---

### Fase 2 — Dominio de tareas + **hito usable**

**Objetivo:** la app ya sirve. Un usuario registrado gestiona tareas y ve cambios en vivo.

**Tareas**

1. schema con `teams`, `memberships`, `tasks` (§3).
2. `teams.ts`: al primer login, crear equipo y membresía (equipo por defecto, código generado).
3. `mutations.ts`: `createTask`, `toggleComplete`, `updateTask`, `deleteTask`.
4. `queries.ts`: `listTasks` (reactiva, por equipo), `getMyTeam`.
5. UI en `page.tsx`: composer de creación, lista de abiertas, completadas abajo/tachadas,
   edición inline del título, borrado con confirmación, estado vacío y loading.
6. E2E `tests/tasks.spec.ts`: crear, completar, editar, borrar.

**Gate de salida (hito usable — antes de tocar emails)**

- Crear/completar/editar/borrar persiste y sobrevive al refresh.
- Dos pestañas abiertas: lo que pasa en una se ve en la otra **sin recargar** (reactividad).
- E2E de tareas en verde.

**Agentes:** `convex-dev`, `nextjs-ui-dev` (+ skill `vercel-react-best-practices`), `playwright-test-runner`.
**Commit:** `feat: CRUD de tareas con lista compartida en tiempo real`

---

### Fase 3 — Equipo y colaboración

**Objetivo:** dos personas distintas comparten la misma lista y se asignan tareas.

**Tareas**

1. `teams.ts`: `regenerateInviteCode`, `joinTeam(code)` (crea membresía; idempotente).
2. `queries.ts`: `getTeamMembers`, `getMyMembership`.
3. UI: ruta `/join/[code]`, panel de miembros con el código de invitación, `AssigneePicker`
   en cada tarea, mostrar nombre del responsable.
4. E2E `tests/collaboration.spec.ts`: usuario A invita y asigna; usuario B entra por el código y
   ve la tarea asignada en tiempo real.

**Gate de salida**

- A genera el código, B entra y **ve la misma lista**.
- A asigna una tarea a B; B la ve asignada sin recargar.
- Un tercero sin invitación **no** accede al equipo.
- E2E multiusuario en verde.

**Agentes:** `convex-dev`, `nextjs-ui-dev`, `playwright-test-runner`.
**Commit:** `feat: invitaciones por código y asignación de tareas`

---

### Fase 4 — Auth completa (verificación de email + reset)

**Objetivo:** cerrar el ciclo de vida de la cuenta, que es la parte más cara del alcance.

> **Bloqueante:** elegir proveedor de email transaccional (Resend / Postmark / SES) y, si aplica,
> dominio para DNS. No arrancar sin esto resuelto.

**Tareas**

1. Función de envío en `convex/emails.ts` (action, sin `ctx.db`) + `http.ts` si hace falta.
2. Flujo de **verificación de email** (alta → mail → link válido) con su página.
3. Flujo de **recuperación de contraseña** (`/forgot-password` → mail → `/reset-password`).
4. Confirmar API exacta en la doc de `@convex-dev/auth` antes de codear.
5. E2E con casilla de prueba: `tests/auth-completa.spec.ts`.

**Gate de salida**

- Registro dispara verificación; un email no verificado no puede operar (según definamos el gate).
- Reset de contraseña funciona end-to-end y la nueva contraseña sirve para entrar.
- E2E con proveedor de prueba en verde.

**Agentes:** `convex-dev`, `nextjs-ui-dev`, `playwright-test-runner`.
**Commit:** `feat: verificación de email y recuperación de contraseña`

---

### Fase 5 — Atributos y pulido

**Objetivo:** fecha límite, descripción y cuenta, con UI cuidada y responsive.

**Tareas**

1. UI de `description` y `dueDate` (date picker, sin hora) + indicador de vencimiento.
2. Pantalla `/account`: email, cambiar contraseña (si no quedó en Fase 4) y cerrar sesión.
3. Cabecera/layout final, tema claro/oscuro, estados vacíos y de error.
4. Responsive real (375 / 768 / desktop) y chequeos básicos de accesibilidad.
5. Dirección visual con el skill `frontend-design`.

**Gate de salida**

- Descripción y fecha límite se guardan y se muestran (con vencida/por vencer).
- Sin overflow ni elementos rotos en 375px; navegable por teclado en los flujos clave.
- Tema oscuro/claro consistente.

**Agentes:** `nextjs-ui-dev` (skills `frontend-design` + `vercel-react-best-practices`), `playwright-test-runner` (responsive).
**Commit:** `feat: descripción, fecha límite y pulido responsive`

---

### Fase 6 — Calidad, docs y cierre

**Objetivo:** suite consolidada, documentación al día y deploy, para poder declarar el MVP.

**Tareas**

1. Unit tests de backend con `convex-test` (mutations/queries), más Vitest de componentes.
2. Consolidar y estabilizar la suite E2E (auth, tareas, colaboración, auth completa, responsive).
3. `/update-docs-and-commit`: `changelog.md`, `architecture.md`, `project_status.md`.
4. Deploy (Vercel + Convex) y verificación en la URL pública.
5. Retrospectiva con `development-retrospective`.

**Gate de salida (criterio conductual — único resguardo sin deadline)**

- La app está **deployada y accesible por URL**.
- **Otra persona del equipo** (no vos) se registra, entra con el código de invitación, crea y
  completa una tarea desde su dispositivo.
- El equipo la **usa una semana** sin bloqueos. Ese es el "terminado", no la lista de features.

**Agentes:** `playwright-test-runner`, `changelog-updater`, `development-retrospective`.
**Commit:** `test: suite E2E y unit; docs: cierre del MVP`

---

## 6. Agentes de desarrollo

**Existentes (ya en el repo):**

| Agente | Cuándo usarlo en este plan |
| --- | --- |
| `playwright-test-runner` | Al cerrar cada fase con UI: crea/ejecuta E2E y reporta fallos con artifacts |
| `changelog-updater` | Al documentar un batch de features en `docs/changelog.md` |
| `development-retrospective` | Al terminar Fase 6 (y opcionalmente Fase 2, el hito usable) |
| `explore` | Fases 0 y 4: verificar APIs/versiones de Next 16, Convex Auth y shadcn |
| `general` | Trabajo paralelo independiente (ej: E2E mientras se pule UI) |

**A crear en Fase 0** — `.opencode/agents/<id>.md`, formato de los existentes
(frontmatter `description` + `mode: subagent`, sin `model` para heredar el del agente que invoca):

- **`convex-dev`** — *"Implementa y modifica el backend Convex: schema, índices, queries,
  mutations y actions, siguiendo los patrones de `ARCHITECTURE_TEMPLATE.md` (reading vs writing,
  sin lógica pesada en componentes, `ctx.runQuery`/`ctx.runMutation` en actions). Nunca usa
  `unique()` sin dedupe. Actualiza índices cuando agrega queries filtradas."*
- **`nextjs-ui-dev`** — *"Implementa UI en Next.js App Router con Tailwind + shadcn/ui
  (base-nova/neutral), accesible y responsive. Consume Convex con `useQuery`/`useMutation` y no
  duplica lógica de negocio. Aplica los skills `vercel-react-best-practices` y `frontend-design`
  cuando correspondan."*

**Flujo por fase:** `convex-dev` + `nextjs-ui-dev` construyen → `playwright-test-runner` valida →
gate → `/update-docs-and-commit` → siguiente fase.

---

## 7. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- |
| Email transaccional (Fase 4) traba el arranque | Alta | Alto | Ya está secuenciado **después** del hito usable; usar proveedor de prueba; resolver la decisión antes de abrir la fase |
| Scope creep por no haber deadline | Alta | Alto | No-objetivos congelados; no abrir features nuevas antes de cruzar el gate de Fase 6 |
| `JWT_PRIVATE_KEY` en una línea rompe el login | Media | Alto | Setear siempre multilínea con `--`; re-setear `JWKS`; `npx convex dev --once` |
| Usuarios duplicados por email | Media | Medio | Dedupe antes de operar; evitar `unique()` sobre email |
| Cookies `__session` de deployments previos | Media | Medio | Autocuración en `ConvexClientProvider` (Fase 1) |
| Next 16 / React 19 / Tailwind v4 vs shadcn | Media | Medio | Verificar en Fase 0 con `explore` antes de construir UI |
| Multi-equipo "por si acaso" | Baja | Alto | Fuera del MVP; el schema lo soporta si algún día se reabre |
| Local vs cloud (deployment distinto por entorno) | Media | Medio | Fijar en Fase 6 y documentar en `.env.example`/`architecture.md` |

---

## 8. Decisiones abiertas (bloquean fases)

1. **Proveedor de email transaccional** → bloquea Fase 4. ¿Cuál y hay dominio?
2. **Deploy** (Vercel + Convex cloud vs local) → bloquea Fase 6.
3. **Multi-equipo** → hoy asumido uno; si cambia, se reabre el schema antes de Fase 2.
4. **Tema claro/oscuro** → se asume ambos con `next-themes`; confirmar en Fase 5.

---

## 9. Cómo arrancar

Fase 0, en este orden: crear `app/` → Convex + auth → shadcn → Vitest/Playwright → `docs/` →
subagentes del proyecto. Al terminar, comitear con `chore: bootstrappear ...` y seguir con Fase 1.

**Primer corte de valor visible:** final de Fase 2 (hito usable, sin emails de por medio).
