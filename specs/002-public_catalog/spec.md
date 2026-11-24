# Spec 002 — Catálogo público desde la base de datos

Estado: aprobada

## Contexto y objetivo

El catálogo de LoryMar hoy se muestra desde un listado escrito en el código (`src/data/products.js`), con precios en euros y categorías fijas. La base de datos del catálogo ya existe y está aplicada (spec 001): seis tablas con datos demo (4 categorías, 3 aromas, 7 productos, 9 variedades, 11 presentaciones y 2 imágenes), precios en pesos argentinos y una columna de baja lógica que hasta ahora no cambiaba el comportamiento. Falta activar RLS: hoy cualquier consulta con la clave pública puede escribir.

Esta spec define **la lectura del catálogo desde esa base y la grilla pública de la página de inicio que la consume**. El catálogo se organiza por **variedad**: cada tarjeta representa una variedad de un producto y muestra el precio de su presentación más barata; elegir otra presentación corresponde a la vista de detalle (spec posterior).

El Hero actual no se modifica en esta spec (seguirá leyendo temporalmente los datos escritos en el código hasta una spec futura de carrusel de categorías y páginas de categoría). La grilla de la página de inicio conserva su filtro por categoría alimentado ahora desde la base de datos.

Esta spec **sustituye lo que decía la spec 001** sobre que la fecha de baja no cambiaba el comportamiento: desde ahora, cualquier fecha de baja no nula oculta la fila. La spec 001 queda desactualizada en ese punto y debe anotarse al implementar.

El objetivo es que la grilla de inicio muestre el catálogo real en pesos argentinos, actualizado en la base sin recompilar, que un visitante anónimo no pueda escribir nada y que solo se sirvan al público las tablas y filas que la web usa.

## Usuarios

- Visitante anónimo: recorre y filtra el catálogo de la grilla de inicio sin iniciar sesión.
- Administrador: mantiene el catálogo en la base (la escritura desde el panel queda para otra spec).
- Equipo de desarrollo: verifica las políticas de acceso y los tests de la lógica.

## Historias de usuario

- HU-1. Como visitante, quiero ver los productos y variedades reales con su precio de entrada en pesos, para saber qué se vende hoy.
- HU-2. Como visitante, quiero entender si el catálogo está cargando, falló o está vacío, para no pensar que la tienda cerró.
- HU-3. Como visitante, quiero filtrar la grilla por las categorías que realmente tienen variedades disponibles.
- HU-4. Como administrador, quiero que un cambio en la base se refleje en la grilla sin tocar código.
- HU-5. Como equipo, quiero que la base no permita escrituras públicas, no entregue filas dadas de baja y no exponga tablas que la web no usa.
- HU-6. Como equipo, quiero probar la lógica de mapeo, orden y formato sin red ni credenciales.

## Definiciones

- **Tarjeta del catálogo**: unidad visual que representa una variedad visible, no un producto ni una presentación.
- **Fecha de baja lógica**: **cualquier valor no nulo** en la columna de baja marca la fila como dada de baja, incluidas las fechas futuras.
- **Presentación visible**: sin fecha de baja propia y con variedad y producto sin fecha de baja.
- **Variedad visible**: sin fecha de baja, con producto sin fecha de baja y con al menos una presentación visible.
- **Categoría visible**: categoría con al menos una variedad visible.
- **Categoría activa**: la categoría con la que se filtra la grilla de inicio; es "Todos" cuando no hay parámetro `categoria`, cuando está vacío o cuando su valor no corresponde a una categoría visible (en ese caso el parámetro se elimina, RF-22). El valor del parámetro es el NOMBRE de la categoría, comparado sin distinguir mayúsculas ni acentos; si el parámetro se repite, se usa el primer valor.
- **Presentación representativa**: la presentación visible de la variedad con el menor precio mayor que cero; si todas tienen precio cero, la de menor precio. Empates: menor peso numérico (aunque las unidades difieran, intencional) y, si persiste, menor identificador.
- **Precio de entrada**: precio de la presentación representativa; es el único precio que muestra la tarjeta.
- **Color de categoría**: color de una paleta fija asociada al nombre normalizado de la categoría (insensible a mayúsculas y acentos), usado como fondo ilustrado de la tarjeta.
- **Color neutro**: color de reserva de la paleta, para categorías sin color asignado.
- **Máximo de filas por consulta**: límite que el proyecto permite devolver en una lectura (1000).
- **Rol anónimo**: visitante sin sesión que consulta con la clave pública del proyecto, que no otorga más acceso que el de las políticas de la base.
- **Contrato de forma del producto**: objeto con las claves `id`, `name`, `category`, `price`, `color`, `image` y `tag` que consumen las tarjetas. `id` es el de la variedad; `image` es siempre la cadena vacía; el resto sale de la variedad, su producto y su presentación representativa. No incluye descripción: la tarjeta no la usa y queda para la vista de detalle.

