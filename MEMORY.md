# MEMORY.md — Cosmética natural LoryMar
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- v1 funcionando: landing con Hero, Values, ProductGrid, About, Testimonials, Newsletter, Footer.
- Catálogo público lee de Supabase (rol anónimo) en tiempo de carga; `src/data/products.js` solo alimenta el Hero y las categorías del formulario admin.
- Admin provisional: login cliente → `/admin` protegido por `useAdminSession` (sessionStorage).
- Stack: Vite + React 19 + React Router 8 + JS puro. Estilos en `src/styles/`.

## Decisiones (y por qué)
- Router con `BrowserRouter`, `lazy()` + `Suspense` en páginas.
- Filtro sincronizado con URL (`?categoria=...`) usando `replace: true`.
- Sin Zustand: no hay estado global compartido.
- Lógica fuera de componentes: `utils/` + `hooks/` + tests con `node --test`.
- Clave pública Supabase en frontend (excepción aprobada al principio 5); `service_role` prohibido.
- `CURRENT_YEAR` calculado al cargar el módulo para no llamar `Date` en render.

## Aprendizajes y errores a evitar
- Deuda técnica: marca mezclada LoryMar/Raíz & Flor; orden de headings; emoji en Newsletter; falta `robots.txt`; login no es seguro; falta fallback SPA en deploy.
- Spec 001/002 implementadas. 002 oculta cualquier `deleted_at` no nulo (incluido futuro); RLS permite solo SELECT anónimo.
- `useSearchParams`: `getAll('categoria')` devuelve `['']` con `?categoria=`; hay que distinguirlo de `[]`.
- Carrusel del Hero: respeta `prefers-reduced-motion` y se pausa en hover/focus (no reanuda mientras el foco viaja entre descendientes).
- `useProductFilter.setCategory` estabilizado con `useCallback`. `React.memo` en `ProductCard` no es útil: `visibleCards` cambia de referencia al filtrar, así que el memo no evitaría re-renders significativos.

## Próximos pasos
- Spec del carrusel de categorías y vista de detalle (Hero seguirá usando `products.js` hasta entonces).
- Actualizar `AGENTS.md` para reflejar que `products.js` ya no es el catálogo.
- Escribir excepción al principio 5 en `docs/constitution.md` (aprobada, falta formalizar).
- Agregar focus trap y retorno de foco al modal `AdminLogin`.
