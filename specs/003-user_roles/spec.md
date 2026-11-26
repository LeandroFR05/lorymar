# Spec 003 — Roles de usuario en Supabase Auth

Estado: implementada

## Contexto y objetivo

El panel de administración de LoryMar se protege hoy con una marca en `sessionStorage` y credenciales demo escritas en el cliente (`src/data/admin.js`): cualquiera puede saltarse el login. La base del catálogo existe (spec 001) y está cerrada con RLS (spec 002): el rol anónimo lee cuatro tablas y nadie puede escribir; el esquema `public` no tiene usuarios ni forma de distinguir un administrador.

El usuario creó ya una cuenta de prueba en Supabase Auth y decidió, tras investigarlo, que **no se crea ninguna tabla de usuarios**: los usuarios viven en Supabase Auth, el registro público queda **abierto** y los permisos se distinguen con **roles** (`admin` y `cliente`). Un borrador anterior de esta spec (perfiles en `public.users` más membresía en `public.admins`, con trigger y función de verificación) quedó descartado por esa decisión: nada de eso llega a la base.

**Dónde vive el rol (decisión):** en el claim `role` dentro de `app_metadata` del usuario en Supabase Auth. Es la vía sin tablas nuevas que pide el usuario: el claim solo se edita desde el dashboard del proyecto o con acceso de servicio (nunca por API del propio usuario), viaja firmado dentro del JWT y las políticas del catálogo lo comprueban envuelto en una subconsulta (una evaluación por sentencia). Alternativa descartada: tabla de membresía con función `security definer`, cuyo efecto sería inmediato sin refrescar el token, a costa de volver a los objetos que el usuario decidió no crear. Limitación declarada del claim: cambiar el rol surte efecto cuando el usuario refresca su sesión (token nuevo), no en la consulta siguiente.

Esta spec define **solo la capa de datos**: qué puede hacer cada rol sobre las seis tablas del catálogo. El dueño entra como administrador con una cuenta creada previamente; cualquier cuenta auto-registrada es cliente y no gana escritura; anónimo y cliente leen todo el catálogo, aromas e imágenes incluidos — lectura preparatoria: la aplicación todavía no los muestra (RNF-7).

Esta spec **sustituye en parte el RF-33 de la spec 002 y su criterio de finalización** (ver "Nota posterior"). El login provisional del panel NO cambia: la autenticación real del panel y la persistencia del formulario quedan para specs posteriores; el objetivo es que la base quede lista para cuando ese paso llegue.

## Usuarios

- Administrador (dueño): cuenta creada a mano en el dashboard con claim `admin`; mantiene el catálogo desde la base.
- Cliente: cuenta auto-registrada por API; hoy recorre el catálogo como un visitante y no escribe nada.
- Visitante anónimo: recorre el catálogo sin cuenta.
- Equipo de desarrollo: asigna claims desde el dashboard y verifica las políticas.

## Historias de usuario

- HU-1. Como dueño, quiero entrar con mi cuenta ya creada y leer el catálogo completo y crear, modificar y eliminar en sus seis tablas, para mantener la tienda.
- HU-2. Como dueño, quiero que el registro siga abierto, sin que ninguna cuenta auto-registrada gane permiso de escritura.
- HU-3. Como cliente con cuenta, quiero ver exactamente lo mismo que un visitante sin cuenta.
- HU-4. Como equipo, quiero que los roles vivan en Supabase Auth sin tablas nuevas, para no mantener objetos propios.
- HU-5. Como equipo, quiero comprobar las políticas con la cuenta de prueba ya creada, sin versionar credenciales.
- HU-6. Como equipo, quiero que aromas e imágenes estén legibles por API para los roles públicos, para que la vista de detalle y el carrusel de specs futuras puedan consumirlas sin volver a tocar permisos.

## Definiciones

- **Supabase Auth**: servicio de autenticación del proyecto; guarda los usuarios y el hash de sus contraseñas en `auth.users`, fuera del esquema `public`.
- **Claim de rol**: valor `role` dentro de `app_metadata` del usuario en Supabase Auth; incluido firmado en el JWT y solo editable desde el dashboard del proyecto o con acceso de servicio.
- **Administrador**: usuario autenticado cuyo claim `role` vale `admin`.
- **Cliente (`customer`)**: usuario autenticado sin claim `admin` (sin claim o con cualquier otro valor). Es el estado por defecto de toda cuenta auto-registrada.
- **Registro abierto**: cualquiera puede crear una cuenta vía API con la clave pública; la nueva cuenta es cliente.
- **Visibilidad de la spec 002**: filas sin baja lógica propia ni en cascada; para las imágenes, la de su presentación (RF-34 a RF-36 de la spec 002).
- **Catálogo**: las seis tablas de la spec 001 (`categories`, `aromas`, `products`, `varieties`, `presentations`, `pictures`).
- **Roles públicos**: `anon` y `authenticated`, los que llegan con la clave pública; el equipo gestiona la base con acceso directo.

