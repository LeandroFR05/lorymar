# Tareas 001 — Tablas del catálogo

**Spec:** `specs/001-product_tables/spec.md`
**Plan:** `specs/001-product_tables/plan.md`

- [x] **T1. Preparar el proyecto Supabase.** — RF: —
  - Hecho cuando: existe `supabase/config.toml`, `.gitignore` incluye `supabase/.temp/` y el proyecto `lorymar_db` está linkeado. **Cumplido:** las migraciones se aplicaron con el MCP y después se instaló la CLI v3.2.0 y se linkeó el proyecto.

- [x] **T2. Migración de categorías y aromas.** — RF-1, RF-2, RF-5, RF-6
  - Hecho cuando: la migración aplica; insertar `'Rostro'` y `' rostro '` falla por unicidad, `'Romero'` y `'ROMERO'` también, y un nombre vacío o de solo espacios falla. **Cumplido:** `20261121115249_create_categories_aromas.sql`.

- [x] **T3. Migración de productos.** — RF-3, RF-4, RF-8, RF-9, RF-10
  - Hecho cuando: un producto con categoría inexistente falla; dos productos con el mismo nombre se insertan; borrar una categoría en uso falla; `created_at` y `updated_at` se llenan solos y `deleted_at` acepta nulo y fecha. **Cumplido:** `20261121115300_create_products.sql`.

- [x] **T4. Migración de variedades.** — RF-11, RF-12, RF-13, RF-14, RF-27, RF-28
  - Hecho cuando: el mismo nombre en el mismo producto falla aunque cambien mayúsculas y espacios; el mismo nombre en otro producto se inserta; `description` acepta nulo; borrar el producto borra sus variedades. **Cumplido:** `20261121115309_create_varieties.sql`.

- [x] **T5. Migración de presentaciones.** — RF-15 a RF-23, RF-27, RF-28
  - Hecho cuando: peso 0 falla; precio 0 se inserta; stock −1 falla; unidad vacía y unidad de 21 caracteres fallan; `'unidad'` se acepta; etiqueta de 51 caracteres falla; duplicado sin aroma falla; el mismo peso en otra variedad se inserta. **Cumplido:** `20261121115314_create_presentations.sql`.

- [x] **T6. Migración de imágenes.** — RF-24, RF-25, RF-26, RF-27, RF-28
  - Hecho cuando: dos filas con `is_main = true` conviven en la misma presentación; `storage_path` vacío falla; borrar la presentación borra sus imágenes. **Cumplido:** `20261121115319_create_pictures.sql`.

- [x] **T7. Cargar el seeder demo.** — RF-1 a RF-28 (datos)
  - Hecho cuando: el seeder corre dos veces sin duplicar y quedan 4 categorías, 3 aromas, 7 productos con sus variedades y presentaciones, 2 imágenes principales y una muestra con precio 0 y unidad `unidad`. **Cumplido:** `20261121115333_seed_demo_catalog.sql`; los conteos no cambiaron al reaplicarlo.

- [x] **T8. Verificar todas las restricciones.** — RF-1 a RF-28, RNF-1, RNF-2, RNF-3, RNF-5
  - Hecho cuando: todas las comprobaciones del punto 7 del plan dan el resultado esperado. **Cumplido:** 22 comprobaciones en verde con un bloque `do` y una tabla temporal.

- [x] **T9. Cerrar la spec.** — RF: —
  - Hecho cuando: `MEMORY.md` está actualizado, la spec pasa a `implementada` y `supabase migration list` coincide con los archivos del repo. **Cumplido:** las 6 migraciones tienen la misma versión en local y en remoto, y `supabase db push --dry-run --remote` responde `upToDate: true`.

## Notas

- Una migración por grupo de tablas en lugar de una sola, para aplicar y verificar cada paso por separado. Los nombres de archivo usan la versión que asignó Supabase, así el repo y el historial remoto coinciden.
- No se escribió JavaScript: la verificación es SQL y no hay sujeto para `node --test`.
- La CLI de Supabase (v3.2.0) está instalada y el proyecto linkeado. Contra el remoto hay que pasar `--remote`: sin Docker corriendo no hay stack local.
- `supabase migration list --remote` muestra las 6 migraciones con versión local = remota; `supabase db push --dry-run --remote` responde `upToDate: true`.
