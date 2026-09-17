# Tareas (app)

App de tareas compartidas por equipo: Next.js 16 (App Router, React 19) + Convex
como backend reactivo. Este directorio `app/` es el workspace de la aplicación.

## Requisitos

- Node 20+ y npm
- Sin cuenta cloud: el backend corre en modo local anónimo

## Cómo correr

```bash
cd app
npm install
CONVEX_AGENT_MODE=anonymous npx convex dev --once  # genera convex/_generated
npm run dev    # Next.js en http://localhost:3000
```

El backend es **Convex en modo local anónimo** (`CONVEX_AGENT_MODE=anonymous`).
Ojo: `.env.example` trae un `CONVEX_DEPLOYMENT=local:local-...` que rompe ese modo
(el CLI pide login); hay que quitar esa línea de `.env.local` y dejar que Convex la
complete como `anonymous:anonymous-agent`. Ver `AGENTS.md` (gotchas de Convex).

## Verificación

```bash
npm test              # unit (Vitest)
npm run test:e2e      # E2E (Playwright)
npm run typecheck     # next typegen + tsc --noEmit
npm run lint          # ESLint
npm run build         # build de Next
```

Más detalle de arquitectura, stack y convenciones: `../docs/architecture.md` y
`../AGENTS.md`.
