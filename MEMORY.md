# MEMORY.md — Cosmética natural LoryMar
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Landing v1: Hero, Values, ProductGrid, About, Testimonials, Newsletter, Footer; el catálogo público lee de Supabase (rol anónimo) en una sola petición.
- Specs 001–003 implementadas. Datos demo: 4 categorías, 3 aromas, 7 productos, 9 variedades, 11 presentaciones, 2 imágenes.
- La lectura pública cubre las 6 tablas del catálogo: la 003 abrió aromas (completos) e imágenes (solo de presentaciones visibles) a anónimo y cliente.
- Roles en Supabase Auth sin tablas de usuarios: el claim `role` de `app_metadata` distingue admin (`admin`) de cliente (ausencia del claim); registro abierto.
- 18 políticas RLS: las 4 de la 002 (`to anon`) + 14 de la 003 (2 anon, 6 espejo del cliente, 6 `*_admin_all`); el admin CRUDea las 6 tablas y el cliente no escribe nada.
- Stack: Vite + React 19 + React Router 8 + JS puro. Estilos en `src/styles/`.

## Decisiones (y por qué)
- Router con `BrowserRouter`, `lazy()` + `Suspense` en páginas.
- Filtro sincronizado con URL (`?categoria=...`) usando `replace: true`.
- Sin Zustand: no hay estado global compartido.
- Lógica fuera de componentes: `utils/` + `hooks/` + tests con `node --test`.
- Clave pública Supabase en frontend (excepción aprobada al principio 5); `service_role` prohibido.
- `CURRENT_YEAR` calculado al cargar el módulo, sin `Date` en render.
- Rol por claim de `app_metadata` (003, decisión del usuario): cero tablas nuevas; cambiar el rol surte efecto al refrescar la sesión (token nuevo), no en la consulta siguiente.
- Nuevos admins se crean desde el dashboard/SQL asignando el claim; nunca desde la web.

## Aprendizajes y errores a evitar
- Deuda: marca mezclada LoryMar/Raíz & Flor; falta `robots.txt`; input del newsletter sin `autocomplete`; falta fallback SPA en deploy.
- Login del panel provisional e inseguro (`sessionStorage`, credenciales demo en el cliente) y formulario `/admin` sin persistir: la 003 dejó la base lista, el frontend va en specs futuras.
- Vista de detalle y carrusel de categorías pendientes; el Hero sigue con `src/data/products.js` (ya no alimenta la grilla).
- `useSearchParams`: `getAll('categoria')` devuelve `['']` con `?categoria=`; hay que distinguirlo de `[]`.
- Carrusel del Hero: respeta `prefers-reduced-motion` y se pausa en hover/focus.
- `supabase-js` reintenta solo GET (máx. 3, backoff) por defecto; desactivado con `db: { retry: false }` (RF-3 y RF-28 de la 002).
- GoTrue: `example.*` rechazado por la validación de correos; el signup duplicado NO actualiza la contraseña (respuesta señuelo 200 con UUID falso); confirmación de correo activa y cuota horaria muy baja → 429 en pruebas.
- PG 17: la vista `pg_policies` expone el WITH CHECK como `with_check`, no `with_qual`.

## Próximos pasos
- Spec del carrusel de categorías y vista de detalle.
- Autenticación real del panel y persistencia del formulario `/admin`.
- Actualizar `AGENTS.md` (products.js ya no es el catálogo) y formalizar la excepción del principio 5 en `docs/constitution.md`.
- Focus trap y retorno de foco al modal `AdminLogin`.
- La cuenta de cliente de las pruebas queda a elección del usuario (borrable desde el dashboard); la del dueño se conserva.
