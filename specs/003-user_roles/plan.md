# Plan 003 — Roles de usuario en Supabase Auth

**Spec:** `specs/003-user_roles/spec.md` (aprobada, con sus 4 defaults)
**Estado:** pendiente de implementar
**Fecha:** 25 nov 2026

## 1. Alcance

Una sola migración de grants y políticas sobre las seis tablas del catálogo, la nota posterior en la spec 002, la limpieza del borrador descartado y la verificación por rol con cuentas de prueba. Sin tablas nuevas, funciones ni triggers: el rol vive en el claim `role` de `app_metadata` (Supabase Auth), asignado a mano desde el dashboard. Sin una línea de `src/` (RNF-7): `node --test` queda solo como regresión.

Base: proyecto `lorymar_db`; RLS ya activa en las seis tablas (migración `20261123135222`), cuyas políticas `to anon` de las cuatro tablas legibles no se tocan.

## 2. Archivos

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `supabase/migrations/<versión>_user_roles_policies.sql` | crear | Grants de lectura/escritura y de secuencias; políticas de lectura de `anon` (aromas e imágenes) y de `authenticated` (las seis) y de admin por claim | RF-1, RF-5 a RF-13, RNF-1, RNF-2 |
| `specs/002-public_catalog/spec.md` | modificar | Nota posterior al final (sustituciones parciales de RF-30, RF-31, RF-33, RF-37, RNF-3, el criterio de lectura y el punto de "Fuera de alcance") | — |
| `specs/003-admin_users/` | eliminar | Stub del borrador descartado (perfiles + membresía) | — |
| `specs/003-user_roles/spec.md` | modificar | Una línea: `Estado:` de `aprobada` a `implementada` al cerrar | — |
| `MEMORY.md` | modificar | Estado y decisiones al terminar (regla de `AGENTS.md`) | — |

No se toca `src/`, `package.json` ni las migraciones de 001/002.

## 3. Contenido de la migración

Archivo `user_roles_policies.sql`, aplicado con el MCP de Supabase (`apply_migration` vía `execute`, `name: user_roles_policies`) y guardado en el repo con la versión que asigne Supabase, como en 001 y 002. Sin `alter table`: RLS ya está activa.

### 3.1 Grants (RF-13, RNF-1)

```sql
grant select on table public.aromas, public.pictures to anon;  -- nuevas para el anónimo

grant select on table
  public.categories, public.aromas, public.products,
  public.varieties, public.presentations, public.pictures
to authenticated;                                             -- lectura del cliente y del admin

grant insert, update, delete on table
  public.categories, public.aromas, public.products,
  public.varieties, public.presentations, public.pictures
to authenticated;                                             -- solo el admin pasa RLS

grant usage on sequence
  public.categories_id_seq, public.aromas_id_seq, public.products_id_seq,
  public.varieties_id_seq, public.presentations_id_seq, public.pictures_id_seq
to authenticated;                                             -- inserts del admin (identificadores identity)
```

- `truncate` no se otorga: sigue revocado desde la 002 (RNF-1). El anónimo no recibe escritura ni secuencias.
- Confirmar los nombres de secuencia con `pg_get_serial_sequence('public.<tabla>', 'id')` antes de escribir la migración.

### 3.2 Políticas de lectura del anónimo (RF-6, RF-13)

Dos nuevas; las cuatro de la 002 quedan intactas:

- `aromas_select_anon` sobre `aromas`: `for select to anon using (true)` — aromas completos; la tabla no tiene baja lógica, como las categorías (default 4).
- `pictures_select_anon` sobre `pictures`: `for select to anon` con la cascada completa del RF-36 de la 002:

```sql
using (exists (
  select 1
  from public.presentations pr
  join public.varieties v on v.id = pr.variety_id
  join public.products p on p.id = v.product_id
  where pr.id = pictures.presentation_id
    and pr.deleted_at is null
    and v.deleted_at is null
    and p.deleted_at is null
))
```

### 3.3 Políticas de lectura del cliente (RF-10, RF-12)

