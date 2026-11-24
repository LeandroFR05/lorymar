# AGENTS.md — cosmetica-natural (LoryMar)
Sitio web para una empresa de cosmética natural llamada LoryMar, con Vite + React 19. JavaScript puro con JSX — por ahora sin Typescript, así que no existe paso de typecheck; `lint` es la única verificación estática.

## Comandos
```bash
npm run dev       # servidor de desarrollo con HMR
npm run build     # build de producción a dist/
npm run preview   # sirve el build de dist/
npm run lint      # oxlint (config en .oxlintrc.json)

# Tests de lógica: node --test
```

## Estructura
- `src/App.jsx` — compone las secciones en orden: Navbar, Hero, Values, ProductGrid, About, Testimonials, Newsletter, Footer. Añadir una sección nueva = crear componente en `src/components/` e insertarlo aquí.
- `src/data/products.js` — fuente provisional, ya no alimenta la grilla de inicio: esa lee de Supabase con rol anónimo (`src/utils/catalogQuery.js` + `src/hooks/useCatalog.js` + `src/utils/catalogMapper.js`). Queda solo como fuente del carrusel del Hero (`src/components/sections/Hero.jsx`) y de las categorías del formulario del panel (`src/components/admin/AddProductForm.jsx`), y está llamada a ser reemplazada cuando se implemente el carrusel de categorías y la vista de detalle. `color` pinta el fondo ilustrado mientras no haya foto; al añadir imágenes, poner `image: '/productos/x.jpg'` (en `public/`) y la tarjeta la muestra automáticamente.
- `src/utils/` — lógica pura y acceso a datos: `catalogQuery.js` (consulta al catálogo), `catalogMapper.js` (mapeo filas → tarjetas), `categoryFilter.js` (filtro y parámetro `categoria`), `representativePresentation.js` (presentación más barata), `formatPrice.js` (pesos argentinos), `text.js`, `categoryColor.js`, `env.js` y `supabaseClient.js`.
- `src/index.css` — solo `@import`s: es el punto de entrada de los estilos; el orden de los imports es parte de la cascada. Stylesheet global (sin CSS modules ni Tailwind). El contenido vive en `src/styles/`: `variables.css` (custom properties), `base.css` (reset, tipografía, utilidades y `prefers-reduced-motion`), `buttons.css`, `sections/<seccion>.css` (incluye sus `@keyframes`) y `responsive.css` (todos los `@media` agrupados). Fuentes (`Cormorant Garamond`, `Inter`) se cargan en `index.html` via Google Fonts.

## Convenciones
- Realizar comentarios en español de lo más importante que hace cada sección de código.
- Lint configura `react/rules-of-hooks` como error y `react/only-export-components` con `allowConstantExport` — no mezclar exports de componentes con hooks/lógica en el mismo archivo salvo constantes.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Forma de trabajar
- Utilizá BUENAS PRÁCTICAS de programación. Tené en cuenta las skills.
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar. 

## Límites
✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.

## Verificación
- Después de cambios grandes, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.

## Comandos
- Tests: `node --test`

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 
