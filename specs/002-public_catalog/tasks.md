# Tareas 002 — Catálogo público desde la base de datos

**Spec:** `specs/002-public_catalog/spec.md`
**Plan:** `specs/002-public_catalog/plan.md`

Orden estricto. Cada tarea termina con `npm run lint` y, si toca lógica, `node --test` en verde.

- [x] **T1. Migración de RLS.** — RF-30 a RF-37, RNF-3
  - Archivos: `supabase/migrations/<versión>_enable_rls_public_catalog.sql` (usar la versión que asigne Supabase, como en la 001).
  - Contenido: RLS activado en las 6 tablas; política `select` `to anon` en `categories` (sin filtro), `products` (`deleted_at is null`), `varieties` y `presentations` (propia sin baja y `exists` explícito de los padres sin baja); ninguna política para `aromas` y `pictures`; `revoke insert, update, delete, truncate` a `anon` y `authenticated` en las 6.
  - Antes de aplicar: `supabase db push --dry-run --remote` y anotar conteos 4/3/7/9/11/2.
  - Tests: ninguno (SQL).
  - Hecho cuando: con `begin; set local role anon; …; rollback;` las 4 tablas devuelven filas y `aromas`/`pictures` cero; insert, update y delete fallan en las 6; filas temporales con `deleted_at` pasado y futuro ocultan producto, variedad y presentaciones en cascada; `pg_policies` solo muestra `select` para `anon`; `get_advisors` no reporta `rls_disabled_in_public`; los conteos no cambian; `supabase migration list --remote` coincide con el repo.

- [x] **T2. Entorno y cliente.** — RF-38, RF-39, RF-41, RF-2
  - Archivos: `package.json` (`@supabase/supabase-js`), `.env.example`, `.gitignore` (`.env`, `.env.*`, `!.env.example`), `vite.config.js` (plugin con `loadEnv`), `src/utils/env.js`, `src/utils/env.test.js`, `src/utils/supabaseClient.js`; crear `.env` local con la URL y la clave pública del proyecto (ignorado).
  - Tests: `findMissingEnvVars` con `{}`, una variable ausente, valor vacío o de espacios y ambas presentes.
  - Hecho cuando: sin `.env`, `npm run build` y `npm run dev` fallan nombrando la variable; con `.env`, compilan; `.env.example` solo trae la URL y la clave públicas con valores de ejemplo; `.gitignore` excluye `.env`; no hay `service_role` en repo ni en `dist/`.

- [x] **T3. Precio en pesos, texto y color (y panel).** — RF-13, RF-14, RF-16, RF-5 (comparación)
  - Archivos: `src/utils/formatPrice.js` (modificar), `src/utils/text.js`, `src/utils/categoryColor.js` con su `.test.js` cada uno; `src/components/admin/AddProductForm.jsx` (rótulo "Precio ($)" y valor formateado junto al campo, sin tocar el resto).
  - Tests: precios 24900, 1000, 0, 7.5, 1234567.8; `normalizeText` y `compareNames` (mayúsculas, acentos); color conocido en otra capitalización, desconocido y "Aromaterapia" (neutro).
  - Hecho cuando: los tests pasan; en `/admin` el campo sigue siendo numérico, sin símbolo, y muestra `$ 24.900,00` al escribir 24900 (comprobado en el navegador).

- [x] **T4. Presentación representativa, mapeo del catálogo y límite.** — RF-4 a RF-12, RF-17, RF-35, RF-36
  - Archivos: `src/utils/representativePresentation.js`, `src/utils/catalogMapper.js`, `src/utils/catalogLimits.js` con sus `.test.js`.
  - Tests: única; cero y mayor; todas en cero; empate de precio y de peso (g contra ml); sin etiqueta (`tag: null`); nombre con y sin guion largo; baja propia, cascada desde producto o variedad y variedad sin presentaciones; orden con acentos, mayúsculas y homónimos; tarjeta con exactamente 7 claves, `image: ''`; categorías solo visibles y ordenadas; `isCatalogIncomplete` con 999/1000/1001 en raíz y en `presentations`.
  - Hecho cuando: los tests pasan sin red y `buildCatalog` con datos sintéticos equivalentes al demo da 9 tarjetas y 4 categorías (usar los casos del demo en los tests).