## Requisitos funcionales

### El rol y dónde vive

- RF-1: EL SISTEMA debe basar los roles solo en el claim `role` dentro de `app_metadata` en Supabase Auth, asignado a mano desde el dashboard o con acceso de servicio: es el único lugar donde un rol queda guardado —el administrador lo lleva con valor `admin`; el cliente es la ausencia de ese valor y no necesita rol almacenado— y nada de esto crea tablas nuevas en `public` ni funciones ni triggers propios.
- RF-2: EL SISTEMA debe impedir que un usuario cambie su propio rol por API: el claim se asigna solo desde el dashboard del proyecto o con acceso de servicio.
- RF-3: EL SISTEMA debe reconocer como administrador únicamente al usuario autenticado con claim `role = 'admin'`; toda cuenta sin ese valor es cliente.
- RF-4: CUANDO se crea una cuenta por registro público, ENTONCES EL SISTEMA debe tratarla como cliente, sin asignarle claim ni ejecutar mecanismo automático alguno.

### Acceso del administrador

- RF-5: EL SISTEMA debe permitir al administrador leer las seis tablas del catálogo por completo: todas las filas, incluidas las que tienen fecha de baja lógica.
- RF-6: EL SISTEMA debe permitir al anónimo, al cliente y al administrador leer las tablas de aromas e imágenes (sustituye a la spec 002, RF-31), con la visibilidad del default 4: aromas completos —la tabla no tiene baja lógica, como las categorías— e imágenes solo de presentaciones visibles, sin baja propia ni en cascada (RF-36 de la spec 002); el administrador ve además las imágenes de presentaciones dadas de baja (RF-5).
- RF-7: EL SISTEMA debe permitir al administrador crear, modificar y eliminar filas en las seis tablas del catálogo, respetando las validaciones y unicidades de la spec 001.
- RF-8: EL SISTEMA debe someter las eliminaciones del administrador a las reglas de la spec 001: impedir eliminar categorías y aromas en uso y propagar en cascada el resto (producto → variedades, presentaciones e imágenes; variedad → presentaciones e imágenes; presentación → imágenes).
- RF-9: MIENTRAS la baja lógica no sea un flujo propio, EL SISTEMA debe tratarla como una modificación común, y solo en `products`, `varieties` y `presentations`, las únicas con columna de baja (`categories` y `aromas` no la tienen y esta spec no se la añade): el administrador da de baja o reactiva una fila poniendo o limpiando su fecha.

### Acceso del cliente

- RF-10: EL SISTEMA debe permitir al cliente leer las seis tablas del catálogo con exactamente la misma visibilidad que el rol anónimo (default declarado: el cliente no ve más ni menos que el visitante): las cuatro de la spec 002, aromas completos e imágenes solo de presentaciones visibles (RF-6).
- RF-11: EL SISTEMA debe impedir al cliente toda escritura sobre las seis tablas: la inserción rechazada con error de política; la modificación y la eliminación, cero filas afectadas.
- RF-12: EL SISTEMA debe responder al cliente con exactamente las mismas filas que al anónimo al leer aromas e imágenes (RF-6): sin cero filas ni error de permiso.

### Anónimo

- RF-13: EL SISTEMA debe mantener para el rol anónimo el acceso de la spec 002 en categorías, productos, variedades y presentaciones (lectura sin baja lógica) y ampliarlo con la lectura de aromas e imágenes (RF-6); toda escritura sigue denegada con error de permiso.

## Requisitos no funcionales

- RNF-1: Mínimo privilegio: cero tablas nuevas; grants de lectura de las seis tablas a `anon` y `authenticated`, y de escritura solo a `authenticated` (el rol del administrador), con RLS dejando al cliente sin efecto en escritura; sin `truncate` en ninguna tabla.
- RNF-2: Rendimiento de las políticas: el claim del JWT se comprueba envuelto en una subconsulta, evaluado una vez por sentencia y no por fila.
- RNF-3: La base manda: el permiso lo deciden las políticas, no el cliente; una consulta vía API con sesión de administrador lee y escribe, la misma consulta con sesión de cliente escribe exactamente nada (RF-11) y lee lo mismo que el anónimo (RF-10 y RF-12), y sin sesión se leen las seis tablas con la visibilidad pública y ninguna escritura pasa.
- RNF-4: Cero credenciales (principio 5): sin contraseñas en `public`, sin clave de servicio en el frontend ni en el repositorio; el claim se gestiona desde el dashboard y las credenciales de las cuentas de prueba no se versionan.
- RNF-5: Verificabilidad: cada RF de acceso se comprueba vía API con la clave pública y el JWT de las cuentas de prueba (o, en el editor SQL, suplantando los claims del token), sin depender de la interfaz, que en esta spec no cambia.
- RNF-6: Idioma: identificadores y valores del claim en inglés (`admin`, `customer`); esta spec en español; no hay textos visibles nuevos.
- RNF-7: Sin cambios en la aplicación: esta spec no añade ni modifica código del frontend; el acceso provisional del panel sigue siendo el actual (deuda conocida).

