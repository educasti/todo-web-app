# Estado del proyecto

Actualizado: 2026-09-16

## Resumen

El repo es una **plantilla** (Next.js + Convex): no hay aplicación ejecutable todavía. El primer
proyecto —una web app de gestión de tareas para equipos chicos— está **decidido y planificado**,
pero no implementado.

**Fase actual:** plantilla completa + MVP planificado. Próximo paso: Fase 0 (bootstrap de `app/`).

## DONE

- [x] `LICENSE` (MIT) e `.env.example`.
- [x] Plantilla de PR (`.github/pull_request_template.md`).
- [x] commitlint + husky (Conventional Commits validado por hook).
- [x] `AGENTS.md` alineado al estado real y `ARCHITECTURE_TEMPLATE.md` como referencia.
- [x] Agentes y comandos nativos en `.opencode/` (wrappers de `.claude/`).
- [x] Skills `frontend-design` y `vercel-react-best-practices` auto-descubiertos desde `.claude/skills`.
- [x] Decisión de alcance del MVP (nota en `cooked-ideas/`).
- [x] Plan de implementación por fases (`IMPLEMENTATION_PLAN.md`).
- [x] `docs/` Markdown (`changelog.md`, `architecture.md`, `project_status.md`).

## TODO

### MVP de gestión de tareas — por fase

- [ ] **Fase 0** — Bootstrap: `app/` con Next.js + Convex + shadcn + Vitest + Playwright.
- [ ] **Fase 1** — Identidad base: registro, login, logout y ruta protegida.
- [ ] **Fase 2** — CRUD de tareas en lista compartida en tiempo real (**hito usable**).
- [ ] **Fase 3** — Equipo y colaboración: invitaciones por código y asignación.
- [ ] **Fase 4** — Auth completa: verificación de email y reset de contraseña.
- [ ] **Fase 5** — Descripción, fecha límite, cuenta y pulido responsive.
- [ ] **Fase 6** — Calidad, docs y deploy (cierre conductual: el equipo la usa 1 semana).

### Infraestructura y decisiones

- [ ] Configurar la suite E2E de Playwright (hoy solo existe el subagente).
- [ ] Definir proveedor de email transaccional — **bloquea Fase 4**.
- [ ] Decidir deploy (Vercel + Convex cloud vs local) — **bloquea Fase 6**.
- [ ] Confirmar multi-equipo (hoy asumido: un solo equipo por instancia).
- [ ] Confirmar tema claro/oscuro (se asume ambos con `next-themes`).

## Progreso

| Área | Estado |
| --- | --- |
| Plantilla / tooling del repo | Completo |
| Documentación base | Completo |
| Decisiones de producto (MVP) | Completo |
| Plan de implementación | Completo |
| Código de la app (`app/`) | No comenzado |
