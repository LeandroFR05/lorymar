import { useProductFilter } from '../../hooks/useProductFilter.js'
import CatalogFeedback from '../ui/CatalogFeedback.jsx'
import ProductCard from '../ui/ProductCard.jsx'

// Grilla del catálogo de la página de inicio.
// Recibe el estado y el catálogo de `useCatalog` desde `HomePage` (una sola petición) y
// pinta las tarjetas filtradas por categoría (RF-6, RF-21 a RF-29).
export default function ProductGrid({ status, catalog, error, retry }) {
  const { options, activeCategory, setCategory, visibleCards } = useProductFilter(
    catalog,
    status,
  )

  // El filtro solo se muestra cuando hay datos: se oculta al cargar, tras un error y sin variedades (RF-24, RF-25).
  const showFilters = status === 'ready' && options.length > 1 && visibleCards.length > 0

  return (
    <section id="productos" className="section products">
      <div className="container">
        <div className="section__header">
          <h2>Rituales de cuidado natural</h2>
          <p>Una selección de nuestros favoritos. Muy pronto, el catálogo completo.</p>
        </div>

        {showFilters && (
          <div className="filters" role="group" aria-label="Filtrar por categoría">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={activeCategory === option}
                className={`filter ${activeCategory === option ? 'is-active' : ''}`}
                onClick={() => setCategory(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        { /* mensajes informativos */ }
        <CatalogFeedback
          status={status}
          error={error}
          retry={retry}
          isEmpty={status === 'ready' && visibleCards.length === 0}
          isIncomplete={Boolean(catalog?.incomplete)}
        />

        {/* se muestran las tarjetas de los productos */}
        {visibleCards.length > 0 && (
          <div className="products__grid">
            {visibleCards.map((card) => (
              <ProductCard key={card.id} product={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