- [x] **T5. Filtro de categorías.** — RF-21 a RF-25
  - Archivos: `src/utils/categoryFilter.js` y `src/utils/categoryFilter.test.js`.
  - Tests: `buildFilterOptions` ("Todos" siempre primero y categorías visibles ordenadas); `resolveActiveCategory` (válido, otras mayúsculas/acentos, vacío, inexistente, repetido → primer valor, ambiguo → menor id, `Todos` literal).
  - Hecho cuando: los tests pasan y cada caso de RNF-5 sobre opciones de filtro y parámetro `categoria` tiene su prueba.

- [x] **T6. Acceso a datos y hook de estado.** — RF-1 a RF-3, RF-26 a RF-28, RF-31, RF-40, RNF-1, RNF-2
  - Archivos: `src/utils/catalogQuery.js` y `src/utils/catalogQuery.test.js`, `src/hooks/useCatalog.js`.
  - Tests: con cliente falso, una sola llamada a `from('varieties')` con `CATALOG_SELECT`; el error se lanza; datos nulos dan `[]`; el select no contiene `description`, `stock`, `pictures` ni `aromas`.
  - Hecho cuando: los tests pasan; `useCatalog` devuelve `{ status, catalog, retry }` con `loading`, `ready` y `error`, su efecto no depende de la ruta y `retry` vuelve a `loading`; si falla el cliente o la clave es inválida pasa a `error`.

- [x] **T7. Tarjetas, grilla y filtro de inicio.** — RF-6 a RF-8, RF-15, RF-18 a RF-29, RNF-6, RNF-8, RNF-10
  - Archivos: `src/components/ui/CatalogFeedback.jsx`, `src/components/ui/ProductCard.jsx`, `src/components/sections/ProductGrid.jsx`, `src/hooks/useProductFilter.js`, `src/pages/HomePage.jsx` (una `useCatalog()` pasada a la grilla), estilos en `src/styles/` (feedback y botón deshabilitado).
  - Tests: ninguno nuevo (UI); los de T5 cubren el filtro.
  - Hecho cuando (navegador, escritorio y móvil): 9 tarjetas con precio en pesos, sin descripción ni "Ver más", no clicables, con "Comprar" deshabilitado fuera del orden de tabulación; 5 opciones de filtro, ocultas al cargar, en error y sin datos; `?categoria=Maquillaje` muestra todo y elimina el parámetro al cargar (no lo toca si falla); carga, error con reintento y vacío se anuncian (`role` `status`/`alert`); con la red bloqueada el resto de la página sigue visible; `Hero.jsx` no se modifica y `src/data/products.js` se conserva para `Hero.jsx` y `AddProductForm.jsx`.

- [x] **T8. Verificación integral.** — todos los RF y RNF
  - Archivos: ninguno de código; `MEMORY.md` actualizado al terminar.
  - Hecho cuando: `node --test`, `npm run lint` y `npm run build` pasan; en `build` + `preview` la página de inicio hace una sola petición al catálogo (pestaña Network); el catálogo de la grilla cambia en la web al editar la base sin recompilar; revisión con Chrome DevTools de consola sin errores, estados de carga/error/vacío/incompleto (sintético) y vista móvil; consulta directa con la clave pública (REST y MCP) confirma lectura de 4 tablas, `aromas`/`pictures` vacías y escrituras rechazadas; búsqueda de `service_role` y credenciales privadas en repo y `dist/` sin resultados; la plantilla `.env.example` solo lista URL y clave pública.

## Notas

- 8 tareas en total; T3 incluye el panel porque solo reutiliza `formatPrice`.
- El coordinador debe actualizar `AGENTS.md`, la spec 001 (nota) y, con aprobación explícita, `docs/constitution.md` (principio 5).
