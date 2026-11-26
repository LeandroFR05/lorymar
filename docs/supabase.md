## Funcionamiento de SUPABASE AUTH
### Usuario autenticado
-Registro abierto: cualquier persona puede registrarse y se crea su registro en auth.users.
-Registro cerrado: solo los usuarios ya existentes pueden iniciar sesión.

### Usuario no autenticado
-Aquel que no tiene ningún usuario en el sistema. (Funcionamiento actual).
-Cualquiera que entre a la página solamente tiene el permiso de lectura.



## JWT (JSON Web Token) 
Es una cadena de texto firmada criptográficamente que identifica a un usuario o cliente y define sus permisos para acceder a los recursos del proyecto.
Sirve como la base de la autenticación y autorización en Supabase: cada vez que un usuario inicia sesión o interactúa con las API, el token lleva sus datos de identidad y permite que Postgres aplique las reglas de Row Level Security (RLS) y roles correspondientes.

### Cómo funciona el flujo de JWT en el proyecto
1. Autenticación → emisión del token. Cuando alguien inicia sesión (email + contraseña), Supabase Auth verifica la contraseña contra el hash que guarda en auth.users y — solo si la cuenta está confirmada — emite un JWT: un token firmado digitalmente que viaja al navegador.
2. El JWT carga los "claims". Dentro del token viajan datos: sub (id del usuario), email, role: "authenticated", y lo importante para nosotros: app_metadata, donde vive el claim role: "admin". Como la firma la pone el servicio con su clave privada, nadie puede falsificar el contenido: si alguien modifica el token, la firma deja de cuadrar y se rechaza. Y app_metadata no se edita por API (RF-2) — solo desde el dashboard. Por eso el claim es confiable para permisos.
3. Cada consulta lleva el token. El frontend manda Authorization: Bearer <JWT> en cada petición a la API. Sin token, la petición viaja con la clave pública → rol anon.
4. PostgREST elige el rol de Postgres. Con JWT válido → rol authenticated; sin JWT → rol anon. Los grants de nuestra migración (T1) definen qué puede intentar cada rol: anon solo lectura de las 6 tablas; authenticated lectura + escritura + secuencias.
5. RLS decide qué filas. Antes de responder, Postgres evalúa las políticas con los claims del token (auth.jwt()): las 14 que creamos. Cliente (sin claim admin) → ve exactamente lo mismo que el anónimo y cero escritura (su insert choca con el with check, su update/delete tocan 0 filas — los 42501 que vimos en T3). Admin → ve todo, escribe todo. Esto es lo que simulamos en el editor SQL con set_config('request.jwt.claims', ...): imitar el paso 5 sin cuenta real.
6. Por qué te frenó la confirmación de correo. Mientras email_confirmed_at sea null, Auth no emite JWT: el login devuelve 400 email_not_confirmed. El botón "Confirm user" (o el UPDATE equivalente) pone ese timestamp y habilita el paso 1 — por eso la T3 necesita esa confirmación para poder obtener el JWT del cliente y probar todo el circuito con un usuario real.
7. Por qué el cambio de rol no es instantáneo. Los claims se "hornean" dentro del token cuando se emite. Si cambiás app_metadata en el dashboard, el token viejo sigue diciendo lo que decía; el efecto aparece cuando el usuario refresca sesión y recibe un token nuevo. Es la limitación que declaramos en la spec, y T4 la verifica de ambos lados (con el token viejo seguís siendo admin hasta refrescar).



## GRANT (Conceder)
GRANT es el comando SQL heredado de PostgreSQL que sirve para dar permisos a un rol sobre objetos de la base de datos (como tablas, vistas, funciones o secuencias). Sin ese permiso explícito, el rol no puede operar sobre el objeto, aunque la petición llegue a tu API.


Función auth.jwt()