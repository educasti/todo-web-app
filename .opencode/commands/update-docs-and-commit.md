---
description: Sincroniza docs/changelog.md, docs/architecture.md y docs/project_status.md con los cambios de git, y commitea todo
---

Ejecuta el flujo de documentación del repo sobre los cambios actuales:

1. Revisa `git status` y el diff (staged + unstaged) para entender qué cambió y por qué.
2. Actualiza `docs/changelog.md` con entradas de lo agregado/cambiado/corregido (nuevas arriba, fecha `YYYY-MM-DD`).
3. Actualiza `docs/architecture.md` **solo si hubo cambios estructurales** (stack, carpetas, schema, flujos). Si no, no lo toques.
4. Actualiza `docs/project_status.md`: mueve items completados y ajusta el progreso.
5. Toda la documentación es **Markdown**. Si `docs/` no existe, créalo con una plantilla base (`changelog.md`, `architecture.md`, `project_status.md`).
6. Muestra un resumen de lo documentado y luego stagea y commitea todo en **un solo commit** con un mensaje Conventional Commits en español (`docs: ...`).

Restricciones: no hagas `push`; no commitees secretos ni `.env*`; no borres entradas existentes del changelog.

Mensaje/descripción opcional del usuario: $ARGUMENTS