## Casos límite

- Cuenta auto-registrada con el registro abierto: es cliente desde su creación (RF-4); lee como el anónimo, aromas e imágenes incluidos, y no escribe nada.
- Cambio de claim (asignar o quitar `admin` desde el dashboard): surte efecto al refrescar la sesión del usuario —token nuevo— y no en la consulta siguiente; limitación conocida y aceptada de los claims (la alternativa descartada, membresía en tabla, la evitaría).
- Cliente con claim explícito `customer`: se comporta igual que sin claim.
- Claim con un valor desconocido (error de tipeo o valor no previsto, asignado a mano): la cuenta se comporta como cliente: lee como el visitante y no escribe —solo el valor exacto `admin` abre el acceso de administración—.
- Cliente y anónimo leen aromas e imágenes: ambos reciben las mismas filas, sin asimetría de error ni cero filas.
- Imagen de una presentación con baja lógica: oculta al anónimo y al cliente, visible al administrador (RF-5).
- Imagen cuya presentación no tiene baja propia pero su variedad o su producto sí: oculta al anónimo y al cliente por la cascada de la spec 002 (RF-36), visible al administrador.
- Aromas: tabla sin baja lógica, como las categorías; siempre legible por completo por los tres roles.
- Un usuario intenta auto-asignarse el claim `admin`: imposible por API (RF-2); el JWT lo firma el servicio y `app_metadata` solo se edita con acceso de servicio.
- Admin elimina una categoría o un aroma en uso: bloqueado (spec 001, RF-4 y RF-7).
- Admin elimina un producto: sus variedades, presentaciones e imágenes se eliminan con él (spec 001, RF-28).
- Admin consulta el catálogo: ve también las filas con baja lógica (propias, en cascada y futuras), incluidas las imágenes de presentaciones dadas de baja, que anónimo y cliente no ven.
- El admin no salta la integridad: nombres no vacíos, unicidad de aroma + peso + unidad por variedad y rangos de precio y stock siguen aplicándole (RF-7).
- `updated_at` no se actualiza sola: quien modifica una fila es responsable de ajustarla (sin triggers en el catálogo, como en la spec 001).
- Se quita el claim al único administrador y refresca su sesión: nadie queda con acceso de escritura hasta reasignarlo desde el dashboard.
- `truncate` intentado por el admin: denegado (RNF-1).

## Fuera de alcance

- Autenticación real del panel: el login provisional (`sessionStorage`, credenciales demo en el cliente) no cambia; sustituirlo es spec posterior.
- Persistencia del formulario de `/admin`: sigue sin guardar; spec posterior.
- Flujos del cliente (carrito, favoritos, historial, checkout): la cuenta cliente existe, pero no tiene funcionalidad propia en esta spec.
- Interfaz de gestión de roles y usuarios (asignar o quitar roles desde la web).
- Tablas de perfiles o membresías: descartadas por decisión del usuario; columnas nuevas en las seis tablas de la spec 001.
- Roles además de `admin` y `customer`, listas de roles y permisos más finos que "todo el catálogo".
- La configuración del registro (abierto por decisión del usuario) y el resto de Supabase Auth (confirmación de correo, recuperación de contraseña, bloqueos).
- Subida y almacenamiento de archivos de imagen: el admin crea y borra filas de `pictures`, no archivos.
- Consumo de aromas e imágenes en la interfaz (vista de detalle, carrusel, foto en la tarjeta): abrir su lectura en esta spec es preparatorio; la web no cambia (RNF-7).
- Cambios en las tablas y restricciones de la spec 001; la escritura pública sigue prohibida como en la spec 002.

## Criterios de finalización