Seis políticas `for select to authenticated`, espejo exacto de las del anónimo (default 2: ni más ni menos): `categories_select_authenticated` y `aromas_select_authenticated` con `using (true)`; `products_select_authenticated` con `using (deleted_at is null)`; `varieties_select_authenticated` y `presentations_select_authenticated` con el `exists` explícito de los padres sin baja (copia literal de las de `anon` de la 002); `pictures_select_authenticated` con el mismo `exists` del punto 3.2.

### 3.4 Políticas del administrador (RF-3, RF-5, RF-7, RNF-2)

Seis políticas `for all to authenticated` (`<tabla>_admin_all`), una por tabla, con el claim envuelto en subconsulta (regla de rendimiento de la skill: una evaluación por sentencia, no por fila):

```sql
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
```

- `using` y `with check` idénticos cubren select, insert, update y delete en una sola política por tabla.
- El admin lee todo porque sus políticas se ORean con las del cliente; el cliente no escribe porque ninguna política de escritura lo incluye: su insert choca con el `with check` (error de política) y su update/delete afectan cero filas (RF-11).
- `auth.jwt()` devuelve el JWT firmado por el servicio: el claim no se falsifica desde el cliente (RF-2); `app_metadata` solo lo escriben el dashboard y el acceso de servicio.

### 3.5 Lo que la migración NO hace

No crea tablas, funciones, triggers ni columnas (RF-1); no modifica las políticas `to anon` de la 002 ni la revocación de `truncate`; no toca `auth.users` ni la configuración del registro.

## 4. Decisiones técnicas

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| Una sola migración | Grants y políticas son una unidad sin dependencias internas; se verifica por rol, no por tabla | Una por tabla: seis pasos sin verificación independiente |
| Rol en el claim de `app_metadata` | Decisión del usuario: cero objetos nuevos y claim de solo-servicio | Membresía + `security definer`: efecto inmediato, pero vuelve a tablas y funciones |
| Políticas separadas por rol (`*_select_anon`, `*_select_authenticated`, `*_admin_all`) | Espejo literal de la 002 y del default 2; una responsabilidad por política | Una política `to anon, authenticated`: mezcla roles y rompe el espejo con las cuatro de la 002, que no se tocan |
| Cliente = espejo exacto del anónimo | RF-10 y RF-12 se cumplen por construcción, incluida la cascada del RF-36 | Visibilidad propia del cliente: sin caso de uso y abre divergencias |
| Claim envuelto en `(select auth.jwt() -> …)` | La skill lo exige: sin el envoltorio la expresión se evalúa por fila | `auth.jwt()` directo en el `using` |
| `for all` con `using` = `with check` | Cuatro operaciones en una política por tabla, sin condiciones de fila para el admin | Una política por operación: 24 políticas sin ganancia |
| Grants de secuencias explícitos y por nombre | Los inserts del admin usan las secuencias `identity`; explícito no depende de los default privileges del proyecto | `on all sequences in schema public`: más amplio de lo necesario |
| Escritura con doble barrera | Grants solo a `authenticated` y RLS por claim; el anónimo sin grants ni políticas de escritura | Grants amplios a ambos roles y solo RLS: una sola barrera |
| Suplantación en el editor SQL para las pruebas | RNF-5: prueba políticas por rol sin tocar cuentas ni datos (`begin; set local role …; set_config('request.jwt.claims', …, true); rollback;`) | Crear o modificar cuentas para cada caso: ruido y riesgo |
| Nota posterior copiada de la spec 003 | La 003 ya la redactó y el usuario la aprobó; el formato replica la nota de la 001 | Redactarla de nuevo: riesgo de perder matices |

## 5. Estrategia de verificación

No hay sujeto nuevo para `node --test` (no se escribe JavaScript): la suite existente corre como regresión (RNF-7). Todo lo nuevo se verifica contra la base con dos métodos (RNF-5): REST con la clave pública y los JWT de las cuentas de prueba (`.env` local, nunca versionado) y el editor SQL del MCP con `begin; set local role <rol>; select set_config('request.jwt.claims', '<json>', true); …; rollback;`.

