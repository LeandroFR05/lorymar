# Spec 001 — Tablas del catálogo

Estado: implementada

## Contexto y objetivo

El catálogo de LoryMar hoy vive escrito en el código del sitio: productos, categorías, precios e imágenes están cargados a mano.

Esta spec define **solo la estructura de la base de datos** del catálogo: qué tablas existen, qué columnas tienen, qué valores aceptan y qué reglas de unicidad e integridad cumplen. No define comportamiento de la aplicación, pantallas ni flujos de publicación o baja.

El objetivo es tener las tablas creadas y poblarlas con datos demo para comprobar cada restricción antes de construir el resto.

## Usuarios

- Administrador: carga y mantiene el catálogo.
- Equipo de desarrollo: verifica las restricciones con datos demo.

## Historias de usuario

- HU-1. Como administrador, quiero que productos, variedades, presentaciones, imágenes, categorías y aromas vivan en tablas relacionadas para no duplicar datos.
- HU-2. Como administrador, quiero que la base rechace datos inválidos o duplicados para no corregirlos a mano después.
- HU-3. Como equipo, quiero datos demo reproducibles para comprobar cada restricción.

## Definiciones

- **Producto**: artículo del catálogo. Pertenece a una única categoría.
- **Variedad**: versión de un producto (por ejemplo, "cabello graso" o "cabello seco").
- **Presentación**: combinación de una variedad, un aroma opcional, una descripción opcional, un peso o cantidad y una unidad. Tiene precio y stock propios.
- **Aroma**: atributo opcional de una presentación.
- **Categoría**: agrupación del catálogo.
- **Imagen principal**: imagen marcada para representar una presentación. Puede haber más de una.

## Requisitos funcionales

### Categorías

- RF-1: EL SISTEMA debe guardar cada categoría con un nombre obligatorio.
- RF-2: EL SISTEMA debe impedir que existan dos categorías con el mismo nombre, ignorando mayúsculas, minúsculas y espacios al inicio y al final.
- RF-3: EL SISTEMA debe asociar cada producto a exactamente una categoría.
- RF-4: SI se intenta eliminar una categoría usada por algún producto, ENTONCES EL SISTEMA debe bloquear la operación.

### Aromas

- RF-5: EL SISTEMA debe guardar cada aroma con un nombre obligatorio.
- RF-6: EL SISTEMA debe impedir que existan dos aromas con el mismo nombre, ignorando mayúsculas, minúsculas y espacios al inicio y al final.
- RF-7: SI se intenta eliminar un aroma usado por alguna presentación, ENTONCES EL SISTEMA debe bloquear la operación.

### Productos

- RF-8: EL SISTEMA debe guardar cada producto con nombre, descripción y categoría obligatorios.
- RF-9: EL SISTEMA debe permitir que dos productos tengan el mismo nombre.
- RF-10: EL SISTEMA debe registrar la fecha de creación y la fecha de última actualización de cada producto, y una fecha de baja lógica opcional.

### Variedades

- RF-11: EL SISTEMA debe guardar cada variedad con nombre obligatorio, descripción opcional y pertenencia a un único producto.
- RF-12: EL SISTEMA debe impedir que un mismo producto tenga dos variedades con el mismo nombre, ignorando mayúsculas, minúsculas y espacios al inicio y al final.
- RF-13: EL SISTEMA debe permitir que dos productos distintos tengan variedades con el mismo nombre.
- RF-14: EL SISTEMA debe registrar la fecha de creación y la fecha de última actualización de cada variedad, y una fecha de baja lógica opcional.

### Presentaciones

- RF-15: EL SISTEMA debe guardar cada presentación con variedad, aroma opcional, descripción opcional, peso o cantidad, unidad, precio y stock.
- RF-16: EL SISTEMA debe guardar la unidad de medida como texto obligatorio, sin lista cerrada de valores, de hasta 20 caracteres (por ejemplo, g o ml).
- RF-17: EL SISTEMA debe exigir que el peso o cantidad sea mayor a cero, que el precio sea mayor o igual a cero y que el stock sea mayor o igual a cero.
- RF-18: EL SISTEMA debe manejar los precios en pesos argentinos con dos decimales.
- RF-19: EL SISTEMA debe permitir una etiqueta opcional de texto libre de hasta 50 caracteres por presentación, sin lista cerrada de valores.
- RF-20: EL SISTEMA debe impedir que una misma variedad tenga dos presentaciones con el mismo aroma, peso y unidad.
- RF-21: EL SISTEMA debe permitir que variedades o productos distintos tengan presentaciones con el mismo peso y unidad.
- RF-22: EL SISTEMA debe permitir que un producto tenga varias presentaciones con distinto peso o unidad.
- RF-23: EL SISTEMA debe registrar la fecha de creación y la fecha de última actualización de cada presentación, y una fecha de baja lógica opcional.

