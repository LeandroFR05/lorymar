# Tareas 003 — Roles de usuario en Supabase Auth

**Spec:** `specs/003-user_roles/spec.md`
**Plan:** `specs/003-user_roles/plan.md`

Orden estricto. Sin código de aplicación: ninguna tarea toca `src/`; `node --test` corre solo como regresión (T6). Antes de T1, leer la spec, el plan y `MEMORY.md`. Credenciales y tokens de las cuentas de prueba viven en la conversación, nunca en el repo.

- [x] **T1. Migración de grants y políticas.** — RF-1, RF-5 a RF-13, RNF-1, RNF-2
  - Archivo: `supabase/migrations/<versión>_user_roles_policies.sql` (usar la versión que asigne Supabase, como en 001 y 002), con el contenido del punto 3 del plan: grants (3.1), dos políticas de lectura del anónimo (3.2), seis de lectura del cliente espejo de las de `anon` (3.3) y seis `*_admin_all` por claim envuelto en `(select auth.jwt() -> 'app_metadata' ->> 'role')` (3.4).
  - Cómo: anotar los conteos 4/3/7/9/11/2; confirmar nombres de secuencias con `pg_get_serial_sequence`; aplicar con el MCP de Supabase (`apply_migration`, `name: user_roles_policies`) y guardar el archivo en el repo con la versión asignada.
  - Hecho cuando: la migración aplica sin error; `pg_policies` muestra 18 políticas (4 de la 002 intactas + 14 nuevas) y ninguna de escritura `to anon`; `information_schema.role_table_grants` da `select` a `anon` y `authenticated` en las 6 tablas, `insert/update/delete` solo a `authenticated`, y `usage_privileges` el uso de las 6 secuencias a `authenticated`; `truncate` sigue sin grants; `get_advisors` no reporta `rls_disabled_in_public`; los conteos no cambian y `supabase migration list --remote` coincide con el repo.

- [x] **T2. Verificación sin sesión (rol anónimo).** — RF-6, RF-13, RNF-3
  - Método: `begin; set local role anon; …; rollback;` con el MCP (`execute_sql`) y una petición REST con la clave pública del `.env` local contra `/rest/v1/<tabla>`.
  - Hecho cuando: las 6 tablas devuelven filas; `aromas` devuelve los 3 completos; `pictures` devuelve las 2 de presentaciones visibles y una imagen de prueba con su presentación, variedad o producto marcado con `deleted_at` (en transacción revertida) queda oculta; insert, update y delete del anónimo fallan con error de permiso.

- [x] **T3. Verificación del cliente (registro abierto).** — RF-2, RF-3, RF-4, RF-10 a RF-12
  - Método: crear una cuenta por API (`POST /auth/v1/signup` con la clave pública), iniciar sesión (`POST /auth/v1/token?grant_type=password`) y consultar con su JWT; además suplantar en el editor SQL con `begin; set local role authenticated; select set_config('request.jwt.claims', '<json>', true); …; rollback;` usando `app_metadata` vacía, con `{"role":"customer"}` y con un valor desconocido (`{"role":"admni"}`).
  - Paso del usuario, solo si el proyecto pide confirmación de correo: confirmar el enlace de la cuenta de prueba.
  - Hecho cuando: la cuenta creada por API existe y es cliente sin claim (RF-4); lee las 6 tablas con exactamente la visibilidad del anónimo (mismas filas que T2, RF-12); su insert en cualquier tabla da error de política y su update/delete afectan cero filas (RF-11); `PUT /auth/v1/user` con `app_metadata` en el cuerpo no cambia su claim (RF-2); las tres suplantaciones se comportan igual que el cliente real: lecturas públicas y cero escritura (RF-3, solo el valor exacto `admin` abre la administración).

