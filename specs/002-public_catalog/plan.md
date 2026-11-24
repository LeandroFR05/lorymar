# Plan 002 — Catálogo público desde la base de datos

**Spec:** `specs/002-public_catalog/spec.md` (aprobada)
**Estado:** pendiente de implementar
**Fecha:** 23 nov 2026

## 1. Alcance

Activar RLS en `lorymar_db`, leer el catálogo con la clave pública y mostrarlo en la grilla de inicio en tarjetas por variedad con precios en pesos argentinos (ARS) y filtro por categoría sincronizado con `?categoria=`. Sin escritura, sin autenticación, sin detalle de producto, sin cambios en el Hero y sin páginas de categoría (quedan para una spec futura). La spec 001 no se toca (queda desactualizada en la baja lógica; lo anota el coordinador en `MEMORY.md`).

`src/data/products.js` se conserva temporalmente sin cambios porque `Hero.jsx` y `AddProductForm.jsx` aún lo importan; la grilla `ProductGrid.jsx` y `useProductFilter.js` dejan de usarlo y pasan a consumir `useCatalog`.

## 2. Archivos

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `supabase/migrations/<versión>_enable_rls_public_catalog.sql` | crear | RLS en las 6 tablas, políticas SELECT para `anon` en 4, revocar escritura | RF-30 a RF-37 |
| `package.json` | modificar | Añadir `@supabase/supabase-js` | RF-1, RF-2 |
| `.env.example`, `.gitignore`, `vite.config.js` | crear/modificar | Plantilla con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; excluir `.env`; plugin que corta con la variable faltante | RF-38, RF-39, RF-41 |
| `src/utils/env.js` (+test) | crear | `REQUIRED_ENV_VARS`, `findMissingEnvVars(env)` | RF-39 |
| `src/utils/supabaseClient.js` | crear | Cliente anónimo (`persistSession`, `autoRefreshToken`, `detectSessionInUrl` en `false`) | RF-2 |
| `src/utils/catalogQuery.js` (+test) | crear | `CATALOG_SELECT` y `fetchCatalog(client)` | RF-1, RF-3, RF-31 |
| `src/utils/text.js` (+test) | crear | `normalizeText`, `compareNames` (`es-AR`, base, sin acentos) | RF-5, RF-21, RF-22 |
| `src/utils/formatPrice.js` (+test) | modificar | Pesos: `$ 24.900,00` | RF-13 |
| `src/utils/categoryColor.js` (+test) | crear | Paleta, `NEUTRAL_COLOR`, `getCategoryColor(name)` | RF-16 |
| `src/utils/representativePresentation.js` (+test) | crear | `pickRepresentativePresentation(list)` | RF-9, RF-10, RF-11 |
| `src/utils/catalogMapper.js` (+test) | crear | `buildCatalog(rows)`: visibilidad, tarjetas, categorías, orden | RF-5 a RF-8, RF-12, RF-17, RF-35, RF-36 |
| `src/utils/catalogLimits.js` (+test) | crear | `MAX_ROWS = 1000`, `isCatalogIncomplete(rows)` | RF-4 |
| `src/utils/categoryFilter.js` (+test) | crear | `buildFilterOptions`, `resolveActiveCategory` | RF-21 a RF-25 |
| `src/hooks/useCatalog.js` | crear | Estado `loading/ready/error`, `retry` | RF-3, RF-26 a RF-28, RF-40 |
| `src/hooks/useProductFilter.js` | modificar | Recibe datos del catálogo; limpia `?categoria=` inválido | RF-21 a RF-25 |
| `src/components/ui/CatalogFeedback.jsx` | crear | Carga, error con reintento, vacío, incompleto (accesibles) | RF-4, RF-26 a RF-29, RNF-6 |
| `src/components/ui/ProductCard.jsx` | modificar | Sin descripción ni "Ver más"; "Comprar" deshabilitado | RF-18 a RF-20, RNF-10 |
| `src/components/sections/ProductGrid.jsx` | modificar | Datos y filtro del catálogo | RF-6, RF-21 a RF-29 |
| `src/pages/HomePage.jsx` | modificar | Una sola `useCatalog()` pasada a la grilla | RF-3 |
| `src/components/admin/AddProductForm.jsx` | modificar | Rótulo en pesos y valor formateado | RF-14 |
| `src/styles/**` | modificar | Estilos de feedback y botón "Comprar" deshabilitado | RNF-6, RNF-10 |