## Requisitos funcionales

### Origen y carga del catálogo
- RF-1: EL SISTEMA debe obtener el catálogo público de la grilla de inicio (categorías, productos, variedades y presentaciones) de la base de datos del proyecto, no de datos escritos en el código.
- RF-2: EL SISTEMA debe leer el catálogo con el rol anónimo, sin pedir inicio de sesión.
- RF-3: EL SISTEMA debe obtener los datos del catálogo de la página de inicio con una sola petición, sin consultas por producto, variedad ni presentación. Única excepción: el reintento de RF-28.
- RF-4: CUANDO cualquier colección recibida (la de nivel superior o cualquiera de las anidadas dentro de ella) tiene tantas filas como el máximo por consulta o más, EL SISTEMA debe mostrar lo recibido y un aviso de que el catálogo puede estar incompleto; la detección compara solo la longitud de cada colección recibida y la paginación queda fuera de alcance. El umbral es conservador: se aplica igual a las anidadas aunque el límite técnico real pueda no alcanzarlas.
- RF-5: EL SISTEMA debe ordenar las tarjetas por nombre de producto y, dentro de cada producto, por nombre de variedad, con locale `es-AR`, comparación insensible a mayúsculas y acentos, y desempate por identificador de variedad. Cada par producto-variedad es una unidad independiente: los productos homónimos no se agrupan.

### Qué muestra cada tarjeta
- RF-6: EL SISTEMA debe mostrar una tarjeta por variedad visible.
- RF-7: EL SISTEMA debe mostrar como nombre "Producto — Variedad" (guion largo), y solo el nombre del producto cuando esa variedad es la única visible del producto.
- RF-8: EL SISTEMA debe mostrar como categoría de la tarjeta la del producto de la variedad.
- RF-9: EL SISTEMA debe mostrar como precio el de la presentación representativa: la visible más barata con precio mayor que cero, o cero si todas las visibles valen cero.
- RF-10: CUANDO dos presentaciones visibles de una variedad empatan en precio, EL SISTEMA debe elegir la de menor peso numérico y, si el empate continúa, la de menor identificador.
- RF-11: EL SISTEMA debe mostrar la etiqueta de la presentación representativa y ninguna cuando no tenga.
- RF-12: EL SISTEMA debe identificar cada tarjeta con el identificador de la variedad que representa.
- RF-13: EL SISTEMA debe mostrar los precios con `$`, un espacio, punto como separador de miles, coma decimal y dos decimales: `$ 24.900,00`, `$ 1.000,00`, `$ 0,00`, `$ 7,50`.
- RF-14: EL SISTEMA debe mantener el campo de precio del formulario del panel como entrada numérica con rótulo en pesos, sin símbolo ni separadores dentro del campo, y mostrar el valor formateado según RF-13 junto al campo.
- RF-15: MIENTRAS no exista almacenamiento público de imágenes, EL SISTEMA debe entregar `image` como cadena vacía y mostrar el fondo de color con la ilustración, sin intentar cargar rutas guardadas.
- RF-16: EL SISTEMA debe asignar el fondo de cada tarjeta según la categoría, con el color neutro para las categorías sin color asignado.
- RF-17: EL SISTEMA debe entregar a las tarjetas el contrato de forma del producto, sin `description`. La tarjeta conserva la estructura de imagen o fondo, nombre, precio y etiqueta.
- RF-18: EL SISTEMA no debe mostrar la descripción del producto ni de la variedad en la tarjeta; la tarjeta pierde ese bloque.
- RF-19: EL SISTEMA no debe permitir interactuar con la tarjeta ni navegar desde ella: no es clicable y no incluye la acción "Ver más".
- RF-20: EL SISTEMA debe mostrar en cada tarjeta un botón "Comprar" deshabilitado, sin acción ni envío de datos, como anticipo de la tienda.

