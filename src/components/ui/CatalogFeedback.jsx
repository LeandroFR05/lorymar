// Estados visibles de la grilla del catálogo: carga, error con reintento, vacío e incompleto.
// Todos se anuncian a lectores de pantalla y no dependen solo del color (RF-26 a RF-29, RNF-6).

export default function CatalogFeedback({
  status,
  error,
  retry,
  isEmpty = false,
  isIncomplete = false,
}) {
  // Aviso de catálogo incompleto: puede convivir con las tarjetas (RF-4).
  if (status === 'ready' && isIncomplete) {
    return (
      <p className="catalog-feedback catalog-feedback--warning" role="status">
        <span className="catalog-feedback__icon" aria-hidden="true">!</span>
        <span>
          El catálogo puede estar incompleto: se alcanzó el máximo de filas por
          consulta y puede faltar algún producto por mostrar.
        </span>
      </p>
    )
  }

  // Aviso de carga en el lugar de la grilla, sin tarjetas vacías (RF-26).
  if (status === 'loading') {
    return (
      <p className="catalog-feedback catalog-feedback--loading" role="status">
        <span className="catalog-feedback__icon" aria-hidden="true">…</span>
        <span>Cargando el catálogo…</span>
      </p>
    )
  }

  // Error de lectura con reintento; el resto de la página sigue visible (RF-27, RF-28).
  if (status === 'error') {
    return (
      <div className="catalog-feedback catalog-feedback--error" role="alert">
        <p className="catalog-feedback__message">
          <span className="catalog-feedback__icon" aria-hidden="true">×</span>
          <span>
            No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.
          </span>
        </p>
        {error?.message ? (
          <p className="catalog-feedback__detail">{error.message}</p>
        ) : null}
        <button
          type="button"
          className="btn btn--small btn--outline"
          onClick={() => retry?.()}
        >
          Reintentar
        </button>
      </div>
    )
  }

  // Catálogo sin variedades visibles (RF-29).
  if (status === 'ready' && isEmpty) {
    return (
      <p className="catalog-feedback catalog-feedback--empty" role="status">
        <span className="catalog-feedback__icon" aria-hidden="true">◦</span>
        <span>
          Todavía no tenemos productos en el catálogo.
        </span>
      </p>
    )
  }

  return null
}