## 3. Decisiones técnicas

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| `@supabase/supabase-js`, sin sesión persistente | Estándar, valida con la futura auth y storage; sin sesión = rol anónimo puro | `fetch` a PostgREST: armar URL y errores a mano; `postgrest-js` solo: habría que migrar al llegar auth |
| Cliente en `src/utils/` | La constitución pone el acceso a datos en `hooks/` o `utils/` | `src/lib/`: carpeta fuera de la constitución |
| Una consulta raíz en `varieties` con `products(…, categories(…))` y `presentations(…)` anidados | Una petición (RF-3); cada fila raíz es una tarjeta; solo `presentations` es colección anidada | Raíz en `categories`: más anidación; vista o RPC: amplía la superficie (RF-37) |
| `CATALOG_SELECT` pide `deleted_at` y no `description`, `stock` ni imágenes | Permite la segunda barrera (RF-36) y respeta el contrato (RF-17) | `select('*')`: trae datos que nadie usa |
| `buildCatalog` devuelve `{ cards, categories, incomplete }`; cada categoría trae `{ id, name, color, cards }` | La tarjeta conserva las 7 claves del contrato sin `categoryId`; el filtro se deriva de `categories` | Añadir `categoryId` a la tarjeta: rompe RF-17 |
| `useCatalog` propio (`useState` + `useEffect`), sin dependencia de `pathname` | Una petición en la página de inicio; el reintento es la única excepción | TanStack Query: dependencia para un solo `GET` |
| Sin Zustand: `HomePage` llama a `useCatalog()` y pasa props a `ProductGrid` | Estado acotado a la página de inicio; Zustand solo con estado global real (constitución) | Context o store: complejidad sin necesidad |
| `formatPrice` manual: `toFixed(2)` más puntos de miles por regex y prefijo `'$ '` | `Intl` es-AR inserta NBSP y algunos locales no agrupan 4 cifras (`$ 1.000,00`) | `Intl.NumberFormat('es-AR', { currency })` |
| `resolveActiveCategory` compara con `normalizeText`; ante dos coincidencias, menor identificador | Determinista; el caso es deuda documentada en la spec | Error o ambigüedad abierta |
| Validación de entorno en plugin de Vite (`loadEnv`) con `findMissingEnvVars` pura | RF-39 exige cortar al compilar y al arrancar; la pura se testea en Node | Lanzar solo en runtime: el build pasaría |
| Políticas con `exists` explícito (`join` varieties-products) por tabla | No dependen de que otra tabla tenga RLS; RF-36 se lee en una sola política | Cascada implícita por RLS anidada |
| Solo `to anon`; `revoke insert, update, delete, truncate` a `anon` y `authenticated`; RLS sin políticas en `aromas`/`pictures` | Doble barrera de escritura (RF-32, RF-33); `authenticated` no lee porque no se usa; cero filas cumple RF-31 | `grant` a `authenticated` o revocar `select` en las dos tablas |
| Conservar `src/data/products.js` sin cambios | `Hero.jsx` y `AddProductForm.jsx` siguen importando `products` y `categories` respectivamente hasta sus specs correspondientes | Eliminar `products` de `src/data/products.js`: rompería `Hero.jsx` |
| Tests `*.test.js` junto al módulo, sin React ni `import.meta.env` en módulos puros | `node --test` los encuentra sin configuración; Vite no los empaqueta | Carpeta `tests/` separada |

## 4. Forma de los datos

Fila devuelta por `CATALOG_SELECT` (raíz `varieties`):
`{ id, name, deleted_at, products: { id, name, deleted_at, categories: { id, name } } | null, presentations: [{ id, price, weight, unit, tag, deleted_at }] }`. Los `numeric` se pasan con `Number()` al mapear.

Salida de `buildCatalog(rows)`:
- `cards`: objetos `{ id, name, category, price, color, image: '', tag }` (`tag` = `null` sin etiqueta), orden de RF-5.
- `categories`: `{ id, name, color, cards }`, solo visibles, ordenadas con `compareNames` y desempate por `id`.
- `incomplete`: resultado de `isCatalogIncomplete(rows)` sobre las filas recibidas, antes de descartar.

## 5. Estrategia de pruebas

`node --test` solo para lógica pura (constitución). Sin red ni credenciales; `fetchCatalog` recibe un cliente falso.