### Filtro de categorías de la página de inicio
- RF-21: EL SISTEMA debe construir las opciones del filtro con las categorías visibles, con "Todos" siempre primero y el resto ordenado con locale `es-AR`, comparación insensible a mayúsculas y acentos, y desempate por identificador de categoría.
- RF-22: CUANDO el catálogo ya cargó y el parámetro `categoria` está vacío o pide una categoría inexistente o sin variedades visibles (comparando el nombre sin distinguir mayúsculas ni acentos), EL SISTEMA debe mostrar el catálogo completo, dejar "Todos" activo y eliminar el parámetro de la URL reemplazando la entrada del historial. Se elige esta línea (y no conservar el parámetro) porque así RF-23 se cumple siempre y la URL nunca contradice el filtro mostrado. Mientras carga o tras un error, el parámetro no se toca.
- RF-23: EL SISTEMA debe guardar el nombre de la categoría activa en el parámetro `categoria` (si se repite, vale el primer valor), y no debe haber parámetro cuando la categoría activa es "Todos".
- RF-24: EL SISTEMA debe ocultar el filtro mientras el catálogo carga y tras un error, y mostrarlo solo cuando haya datos.
- RF-25: SI no hay ninguna variedad visible, ENTONCES EL SISTEMA debe ocultar el filtro.

### Estados de la interfaz
- RF-26: MIENTRAS el catálogo carga, EL SISTEMA debe mostrar un aviso de carga en el lugar de la grilla, sin tarjetas vacías ni datos inventados.
- RF-27: SI la lectura falla, ENTONCES EL SISTEMA debe mostrar un mensaje de error en español, ofrecer reintentar y no sustituir el catálogo por datos escritos en el código; el resto de la página sigue visible.
- RF-28: CUANDO el visitante pide reintentar, EL SISTEMA debe repetir la lectura (única excepción a "una sola petición", RF-3 y RNF-1) y mostrar el aviso de carga mientras la resuelve.
- RF-29: SI no hay ninguna variedad visible en la página de inicio, ENTONCES EL SISTEMA debe mostrar un mensaje de catálogo vacío.

### Acceso a los datos
- RF-30: EL SISTEMA debe permitir al rol anónimo leer únicamente las tablas de categorías, productos, variedades y presentaciones.
- RF-31: EL SISTEMA no debe permitir al rol anónimo leer las tablas de imágenes ni de aromas; su apertura queda para otras specs.
- RF-32: EL SISTEMA debe impedir que el rol anónimo inserte, modifique o elimine filas en cualquier tabla.
- RF-33: MIENTRAS no exista autenticación, EL SISTEMA debe impedir la escritura a todo rol público, incluido el autenticado (hoy sin uso).
- RF-34: EL SISTEMA debe aplicar las reglas de acceso en la base, de modo que una consulta directa con la clave pública no obtenga filas con baja lógica propia ni en cascada (RF-35, RF-36). Las políticas no garantizan que existan hijos visibles: una variedad sin presentaciones visibles o una categoría sin variedades visibles pueden salir de una consulta directa; no es un fallo de seguridad, el cliente las filtra al construir las tarjetas.
- RF-35: EL SISTEMA debe ocultar toda fila con cualquier valor no nulo en la fecha de baja, incluidas las futuras.
- RF-36: EL SISTEMA debe resolver la cascada de bajas en la base (una variedad con el producto dado de baja, o una presentación con la variedad o el producto dados de baja, no se entregan); además, la web debe descartar de nuevo esas filas como segunda barrera.
- RF-37: EL SISTEMA debe limitar la lectura pública al esquema `public` y a esas cuatro tablas, sin abrir ninguna otra.

### Configuración
- RF-38: EL SISTEMA debe tomar la dirección del proyecto y la clave pública de variables de entorno del frontend, con un archivo de ejemplo versionado y el archivo real excluido del repositorio.
- RF-39: SI falta alguna de esas variables al compilar o al arrancar en desarrollo, ENTONCES EL SISTEMA debe detenerse con un mensaje que nombre la variable faltante.
- RF-40: SI la configuración ya compilada es inválida en ejecución (clave revocada, proyecto caído o sin conexión), ENTONCES EL SISTEMA debe mostrar el estado de error con reintento y mantener visible el resto de la página.
- RF-41: EL SISTEMA no debe incluir la clave de servicio (`service_role`) ni ninguna credencial privada en el frontend, en el repositorio ni en la plantilla de variables.

