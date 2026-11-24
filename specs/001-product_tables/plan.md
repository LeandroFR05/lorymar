# Plan 001 — Tablas del catálogo

**Spec:** `specs/001-product_tables/spec.md` (implementada)
**Estado:** implementado
**Fecha:** 20 nov 2026

## 1. Alcance

Solo estructura de datos: migraciones que crean las tablas con sus claves, unicidades, validaciones e índices, más un seeder demo para comprobarlas. Nada de aplicación: sin pantallas, sin acceso a datos desde el frontend, sin RLS, sin triggers ni funciones.

Base: Supabase `lorymar_db` (Postgres 17, us-east-1); las seis tablas ya están aplicadas.

## 2. Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `supabase/config.toml` | crear | Configuración del proyecto (la genera `supabase init`). | — |
| `supabase/migrations/20261121115249_create_categories_aromas.sql` | crear | Tablas `categories` y `aromas` con sus uniques. | RF-1, RF-2, RF-5, RF-6 |
| `supabase/migrations/20261121115300_create_products.sql` | crear | Tabla `products` con clave foránea a categorías e índice. | RF-3, RF-4, RF-8, RF-9, RF-10 |
| `supabase/migrations/20261121115309_create_varieties.sql` | crear | Tabla `varieties` con unique por producto y borrado en cascada. | RF-11 a RF-14, RF-27, RF-28 |
| `supabase/migrations/20261121115314_create_presentations.sql` | crear | Tabla `presentations` con checks y unique compuesto. | RF-15 a RF-23, RF-27, RF-28 |
| `supabase/migrations/20261121115319_create_pictures.sql` | crear | Tabla `pictures` con borrado en cascada. | RF-24 a RF-28 |
| `supabase/migrations/20261121115333_seed_demo_catalog.sql` | crear | Datos demo: 4 categorías, 3 aromas, 7 productos con variedades, presentaciones e imágenes. Idempotente. | RF-1 a RF-28 |
| `.gitignore` | modificar | Añadir `supabase/.temp/`. | — |

No se toca `package.json` ni el código de `src/`: esta spec no añade dependencias ni lógica.

## 3. Modelo de datos

### 3.1 Tablas

**`categories`** (RF-1 a RF-4)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `name` | `text` | Obligatorio; no vacío después de recortar. |

- Único: `lower(btrim(name))`.
- Sin timestamps (no los pide la spec).

**`aromas`** (RF-5 a RF-7)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `name` | `text` | Obligatorio; no vacío después de recortar. |

- Único: `lower(btrim(name))`.
- Sin timestamps.

**`products`** (RF-3, RF-8 a RF-10)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `name` | `text` | Obligatorio; no vacío después de recortar. Sin unicidad (RF-9). |
| `description` | `text` | Obligatorio; no vacío después de recortar. |
| `category_id` | `bigint` | Obligatorio; referencia a `categories` con borrado restringido (RF-4). |
| `created_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `updated_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `deleted_at` | `timestamptz` | Opcional; sin reglas asociadas por ahora. |

- Índice por `category_id`.

**`varieties`** (RF-11 a RF-14)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `product_id` | `bigint` | Obligatorio; referencia a `products` con borrado en cascada (RF-28). |
| `name` | `text` | Obligatorio; no vacío después de recortar. |
| `description` | `text` | Opcional. |
| `created_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `updated_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `deleted_at` | `timestamptz` | Opcional; sin reglas asociadas por ahora. |

- Único: `(product_id, lower(btrim(name)))` (RF-12, RF-13).
- Ese índice cubre la clave foránea `product_id`; no se crea otro (RNF-3).

