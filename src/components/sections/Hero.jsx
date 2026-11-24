import { useEffect, useState } from 'react'
import { products } from '../../data/products.js'
import { formatPrice } from '../../utils/formatPrice.js'

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.(MOTION_QUERY).matches ?? false,
  )

  // Escucha cambios en la preferencia de movimiento reducido del sistema.
  useEffect(() => {
    const media = window.matchMedia?.(MOTION_QUERY)
    if (!media) return

    const handleChange = (e) => setReducedMotion(e.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  // Carrusel automático: avanza cada 3 segundos mientras no haya pausa
  // (puntero encima o foco dentro) ni preferencia de movimiento reducido.
  useEffect(() => {
    if (reducedMotion) return
    if (isPaused) return

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % products.length)
    }, 3000)
    return () => clearInterval(id)
  }, [reducedMotion, isPaused])

  const actual = products[index]

  const handleFocus = () => setIsPaused(true)

  const handleBlur = (e) => {
    // Solo reanuda si el foco sale definitivamente del hero.
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsPaused(false)
    }
  }

  return (
    <section
      id="inicio"
      className="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="container hero__inner">
        <div className="hero__text">
          <h1>Descubrí lo que la naturaleza puede hacer por vos</h1>
          <p className="hero__lead">
            Fórmulas sencillas con ingredientes de origen vegetal, ecológicos y de proximidad.
            Sin parabenos, sin siliconas y nunca testado en animales.
          </p>
          <div className="hero__actions">
            <a href="#productos" className="btn">Descubrir productos</a>
            <a href="#nosotros" className="btn btn--ghost">Nuestra historia</a>
          </div>
        </div>

        {/* Arco de botica: su fondo toma el color del producto actual y el frasco
            se apoya en la repisa. El `key` re-monta el frasco para repetir el fundido. */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__arch" style={{ backgroundColor: actual.color }}>
            <div className="hero__bottle" key={actual.id}>
              <div className="hero__bottle-cap" />
              <div className="hero__bottle-body">
                <div className="hero__bottle-label">
                  <small>{actual.category}</small>
                  <strong>{actual.name}</strong>
                  <span className="hero__bottle-price">{formatPrice(actual.price)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero__shelf" />

          {/* Posición del carrusel */}
          <div className="hero__dots">
            {products.map((p, i) => (
              <span
                key={p.id}
                className={i === index ? 'hero__dot hero__dot--active' : 'hero__dot'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
