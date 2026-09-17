# ¿Qué entra y qué queda fuera del MVP de la web app de gestión de tareas?

Started: 2026-09-16
Status: done

## Angles to cover
- [x] Usuario y caso de uso (personal vs equipos) → equipos chicos de confianza, sin roles
- [x] Núcleo mínimo (operaciones que hacen que la app sirva el día 1) → crear, listar compartida, completar, editar, borrar
- [x] Autenticación (dentro o fuera del MVP) → entra completa: signup, login, verificación de email y reset de contraseña
- [x] Colaboración (compartir, asignar, multiusuario) → un espacio compartido, visible para todos, un responsable por tarea, alta por código/link; sin comentarios ni actividad
- [x] Tiempo real / offline → tiempo real sí (reactividad de Convex, gratis); offline fuera del MVP
- [x] Atributos de la tarea (fechas, prioridad, etiquetas, subtareas) → entran descripción + fecha límite; fuera prioridad, etiquetas, subtareas, recurrencia, recordatorios
- [x] Pantallas e interacción mínima (vistas, mobile/responsive) → una sola vista de tareas + pantallas de auth + cuenta; responsive básico; sin app nativa
- [x] Criterio de "terminado" (deadline / presupuesto de tiempo) → sin deadline ni time-box; se propone cuidar el cierre con un criterio conductual ("el equipo la usa una semana")
- [x] No-objetivos explícitos → confirmados (ver Summary)

## Interview

### Usuario y caso de uso
**Q:** ¿Para quién es el MVP: uso personal o equipos?
**Claude's lean:** Personal / single-user — evita permisos, membresías y conflictos entre usuarios, que son lo que infla un MVP de tareas.
**Answer:** Equipos. (Respuesta contraria a mi inclinación; sube el peso de los ángulos de Auth y Colaboración.)

**Q (seguimiento):** ¿Qué tipo de equipo — equipo chico y de confianza (2–5 personas, todos ven todo) u organización con roles y permisos?
**Claude's lean:** Equipo chico y de confianza — mantiene el MVP acotado; roles/permisos es preocupación de producto maduro.
**Answer:** Equipo chico y de confianza. Sin roles ni permisos granulares en el MVP.

### Núcleo mínimo
**Q:** ¿Qué operaciones tienen que existir para que la app sirva el día 1?
**Claude's lean:** Exactamente cinco: crear, ver la lista compartida, completar, editar título y borrar. Todo lo demás (filtros, orden, búsqueda) es conveniencia, no núcleo.
**Answer:** De acuerdo, esas cinco.

### Autenticación
**Q:** ¿Entra auth en el MVP y qué tan mínima?
**Claude's lean:** Sí, mínima: email + password con `@convex-dev/auth`, sin verificación de email ni recuperación de contraseña (postergables sin rehacer nada).
**Answer:** Completa — incluye verificación de email y reset de contraseña en el MVP. (⚠️ Aumenta el scope por encima de mi propuesta; emaileo transaccional y tokens entran al MVP.)

### Colaboración
**Q:** ¿Cómo se estructura la colaboración en el MVP (espacio, asignación, alta de miembros, extras)?
**Claude's lean:** Un único espacio compartido; todo visible para todos; un responsable por tarea; alta por código/link de invitación. Fuera: comentarios, historial, menciones, notificaciones.
**Answer:** De acuerdo con esa colaboración mínima.

### Tiempo real / offline
**Q:** ¿Cuánto exprimimos la reactividad de Convex y cuánto importa el offline?
**Claude's lean:** Tiempo real sí (viene casi gratis con las queries reactivas de Convex); offline fuera — la sync offline es cara y duplica la superficie de bugs.
**Answer:** De acuerdo: tiempo real sí, offline no.

### Atributos de la tarea
**Q:** ¿Qué campos lleva una tarea además del título?
**Claude's lean:** Solo descripción y fecha límite (sin hora). Fuera: prioridad (decorativa sin orden/filtros), etiquetas, subtareas, recurrencia y recordatorios.
**Answer:** De acuerdo: descripción + fecha límite.

### Pantallas e interacción mínima
**Q:** ¿Cuántas pantallas y el responsive es requisito?
**Claude's lean:** Una sola vista de tareas; pantallas de auth completas; una pantalla mínima de cuenta/salir; responsive básico (web, sin app nativa).
**Answer:** De acuerdo.