**`presentations`** (RF-15 a RF-23)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `variety_id` | `bigint` | Obligatorio; referencia a `varieties` con borrado en cascada (RF-28). |
| `aroma_id` | `bigint` | Opcional; referencia a `aromas` con borrado restringido (RF-7). |
| `description` | `text` | Opcional (RF-15). |
| `weight` | `numeric(8,2)` | Obligatorio; mayor a cero (RF-17). |
| `unit` | `text` | Obligatorio; texto de hasta 20 caracteres, sin lista cerrada (RF-16). |
| `price` | `numeric(10,2)` | Obligatorio; mayor o igual a cero (RF-17, RF-18). |
| `stock` | `integer` | Obligatorio, por defecto 0; mayor o igual a cero (RF-17). |
| `tag` | `text` | Opcional; si no es nulo, entre 1 y 50 caracteres después de recortar (RF-19). |
| `created_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `updated_at` | `timestamptz` | Obligatorio, por defecto `now()`. |
| `deleted_at` | `timestamptz` | Opcional; sin reglas asociadas por ahora. |

- Único: `(variety_id, aroma_id, weight, unit)` con `nulls not distinct` (RF-20, RF-21).
- Ese índice cubre la clave foránea `variety_id`; no se crea otro.
- Índice por `aroma_id`.

**`pictures`** (RF-24 a RF-26, RF-28)

| Columna | Tipo | Regla |
|---|---|---|
| `id` | `bigint` identidad | Clave primaria. |
| `presentation_id` | `bigint` | Obligatorio; referencia a `presentations` con borrado en cascada (RF-28). |
| `storage_path` | `text` | Obligatorio; no vacío después de recortar (RF-26). |
| `is_main` | `boolean` | Obligatorio, por defecto falso. Sin unicidad (RF-25). |

- Índice por `presentation_id`.

**Nota sobre `deleted_at`.** Productos, variedades y presentaciones incluyen la columna, pero ninguna regla la usa todavía: el borrado sigue siendo físico y en cascada. Categorías, aromas e imágenes no la llevan. Los únicos son totales, no parciales; cuando la baja lógica se implemente habrá que volverlos parciales sobre `deleted_at is null`.

### 3.2 Acciones de borrado

| Relación | Acción | Por qué | RF |
|---|---|---|---|
| `products.category_id` → `categories` | `restrict` | Una categoría en uso no se puede borrar. | RF-4 |
| `presentations.aroma_id` → `aromas` | `restrict` | Un aroma en uso no se puede borrar. | RF-7 |
| `varieties.product_id` → `products` | `cascade` | Sin producto, sus variedades no existen. | RF-27, RF-28 |
| `presentations.variety_id` → `varieties` | `cascade` | Sin variedad, sus presentaciones no existen. | RF-27, RF-28 |
| `pictures.presentation_id` → `presentations` | `cascade` | Sin presentación, sus imágenes no existen. | RF-27, RF-28 |

### 3.3 Orden de las migraciones

Una migración por grupo de tablas, para que cada una se aplique y verifique por separado:

```
20261121115249  categories y aromas
20261121115300  products (depende de categories)
20261121115309  varieties (depende de products)
20261121115314  presentations (depende de varieties y aromas)
20261121115319  pictures (depende de presentations)
20261121115333  seeder demo (depende de las cinco tablas)
```

Cada migración incluye los índices de su tabla. Si una falla, las anteriores quedan aplicadas y se corrige con una migración nueva, sin reescribir el historial.

### 3.4 Seeder demo

- 4 categorías: Rostro, Cabello, Cuerpo y Aromaterapia.
- 3 aromas: Romero, Lavanda y Menta.
- 7 productos, todos con al menos una variedad:
  1. Sérum de Rosa Mosqueta (Rostro): variedad "Única"; 30 ml; 24.900,00; stock 12; etiqueta "Más vendido"; más una muestra de 5 ml con precio 0.
  2. Champú Sólido de Romero (Cabello): variedades "Cabello graso" y "Cabello seco"; 100 g y 120 g; aromas Romero y Menta.
  3. Crema Hidratante de Aloe (Rostro): "Única"; 50 g y 100 g; sin aroma; etiqueta "Nuevo".
  4. Jabón de Avena y Miel (Cuerpo): "Única"; 100 g; sin aroma.
  5. Manteca Corporal de Karité (Cuerpo): "Única"; 200 ml; aroma Lavanda.
  6. Aceite Capilar de Argán (Cabello): "Cabello fino" y "Cabello grueso"; 50 ml y 100 ml; sin aroma.
  7. Difusor de Aromaterapia (Aromaterapia): "Única"; 1 unidad; 8.500,00; stock 5.
- La muestra del producto 1 cubre el precio 0 y el difusor cubre una unidad distinta de g y ml.
- Algunas presentaciones llevan `description` y otras no, para probar el valor nulo.
- Dos imágenes de ejemplo en la primera presentación del producto 2, ambas con `is_main = true`, para probar RF-25.
- Inserción idempotente con `where not exists` por nombre; las referencias se resuelven por subconsulta y nunca se hardcodean IDs.

## 4. Funciones puras

Ninguna en esta spec. No hay lógica de aplicación que testear: todas las reglas viven en constraints de la base, que se verifican con SQL y datos demo. La lógica pura (validaciones de formulario, adaptadores, fechas) entra cuando exista la spec de la aplicación.

## 5. Algoritmo

No hay algoritmos de negocio. El único procedimiento es la aplicación de migraciones descrita en el punto 3.3, seguida de la carga del seeder y las consultas de verificación del punto 7.

## 6. Interfaz

Ninguna. Esta spec no toca `src/`. El catálogo y el panel siguen con los datos hardcodeados actuales hasta la spec de la aplicación.

## 7. Verificación con seeders

No hay sujeto para `node --test` (no se escribe JavaScript). La verificación es SQL: se aplican las migraciones, se corre el seeder y se ejecuta una consulta por restricción, esperando error o resultado vacío según corresponda.

| Comprobación | Consulta | Resultado esperado | RF |
|---|---|---|---|
| Categoría duplicada | insertar `' rostro '` | Error de unicidad | RF-2 |
| Aroma duplicado | insertar `'ROMERO'` | Error de unicidad | RF-6 |
| Producto sin categoría | insertar producto con `category_id` inexistente | Error de clave foránea | RF-3 |
| Dos productos con el mismo nombre | insertar un producto repetido | Se inserta | RF-9 |
| Variedad duplicada en el mismo producto | repetir nombre con mayúsculas distintas | Error de unicidad | RF-12 |
| Variedad homónima en otro producto | insertar el mismo nombre en otro producto | Se inserta | RF-13 |
| Unidad vacía | insertar `unit = ''` | Error de check | RF-16 |
| Unidad distinta de g/ml | insertar `unit = 'unidad'` | Se inserta | RF-16 |
| Unidad de 21 caracteres | insertar `unit` de 21 caracteres | Error de check | RF-16 |
| Peso en cero | insertar `weight = 0` | Error de check | RF-17 |
| Precio en cero | insertar `price = 0` | Se inserta | RF-17 |
| Stock negativo | insertar `stock = -1` | Error de check | RF-17 |
| Etiqueta de 51 caracteres | insertar etiqueta de 51 | Error de check | RF-19 |
| Presentación duplicada sin aroma | repetir variedad, aroma nulo, peso y unidad | Error de unicidad (`nulls not distinct`) | RF-20 |
| Mismo peso y unidad en otra variedad | insertar en variedad distinta | Se inserta | RF-21 |
| Borrar categoría en uso | `delete from categories where ...` | Error de clave foránea | RF-4 |
| Borrar aroma en uso | `delete from aromas where ...` | Error de clave foránea | RF-7 |
| Borrar producto con hijos | `delete from products where ...` | Se borran sus variedades, presentaciones e imágenes | RF-28 |
| Dos imágenes principales | consultar las imágenes del producto 2 | Dos filas con `is_main = true` | RF-25 |
| Descripción de presentación nula | insertar una presentación sin `description` | Se inserta | RF-15 |
| `deleted_at` con valor | insertar una fila con `deleted_at = now()` | Se inserta; ninguna consulta la filtra | RF-10, RF-14, RF-23 |
| Índices de claves foráneas | consultar `pg_indexes` | Cada FK tiene índice | RNF-3 |

Comandos: `supabase db push` (o el MCP de Supabase) para aplicar las migraciones y `supabase migration list` para confirmar que local y remoto coinciden.

## 8. Cobertura de RF

| RF | Dónde se implementa |
|---|---|
| RF-1 | `categories.name` obligatorio y no vacío. |
| RF-2 | Único `lower(btrim(name))` en `categories`. |
| RF-3 | `products.category_id` obligatorio y con clave foránea. |
| RF-4 | Clave foránea con `on delete restrict`. |
| RF-5 | `aromas.name` obligatorio y no vacío. |
| RF-6 | Único `lower(btrim(name))` en `aromas`. |
| RF-7 | Clave foránea con `on delete restrict`. |
| RF-8 | Columnas obligatorias de `products`. |
| RF-9 | Sin unicidad en `products.name`. |
| RF-10 | `created_at`, `updated_at` y `deleted_at` en `products`. |
| RF-11 | Columnas de `varieties`. |
| RF-12 | Único `(product_id, lower(btrim(name)))`. |
| RF-13 | La unicidad es por producto. |
| RF-14 | `created_at`, `updated_at` y `deleted_at` en `varieties`. |
| RF-15 | Columnas de `presentations`, con `description` opcional. |
| RF-16 | `unit` obligatorio, texto de hasta 20 caracteres, sin lista cerrada. |
| RF-17 | Checks: `weight > 0`, `price >= 0`, `stock >= 0`. |
| RF-18 | `price numeric(10,2)`. |
| RF-19 | Check de `tag` entre 1 y 50 caracteres. |
| RF-20 | Único `nulls not distinct` por variedad. |
| RF-21 | El único incluye `variety_id`. |
| RF-22 | Sin límite de presentaciones por producto. |
| RF-23 | `created_at`, `updated_at` y `deleted_at` en `presentations`. |
| RF-24 | `pictures` sin mínimo obligatorio. |
| RF-25 | Sin unicidad en `is_main`. |
| RF-26 | `storage_path` obligatorio y no vacío. |
| RF-27 | Claves foráneas obligatorias. |
| RF-28 | `on delete cascade` en la cadena producto → variedad → presentación → imagen. |

## 9. Decisiones técnicas justificadas

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| Migraciones versionadas con la CLI | Reproducibilidad, historial y revisión en el repo. | SQL Editor: sin historial ni entorno reproducible. |
| `bigint` con identidad | Es el tipo por defecto de Supabase, no tiene techo práctico y el costo frente a `int` es despreciable a esta escala. | `int`: ahorra 4 bytes por fila, irrelevante para un catálogo y obligaría a migrar si se agotara. |
| `timestamptz` | Guarda zona horaria y evita ambigüedad. | `timestamp`: hora local ambigua. |
| Unidad como texto libre | La lista de unidades no está cerrada; sumar una no exige migración. | Enum o check cerrado: cada unidad nueva pediría migración. |
| Precio mayor o igual a cero | Permite muestras y promociones sin precio. | `> 0`: bloquearía casos válidos del negocio. |
| Único con `lower(btrim(...))` | Cumple RF-2, RF-6 y RF-12 sin extensiones. | `citext`: exige extensión y no recorta espacios. |
| Un único índice por clave foránea | Evita índices redundantes que cuestan escritura. | Índice extra en cada FK: duplica lo que ya cubre el unique compuesto. |
| Unique `nulls not distinct` | Trata "sin aroma" como un valor más, sin fila centinela. | Fila "Ninguno": contamina filtros y depende de un texto. |
| `on delete cascade` en la cadena de propiedad | Sin soft delete, evita hijos huérfanos con una regla simple. | `restrict`: obligaría a borrar a mano en orden. |
| `on delete restrict` en categorías y aromas | Protege datos en uso, como piden RF-4 y RF-7. | `cascade`: borraría productos por borrar una categoría. |
| `numeric` para precio y peso | Decimales exactos. | Enteros en centavos o gramos: conversión extra. |
| Sin `status` | Publicación y visibilidad están fuera de alcance. | Incluirlo ahora: columna sin reglas ni uso. |
| `deleted_at` sin reglas | Reserva la columna para la spec de bajas; hoy no cambia nada y el borrado sigue siendo físico. | Implementar baja lógica ahora: fuera de alcance. |
| `description` en presentaciones | La pidió el usuario; permite describir la variante sin tocar la variedad. | No tenerla: obligaría a migrar después. |
| Sin RLS en esta migración | Se define junto con la autenticación; acá solo importa la estructura. | Políticas provisorias: habría que rehacerlas. |
| Seeder como migración | El flujo es remoto vía CLI/MCP y así también llega al proyecto. | `seed.sql`: solo corre en local. |
| Descripción de producto obligatoria | RF-8 la enumera sin marcarla opcional; RF-11 sí marca opcional la de variedad. | Opcional: se aparta del texto de la spec. |

## 10. Orden de implementación

1. Crear `supabase/config.toml` y ajustar `.gitignore`.
2. Aplicar la migración de categorías y aromas.
3. Aplicar la de productos.
4. Aplicar la de variedades.
5. Aplicar la de presentaciones.
6. Aplicar la de imágenes.
7. Aplicar el seeder demo.
8. Ejecutar las comprobaciones del punto 7 y corregir lo que falle.
9. Actualizar `MEMORY.md`.

## 11. Riesgos y supuestos

- **Sin RLS, las tablas quedan expuestas con la clave pública.** Es aceptable mientras sea un entorno de desarrollo y no se publique el sitio; las políticas llegan con la spec de autenticación.
- `on delete cascade` es una decisión de estructura, no un flujo de baja: si más adelante se necesita baja lógica, se cambia el esquema en su propia spec.
- Los únicos son totales. Al implementar baja lógica habrá que volverlos parciales sobre `deleted_at is null` y agregar triggers; es un cambio de esquema, no un ajuste menor.
- El seeder inserta datos demo; se eliminan con un `delete` por nombre sin tocar la estructura (RNF-7).
- `supabase db push` requiere el proyecto linkeado y la contraseña de la base; no se guarda en el repo.
- El seeder no sube archivos: `storage_path` guarda rutas de ejemplo que todavía no existen en Storage. Alcanza para probar la tabla.
- `nulls not distinct` exige Postgres 15 o superior; el proyecto usa 17.
