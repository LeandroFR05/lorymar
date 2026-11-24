import Leaf from './Leaf.jsx'
import { formatPrice } from '../../utils/formatPrice.js'

// Tarjeta de una variedad del catálogo: fondo de color (o foto), nombre, precio y etiqueta.
// No es clicable ni navega, no muestra descripción y lleva un botón "Comprar" deshabilitado
// como anticipo de la tienda (RF-18 a RF-20, RNF-8, RNF-10).
export default function ProductCard({ product }) {
  const { name, category, price, color, image, tag } = product

  return (
    <article className="card">
      <div className="card__media" style={{ background: color }}>
        {tag && <span className="card__tag">{tag}</span>}
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <Leaf className="card__leaf" color="rgba(255,255,255,0.75)" />
        )}
      </div>
      <div className="card__body">
        <span className="card__category">{category}</span>
        <h3>{name}</h3>
        <div className="card__footer">
          <span className="card__price">{formatPrice(price)}</span>
          {/* Botón deshabilitado nativo: no accionable y fuera del orden de tabulación (RF-20, RNF-10). */}
          <button
            type="button"
            className="btn btn--small btn--outline btn--disabled"
            disabled
            aria-disabled="true"
            title="La compra todavía no está disponible"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  )
}