| Criterio de la spec | Método | Resultado esperado |
|---|---|---|
| Migración aplicada | `pg_policies`, `information_schema.role_table_grants` y `usage_privileges`, `get_advisors` | 18 políticas (4 de la 002 intactas + 14 nuevas); `select` a `anon` y `authenticated` en las 6; `insert/update/delete` y uso de secuencias solo a `authenticated`; `truncate` sin grants; sin `rls_disabled_in_public` |
| Sin sesión | `set local role anon` + REST con la clave pública | Las 6 lecturas con visibilidad pública; aromas completos; imágenes con cascada; toda escritura con error de permiso |
| Registro abierto | `POST /auth/v1/signup` con la clave pública y sesión con el JWT nuevo | La cuenta existe, es cliente sin claim y lee como el anónimo; sus escrituras no tienen efecto (RF-4, RF-10 a RF-12) |
| Cliente no toca su claim | `PUT /auth/v1/user` con `app_metadata` y su JWT | El claim no cambia (RF-2) |
| Admin (pasos del usuario) | Dashboard: Authentication → Users → cuenta de prueba → App metadata → `{"role": "admin"}`; refrescar sesión; REST con su JWT | Lee las 6 completas (incluidas bajas) y hace CRUD con las reglas de la 001, en orden por dependencias, con identificadores automáticos |
| Cambio de claim | Quitar el claim en el dashboard + suplantación con token viejo | Con el token nuevo vuelve a cliente; el anterior seguía administrando |
| Sin cambios en la app | `git status`, `npm run lint`, `node --test`, `npm run build`, DevTools | `src/` intacto; todo verde; la home igual que antes |

Limpieza final: borrar las filas demo y volver a los conteos 4/3/7/9/11/2; las cuentas quedan a elección del usuario (la auto-registrada no otorga nada, la del dueño se conserva); sin credenciales en el repo (RNF-4).

## 6. Cobertura de RF

| RF | Dónde |
|---|---|
| RF-1, RF-4 | Por omisión: la migración no crea nada y el registro no asigna claim (se comprueba en T3) |
| RF-2 | GoTrue solo acepta `app_metadata` del servicio; comprobación `PUT /auth/v1/user` (T3) |
| RF-3 | `*_admin_all`: la única llave es el valor exacto `admin` (T3 y T4) |
| RF-5 | `*_admin_all` sin condiciones de fila para el admin |
| RF-6 | Grants de `select` en `aromas`/`pictures` a `anon` + políticas 3.2 y 3.3 |
| RF-7 | Grants de escritura y secuencias a `authenticated` + `*_admin_all`; la integridad ya vive en las constraints de la 001 |
| RF-8 | Claves foráneas `restrict`/`cascade` de la 001 (sin política) |
| RF-9 | Columnas existentes; el admin usa `update` común (T4) |
| RF-10, RF-12 | `*_select_authenticated`, espejo de las de `anon` |
| RF-11 | Ninguna política de escritura para el cliente + `with check` del admin |
| RF-13 | Políticas de la 002 intactas + punto 3.2 |

## 7. Orden de trabajo

1. Migración (T1): grants y políticas, aplicada y saneada.
2. Verificación por rol (T2 a T4): anónimo, cliente (registro abierto), admin (pasos manuales del usuario en el dashboard).
3. Limpieza (T5) y regresión de la aplicación (T6).
4. Documentos (T7): nota en la 002, eliminar el stub, estado de la spec, `MEMORY.md`.

## 8. Riesgos y supuestos

- **Migración sobre el remoto:** anotar los conteos 4/3/7/9/11/2 antes de aplicar; confirmar con `supabase migration list --remote`. Si falla, se corrige con una migración nueva, sin reescribir el historial (como en la 001).
- **Confirmación de correo:** si el proyecto la exige, la cuenta auto-registrada no entrega JWT hasta confirmar el enlace; lo confirma el usuario (la configuración es fuera de alcance). Condición previa del criterio del registro abierto: que el registro por API siga habilitado.
- **`auth.jwt()`:** consulta de humo en la primera suplantación (`select auth.jwt() -> 'app_metadata'`) antes de dar por buenas las políticas.
- **Cambio de rol no inmediato:** limitación declarada y aceptada de los claims; los casos límite de la spec la documentan.
- **Tokens y correos de prueba:** viven en la conversación, nunca en el repo ni en `MEMORY.md` (RNF-4).
- **`updated_at` la ajusta el admin a mano:** sin triggers en el catálogo (caso límite de la spec).
- **`git status` limpio en `src/`:** cualquier cambio de aplicación es un desvío del alcance (RNF-7).