- Las migraciones no crean tablas nuevas y aplican grants y políticas de RF-5 a RF-13: grants de lectura de las seis tablas a `anon` y `authenticated`, y de escritura solo a `authenticated` (el rol del administrador), incluido el uso de las secuencias `identity` que generan los identificadores al insertar; políticas de administración por claim; políticas de lectura del anónimo y del cliente: las cuatro tablas como en la spec 002, aromas como las categorías (completos) e imágenes como las presentaciones: solo de presentaciones visibles con la cascada completa de la spec 002 (RF-36) —presentación sin baja propia y con variedad y producto sin baja—.
- Sin sesión (solo clave pública): las seis tablas legibles — cuatro con la visibilidad de la spec 002, aromas completos e imágenes solo de presentaciones visibles con su cascada completa (RF-36 de la spec 002: presentación sin baja propia y con variedad y producto sin baja); toda escritura con error de permiso.
- Registro abierto (condición previa verificable de este criterio, decisión del usuario; esta spec no cambia esa configuración): una cuenta creada por API con la clave pública funciona y es cliente (RF-4): lee las seis tablas con la visibilidad del anónimo y sus escrituras no tienen efecto (inserción rechazada, cero filas modificadas o eliminadas).
- La cuenta de prueba ya creada por el usuario, con claim `admin` asignado desde el dashboard (credenciales no versionadas), tras refrescar su sesión: lee las seis tablas completas (incluidas filas con baja lógica) y crea, modifica y elimina al menos una fila demo en cada una, en orden por dependencias (categoría y aroma → producto → variedad → presentación → imagen; la categoría demo se elimina solo tras desvincular su producto demo, y el aroma demo, solo tras desvincular la presentación que lo usa), con los identificadores generados sin pasos manuales.
- Una actualización de la propia cuenta por API no modifica el claim de rol (RF-2).
- Las eliminaciones del admin respetan la spec 001: una categoría o un aroma en uso no se eliminan y un producto arrastra su cascada (con filas demo).
- Quitado el claim a la cuenta de administrador y refrescada su sesión: vuelve al comportamiento de cliente; con el token anterior seguía administrando (caso límite del cambio de claim).
- Al terminar, se eliminan las filas demo creadas para verificar y el catálogo demo queda como estaba; las cuentas de verificación quedan a elección del usuario (la auto-registrada no otorga nada; la del administrador es la cuenta de acceso del dueño).
- La aplicación no cambia: compila y funciona igual que antes de esta spec; no hay código nuevo en el frontend.
- No hay contradicciones entre requisitos y el usuario aprueba la spec.

## Dudas abiertas

Ninguna. Decisiones declaradas (defaults) que el usuario valida al aprobar:

1. Valores del claim: `admin` para el administrador; el cliente (`customer`) es la ausencia de ese valor, sin mecanismo automático de asignación (principio 6: identificadores en inglés).
2. Lectura del cliente: idéntica a la del anónimo (ni más ni menos).
3. La cuenta de prueba ya creada se usa como cuenta de acceso del administrador (claim `admin` desde el dashboard) y se conserva tras la verificación.
4. Visibilidad pública de aromas e imágenes: aromas completos (la tabla no tiene baja lógica, igual que las categorías) e imágenes solo de presentaciones visibles (la cascada de la spec 002). Alternativa descartada: filtrar aromas por uso en presentaciones visibles, que ocultaría los aromas sin uso y complicaría la consulta sin una necesidad actual.

## Nota posterior (pendiente de anotar en la spec 002)

Esta spec sustituye en parte varios puntos de la spec 002. Sobre la escritura: el RF-33 ("MIENTRAS no exista autenticación, EL SISTEMA debe impedir la escritura a todo rol público, incluido el autenticado"), su criterio de finalización ("no existe ninguna política de escritura para ningún rol") y su RNF-3, tanto en la "lectura anónima solo de cuatro tablas" como en remitir las reglas del rol autenticado a revisar políticas "al no existir autenticación": desde ahora existe autenticación, el administrador autenticado SÍ puede escribir en las seis tablas del catálogo, sí existen políticas de escritura (solo para el claim `admin`) y las reglas del rol autenticado —administrador y cliente— se comprueban con sesiones reales; los clientes autenticados siguen sin poder escribir. Sobre la lectura de aromas e imágenes: el "únicamente las tablas de categorías, productos, variedades y presentaciones" del RF-30, el RF-31 completo ("no debe permitir al rol anónimo leer las tablas de imágenes ni de aromas; su apertura queda para otras specs"), el "a esas cuatro tablas" del RF-37, el criterio de finalización que exige que "imágenes, aromas y otra tabla de public devuelvan error o cero filas" y el punto de su "Fuera de alcance" que postergaba "la apertura de las tablas de imágenes y aromas al rol anónimo" (la subida y almacenamiento de archivos de ese mismo punto sigue fuera de alcance): desde ahora anónimo y cliente también leen aromas completos e imágenes de presentaciones visibles. El resto de la spec 002 sigue vigente: RF-32, RF-34 a RF-36 y RF-41, y el RF-30 y el RF-37 en todo salvo su parte de lectura, que esta spec sustituye (verificado: el RNF-5 de la 002 no arrastra referencias a aromas o imágenes cerradas). Al implementar, añadir esta nota al final de `specs/002-public_catalog/spec.md`, cubriendo todos los puntos citados, como se hizo con la 001.