### Imágenes

- RF-24: EL SISTEMA debe permitir que una presentación tenga cero o más imágenes.
- RF-25: EL SISTEMA debe permitir marcar más de una imagen como principal en una misma presentación.
- RF-26: EL SISTEMA debe guardar la ruta del archivo de cada imagen, no su dirección completa.

### Integridad

- RF-27: EL SISTEMA debe impedir que exista una variedad sin producto, una presentación sin variedad o una imagen sin presentación.
- RF-28: CUANDO se elimina un producto, EL SISTEMA debe eliminar sus variedades, presentaciones e imágenes; CUANDO se elimina una variedad, sus presentaciones e imágenes; CUANDO se elimina una presentación, sus imágenes.

## Requisitos no funcionales

- RNF-1: Integridad referencial: las relaciones descritas siempre se cumplen, sin registros huérfanos.
- RNF-2: Consistencia: las comparaciones de nombres ignoran mayúsculas, minúsculas y espacios al inicio y al final.
- RNF-3: Rendimiento: toda clave foránea tiene un índice que la respalde, propio o provisto por un índice único compuesto.
- RNF-4: Moneda única (peso argentino); no se admite multi-moneda en esta versión.
- RNF-5: Verificabilidad: cada restricción debe poder comprobarse con datos demo y una consulta concreta.
- RNF-6: Idioma: nombres, descripciones y etiquetas visibles en español; las unidades se guardan como texto libre, por ejemplo g o ml.
- RNF-7: Los datos demo deben poder eliminarse sin afectar la estructura ni los datos reales.

## Casos límite

- Producto sin variedades: se permite a nivel de tablas.
- Producto sin imágenes: se permite.
- Presentación sin aroma: se guarda con el valor vacío y no se muestra como aroma.
- Presentación sin descripción: se guarda como valor nulo.
- Presentación sin etiqueta: se guarda sin etiqueta.
- Varias imágenes principales en una presentación: se permiten.
- Dos productos con el mismo nombre: se permite.
- Mismo peso y unidad en variedades o productos distintos: se permite.
- Unidad distinta de g o ml (por ejemplo, "unidad" o "sobre"): se acepta.
- Precio en cero (muestra o promoción): se acepta.
- Cambio de unidad o de peso en una presentación: se permite, siempre que no genere una combinación duplicada dentro de su variedad.
- Intento de borrar una categoría o un aroma en uso: se bloquea.
- Descripción de variedad vacía: se guarda como valor nulo.
- Fecha de baja lógica con valor: la fila sigue existiendo y se comporta igual que una activa; borrar sigue siendo físico y en cascada.

## Fuera de alcance

- Estado borrador/publicado y visibilidad del catálogo.
- Baja lógica, restauración y baja escalonada: la fecha de baja existe en las tablas, pero todavía no cambia el comportamiento.
- Variedad inicial automática al crear un producto.
- Subida, borrado y almacenamiento de archivos de imagen.
- RLS, roles, permisos y autenticación.
- Triggers, funciones y procedimientos almacenados.
- Catálogo público y panel de administración.
- Ventas, pedidos, carrito, pagos y reserva de stock.
- Historial de precios y movimientos de stock.
- Migración de los datos actuales escritos a mano.
- Búsqueda, filtros, orden y paginación.

## Criterios de finalización

- Las migraciones crean las cinco tablas con claves primarias, claves foráneas, unicidades, validaciones de rango e índices.
- Los seeders cargan datos demo y las consultas de verificación demuestran cada restricción.
- No hay contradicciones entre requisitos.
- El usuario aprueba la spec.

## Dudas abiertas

Ninguna.

## Nota posterior (nov 2026)
Esta spec quedó implementada y es histórica. La spec 002 (`specs/002-public_catalog/spec.md`) sustituye su afirmación de que la fecha de baja lógica no cambiaba el comportamiento: desde esa spec, cualquier valor no nulo en `deleted_at` oculta la fila en lectura, incluidas las fechas futuras, y la cascada se resuelve en la base de datos. No se modifica el texto original de esta spec.