### Criterio de "terminado"
**Q:** ¿Hay deadline/presupuesto de tiempo y cómo se define que el MVP está terminado?
**Claude's lean:** Time-box de ~3 semanas a medio tiempo + definición conductual: deployado y usado por otra persona del equipo una semana.
**Answer:** Ninguno — sin deadline ni time-box. (⚠️ Sin fecha, el riesgo de scope creep sube; el único resguardo que queda es el criterio conductual de "terminado".)

### No-objetivos explícitos
**Q:** ¿Se confirma la lista de no-objetivos del MVP?
**Claude's lean:** Congelar toda la lista (roles/permisos, multi-espacio, multi-asignado, comentarios/actividad/notificaciones, offline, prioridad, etiquetas, subtareas, recurrencia, recordatorios, búsqueda/filtros/orden, otras vistas, app nativa, integraciones, adjuntos, export).
**Answer:** Confirmado.

## Summary

**Estado:** done — los 9 ángulos cubiertos, sin ángulos agregados mid-interview.

### Dónde quedó cada ángulo
1. **Usuario y caso de uso** → equipos chicos y de confianza (2–5), sin roles ni permisos.
2. **Núcleo mínimo** → cinco operaciones: crear, ver la lista compartida, completar, editar título, borrar.
3. **Autenticación** → entra **completa**: signup, login, verificación de email y reset de contraseña.
4. **Colaboración** → un único espacio compartido; todo visible para todos; un responsable por tarea; alta por código/link. Sin comentarios ni actividad.
5. **Tiempo real / offline** → tiempo real sí (reactividad de Convex); offline fuera.
6. **Atributos de la tarea** → descripción + fecha límite (sin hora). Fuera prioridad, etiquetas, subtareas, recurrencia, recordatorios.
7. **Pantallas e interacción** → una vista de tareas + pantallas de auth + cuenta; responsive básico; sin app nativa.
8. **Criterio de terminado** → **sin deadline ni time-box**.
9. **No-objetivos** → confirmados (roles/permisos, multi-espacio, multi-asignado, comentarios/actividad/notificaciones, offline, prioridad, etiquetas, subtareas, recurrencia, recordatorios, búsqueda/filtros/orden, otras vistas, app nativa, integraciones, adjuntos, export).

### Recomendación general (mi posición)
El **alcance es correcto y coherente**: los cortes están bien puestos, y los tres que más importan (sin roles/permisos, sin offline, sin subtareas) son justo los que habrían duplicado el trabajo. Como MVP de un equipo chico, esto se sostiene.

Dicho eso, **no es un MVP chico** y tiene dos decisiones que lo ponen en riesgo:

1. **Auth completa es la carga más pesada del alcance.** Verificación de email + reset arrastran configurar **email transaccional** (proveedor, DNS/dominio, plantillas) al *principio* del proyecto — una dependencia externa que no controlás y que suele trabar el arranque. Mi recomendación no es recortarla, sino **secuenciarla**: definí un hito interno "usable" con login por password donde el equipo ya crea y completa tareas, y recién después montá verificación/reset. Así la app se usa antes de que el email funcione.
2. **Sin deadline, el resguardo es el criterio de cierre.** Ya que no hay fecha, la única protección real contra el scope creep es el criterio conductual ("otra persona del equipo la usa una semana"). Tratalo como el finish line y resistí agregar features antes de cruzar ese umbral.

**En una frase:** congelá la lista de no-objetivos, construí en slices verticales y no toques prioridad/etiquetas/subtareas hasta que el equipo esté usando la v1 una semana.

### Preguntas abiertas antes de arrancar
- **Proveedor de email transaccional**: Convex Auth necesita uno (Resend, Postmark, SES…) para verificación y reset. ¿Cuál, y hay dominio propio?
- **Primer equipo/organización**: ¿cómo se crea la primera y quién genera el código de invitación? (¿el primer usuario registrado?)
- **Deploy**: ¿Vercel + Convex cloud, o se mantiene todo local con `CONVEX_AGENT_MODE=anonymous`?
- **Tema claro/oscuro**: `next-themes` está en el stack; decisión no tomada.
- **Multi-equipo**: se asumió **un solo equipo/instancia**. Si van a querer más de uno, cambia el schema y no es una decisión gratis.