- [x] **T4. Verificación del administrador.** — RF-3, RF-5, RF-7, RF-8, RF-9
  - Pasos manuales del usuario: en el dashboard (Authentication → Users → cuenta de prueba → App metadata) asignar `{"role": "admin"}` y refrescar la sesión de la cuenta (salir y volver a entrar).
  - Método: REST con el JWT del admin. CRUD demo en orden por dependencias: crear y modificar una categoría y un aroma demo → producto demo → variedad → presentación (usando el aroma demo) → imagen; leer las 6 tablas y comparar contra T2 (deben verse las filas con `deleted_at` y las imágenes de presentaciones dadas de baja); baja lógica temporal de una presentación y su imagen (visible al admin, oculta al anónimo y al cliente); delete de la categoría demo en uso falla y delete del producto demo arrastra variedad, presentación e imagen; eliminar en orden inverso desvinculando antes (producto antes que la categoría demo; presentación antes que el aroma demo). Con el editor SQL, suplantar un token viejo con `app_metadata.role = 'admin'` tras quitar el claim en el dashboard para mostrar que seguía administrando.
  - Pasos manuales del usuario (cierre): quitar el claim de la cuenta y refrescar la sesión.
  - Hecho cuando: el admin lee las 6 tablas completas (más filas que el anónimo, RF-5) y crea, modifica y elimina filas en las 6 con identificadores automáticos (RF-7); las reglas de la 001 se cumplen (restrict y cascada, RF-8); la baja lógica funciona como modificación común (RF-9); tras quitar el claim y refrescar, la cuenta vuelve al comportamiento de cliente y el token anterior seguía administrando (caso límite del cambio de claim).

- [x] **T5. Limpieza.** — criterios finales de la spec
  - Hecho cuando: las filas demo de la verificación están eliminadas y los conteos vuelven a 4/3/7/9/11/2; no quedan filas de prueba con baja lógica; la cuenta auto-registrada queda a elección del usuario (puede borrarse desde el dashboard) y la del administrador se conserva; ningún token, correo ni contraseña quedó en el repo (RNF-4).

- [x] **T6. Regresión de la aplicación.** — RNF-7
  - Hecho cuando: `git status` no muestra cambios en `src/`; `npm run lint`, `node --test` y `npm run build` pasan; en DevTools la página de inicio carga el catálogo igual que antes (una petición, 9 tarjetas, filtro con 5 opciones) y la consola está limpia, también en vista móvil.

- [x] **T7. Cerrar la spec y documentos.** — RF: —, regla de `AGENTS.md`
  - Archivos: `specs/002-public_catalog/spec.md` (añadir al final el título `## Nota posterior (nov 2026)` con una frase inicial que diga que esta spec está implementada y sustituida en parte por la 003, seguida del texto literal de la sección "Nota posterior (pendiente de anotar en la spec 002)" de `specs/003-user_roles/spec.md`); eliminar la carpeta `specs/003-admin_users/`; en `specs/003-user_roles/spec.md` cambiar `Estado: aprobada` por `Estado: implementada`; actualizar `MEMORY.md` (claims sin tablas, 18 políticas, limitación del refresco del token, sin frontend, cuenta del dueño).
  - Hecho cuando: la nota está al final de la 002 como la de la 001 en su momento; la carpeta stub no existe; la spec 003 dice `implementada`; `MEMORY.md` resume el estado y las decisiones sin credenciales; `supabase migration list --remote` coincide con el repo.

## Notas

- 7 tareas: la 003 es una migración de permisos sobre tablas existentes, no una de estructura; por eso una sola migración y la verificación por rol repartida en T2 (anónimo), T3 (cliente) y T4 (admin).
- T3 y T4 dependen de pasos manuales del usuario en el dashboard (asignar y quitar `{"role": "admin"}`, confirmar correo si hace falta): el coordinador los pide de uno en uno y vuelve al implementer con el resultado.
- Sin `node --test` nuevo: no se escribe JavaScript en esta spec; la suite existente solo confirma que nada se rompió (RNF-7).
- La nota de la 002 no se escribe de cero: se copia literal de la spec 003, ya aprobada, para no perder matices.