| Módulo | Casos | RF |
|---|---|---|
| `text`, `categoryColor` | mayúsculas, acentos, espacios; color conocido/desconocido ("Aromaterapia") | RF-5, RF-16, RF-21 |
| `formatPrice` | 24900, 1000, 0, 7.5, 1234567.8 | RF-13 |
| `representativePresentation` | única, cero y mayor, todas en cero, empate de precio y de peso, sin etiqueta | RF-9 a RF-11 |
| `catalogMapper` | nombre con/sin guion largo, baja propia, cascada, variedad sin presentaciones, orden con acentos y homónimos, contrato de 7 claves | RF-5 a RF-8, RF-12, RF-17, RF-35, RF-36 |
| `catalogLimits` | 999/1000/1001 en raíz y en `presentations` | RF-4 |
| `categoryFilter` | opciones con "Todos" primero, parámetro válido/otras mayúsculas/vacío/inexistente/repetido/ambiguo | RF-21 a RF-23 |
| `catalogQuery`, `env` | una sola llamada a `from('varieties')`, error lanzado, sin `description`/`stock`; variable ausente, vacía, completa | RF-3, RF-31, RF-39 |

La UI se valida manualmente con Chrome DevTools. RLS y escritura se verifican con consulta directa: MCP de Supabase (`execute_sql` con `set local role anon` dentro de una transacción con `rollback`, y `get_advisors`) o CLI, y una petición REST con la clave pública.

## 6. Orden de trabajo

1. RLS primero: hoy la clave pública puede escribir (T1).
2. Entorno y cliente (T2); lógica pura con tests (T3 a T5), sin depender de nada.
3. Acceso a datos y hook (T6), con RLS y entorno ya listos.
4. Inicio: tarjetas, grilla y filtro (T7).
5. Verificación integral (T8).

## 7. Cobertura de RF

| RF | Dónde |
|---|---|
| RF-1, RF-2 | `catalogQuery`, `supabaseClient`, `useCatalog` |
| RF-3, RNF-1 | Una consulta raíz; `useCatalog` sin dependencia de ruta; `HomePage` única |
| RF-4 | `catalogLimits`, `CatalogFeedback` |
| RF-5 a RF-12, RF-17 | `representativePresentation`, `catalogMapper`, `text` |
| RF-13, RF-14 | `formatPrice`, `AddProductForm` |
| RF-15, RF-16 | `catalogMapper` (`image: ''`), `categoryColor` |
| RF-18 a RF-20, RNF-10 | `ProductCard` |
| RF-21 a RF-25 | `categoryFilter`, `useProductFilter`, `ProductGrid` |
| RF-26 a RF-29, RF-40, RNF-2, RNF-6 | `useCatalog`, `CatalogFeedback` |
| RF-30 a RF-37 | Migración de RLS |
| RF-38, RF-39, RF-41 | `.env.example`, `.gitignore`, `vite.config.js`, `env.js` |
| RNF-3, RNF-4, RNF-5, RNF-9 | Migración; lógica en `utils/`; sección 5; tabla de tareas |

## 8. Riesgos y puntos de atención

- **Migración sobre el remoto:** ejecutar antes `supabase db push --dry-run --remote`. Los seeds no se rompen (el rol dueño omite RLS), pero se confirman los conteos 4/3/7/9/11/2 antes y después.
- **Cascada de bajas:** probarla con filas temporales (`deleted_at` pasado y futuro) en una transacción revertida; no dejar datos de prueba.
- **Petición doble en desarrollo:** `StrictMode` duplica efectos; "una sola petición" se mide con `npm run build` y `npm run preview`.
- **Límite de filas:** `max-rows` del proyecto aplica a la raíz; el umbral de las anidadas es conservador (spec).
- **Nombre de la clave:** `VITE_SUPABASE_ANON_KEY` admite la clave `anon` clásica o la `publishable` nueva (ambas usan el rol `anon`). Nunca registrarla en `MEMORY.md` ni en la spec.
- **Compilar sin `.env` falla** a propósito; `.env.example` explica cómo crearlo.
- **`Hero.jsx` conserva `src/data/products.js`:** al cambiar `formatPrice` a pesos argentinos, el Hero mostrará esos valores formateados en pesos hasta que una spec futura migre el Hero.
- **Documentos a actualizar tras implementar (fuera de mi alcance):** `AGENTS.md` (aclarar que la grilla ya lee de Supabase mientras `Hero` y `AddProductForm` aún usan `products.js`), `MEMORY.md`, spec 001 (nota), `docs/constitution.md` (principio 5, solo con aprobación explícita).