> Excepción al principio 5 de la constitución, aprobada por el usuario: la dirección del proyecto y la clave pública pueden llegar al navegador; la clave de servicio y cualquier otro secreto siguen prohibidos. Si la spec se aprueba, el coordinador debe registrar esta excepción en `docs/constitution.md` o `MEMORY.md` como decisión.

## Requisitos no funcionales

- RNF-1: Rendimiento: la página de inicio resuelve su catálogo con una sola petición.
- RNF-2: Aislamiento de fallos: un fallo del catálogo no impide ver el resto de la página.
- RNF-3: Seguridad y mínimo privilegio: lectura anónima solo de cuatro tablas, cero escritura pública y ninguna credencial privada en el cliente; las reglas del rol anónimo se comprueban con la clave pública y, al no existir autenticación, las del rol autenticado se verifican revisando las políticas (RF-33).
- RNF-4: Separación de responsabilidades: la presentación representativa, el nombre, el orden, la derivación de categorías del filtro, la detección de catálogo incompleto, el formato de precio y el mapeo viven fuera de los componentes, sin depender de la red ni de la configuración.
- RNF-5: Verificación: toda función pura lleva tests automatizados, sin red ni credenciales, cubriendo al menos:
  - Nombre con y sin guion largo; producto con una y con varias variedades.
  - Precio: presentación única, precio cero, todas en cero, empate de precio y de peso; presentación sin etiqueta; formato con miles, cero y decimales.
  - Visibilidad: variedad sin presentaciones visibles, baja propia y cascada desde producto o variedad.
  - Derivación de categorías del filtro (solo visibles); color conocido y desconocido; categoría inexistente en la URL; orden de tarjetas y de categorías con mayúsculas, acentos y desempate por identificador.
  - Parámetro `categoria`: nombre válido con otras mayúsculas o acentos, vacío, inexistente, repetido (primer valor).
  - Catálogo incompleto con datos sintéticos: colecciones de 999, 1000 y 1001 elementos, en el nivel superior y en las anidadas, sin datos reales.
- RNF-6: Accesibilidad: los estados de carga, error, vacío y catálogo incompleto se anuncian a lectores de pantalla y no dependen solo del color.
- RNF-7: Idioma: identificadores en inglés; textos visibles, mensajes y esta spec en español.
- RNF-8: Compatibilidad: se mantiene la estructura de la tarjeta (fondo o imagen, nombre, precio y etiqueta); cambian el bloque de descripción (se elimina), la acción "Ver más" (se elimina), el nombre y el precio en pesos, se añade "Comprar" deshabilitado y el contrato pierde `description`.
- RNF-9: Trazabilidad: cada RF tiene al menos una comprobación manual en el navegador (incluida la vista móvil), un test automatizado o una consulta directa a la base con la clave pública.
- RNF-10: Accesibilidad de la acción pendiente: "Comprar" se anuncia como no disponible, no se activa con ratón, teclado ni lector, y no altera el orden de tabulación ni crea trampas de foco.

## Casos límite

- Producto con dos variedades visibles: dos tarjetas con nombres "Champú Sólido de Romero — Cabello graso" y "… — Cabello seco", cada una con su precio.
- Variedad sin presentaciones visibles, variedad o presentación dadas de baja, producto dado de baja (cascada) o fecha de baja futura: no se muestran ni cuentan para el precio.
- Presentación de precio cero y otra mayor: se muestra el mayor; todas en cero: `$ 0,00`. Miles: `$ 1.000,00`.
- Empate de precio: gana el menor peso numérico, luego el menor identificador (100 g y 100 ml empatan en peso). Con igual peso y unidad pero distinto aroma, solo una resulta representativa.
- Categoría sin variedades visibles (o variedad sin presentaciones visibles): una consulta directa puede devolverla (RF-34) y el cliente la descarta; no aparece en el filtro.
- `?categoria=Maquillaje` (inexistente) o `?categoria=` (vacío): catálogo completo, "Todos" activo y, tras cargar, el parámetro se elimina; si la lectura falla, no se toca. `?categoria=rostro` equivale a "Rostro"; repetido, vale el primer valor. Una categoría llamada literalmente "Todos" sería indistinguible del valor por defecto (caso conocido, sin datos demo así).
- Catálogo vacío, carga en curso o error de lectura (incluida configuración inválida): filtro oculto; según el caso, mensaje de vacío, aviso de carga o error con reintento, con el resto de la página visible.
- Nombres homónimos: se ordenan por identificador de variedad y cada tarjeta conserva su identificador. "Áloe" y "aloe" se comparan igual.
- Categoría sin color en la paleta (con los datos demo, "Aromaterapia"): color neutro. Cambio de categoría de un producto en la base: el filtro se recalcula solo.

