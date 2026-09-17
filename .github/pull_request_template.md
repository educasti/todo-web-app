# Descripción

<!-- Qué cambia y por qué. Si cierra un issue, referenciarlo: Closes #123 -->

## Tipo de cambio

- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `refactor` / `perf` — sin cambio de comportamiento observable
- [ ] `docs` — documentación
- [ ] `chore` / `build` / `ci` — tooling, dependencias, infra
- [ ] BREAKING CHANGE — rompe compatibilidad

## Cómo probarlo

<!-- Pasos concretos para verificar el cambio -->
<!-- Si no hay tests automatizados, incluir la verificación manual hecha -->

1.
2.

## Checklist

- [ ] `npm test` pasa
- [ ] `npm run lint` y `npm run typecheck` sin errores
- [ ] `npm run build` compila
- [ ] No se commitean secretos ni `.env*`
- [ ] Docs actualizadas (`/update-docs-and-commit` o edición manual de `docs/`)
- [ ] `AGENTS.md` actualizado si cambió el stack, los comandos o las convenciones

## Notas para el reviewer

<!-- Migraciones de schema, env vars nuevas, orden de deploy, riesgos -->
