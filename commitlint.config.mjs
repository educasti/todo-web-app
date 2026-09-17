/**
 * Commitlint — Conventional Commits.
 * Tipos: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Los mensajes van en español: no forzamos minúscula inicial ni
    // prohibimos mayúsculas al inicio (sentence-case) como hace el default.
    "subject-case": [0],
    // El cuerpo y los pies suelen traer rutas, URLs y bloques de código largos.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