## Fuera de alcance

- Modificar el Hero actual (`src/components/sections/Hero.jsx`), el carrusel de categorías y las páginas por categoría (`/categoria/...`): el Hero sigue leyendo temporalmente `src/data/products.js` (donde `formatPrice` pasa a formatear sus importes en pesos) hasta una spec futura.
- Comportamiento del carrusel más allá de la rotación actual: pausa al pasar el puntero o al enfocar con teclado y `prefers-reduced-motion` (deuda conocida, spec futura).
- Vista de detalle (spec futura): tarjeta clicable, descripción y selector de presentación.
- Compra y tienda: carrito, checkout, pedidos, pagos y stock; "Comprar" queda deshabilitado.
- Filtros adicionales, búsqueda, orden configurable y paginación real (el límite solo produce un aviso).
- Autenticación real; el acceso provisional del panel no cambia.
- Escritura desde `/admin`: el formulario sigue sin persistir y sigue leyendo las categorías escritas en el código; solo se ajusta el precio a pesos.
- Subida y almacenamiento de imágenes, y apertura de las tablas de imágenes y aromas al rol anónimo.
- Registrar bajas lógicas (solo se respetan), ocultar variedades sin stock y modificar las seis tablas de la spec 001.
- Migrar a TypeScript, añadir un UI-kit y tests automatizados de interfaz.

## Criterios de finalización

- Con la clave pública, el rol anónimo lee las cuatro tablas; las escrituras fallan; imágenes, aromas y otra tabla de `public` devuelven error o cero filas.
- Ninguna consulta anónima devuelve filas con baja propia o del padre, tampoco con fechas futuras.
- Inicio: 9 tarjetas y 5 opciones de filtro en la grilla, alimentadas desde la base sin leer `src/data/products.js` en la grilla.
- Con `?categoria=Maquillaje` se ve el catálogo completo, "Todos" activo y, ya cargado, sin parámetro en la URL.
- La página de inicio carga su catálogo con una sola petición (actividad de red del navegador).
- Los precios se ven como `$ 24.900,00`, `$ 7,50` y `$ 0,00`, también en el panel.
- Las tarjetas no muestran descripción ni "Ver más", no son clicables y muestran "Comprar" deshabilitado, comprobado con ratón, teclado y lector.
- Filtro oculto mientras carga y tras un error; estados de carga, error, vacío y catálogo incompleto comprobados en el navegador, también en móvil.
- La suite de tests pasa con los casos de RNF-5, sin red ni credenciales.
- RF-33: una prueba de escritura con el rol anónimo falla en las seis tablas; como no hay autenticación, el rol autenticado se verifica revisando las políticas de la base: no existe ninguna política de escritura para ningún rol.
- RF-41: (a) la clave de servicio no aparece en el repositorio ni en el paquete compilado y (b) la plantilla de variables solo lista la dirección del proyecto y la clave pública.
- La compilación y el análisis estático pasan; sin las variables, la compilación falla nombrando la faltante; el archivo de ejemplo está versionado y el real excluido del repositorio.
- No hay contradicciones entre requisitos y el usuario aprueba la spec.

## Dudas abiertas

Ninguna. Deuda conocida (no son dudas): carrusel de categorías en el Hero y páginas de categoría (spec futura); pausa del carrusel y `prefers-reduced-motion` (spec futura); `?categoria=` es ambiguo si dos categorías difieren solo en acentos (caso raro, sin datos demo, no se resuelve aquí).
