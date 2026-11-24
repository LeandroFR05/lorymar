import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: conectar con el servicio de newsletter (Mailchimp, Brevo, etc.)
    setSent(true)
    setEmail('')
  }

  return (
    <section id="contacto" className="section newsletter">
      <div className="container newsletter__box">
        <div>
          <p className="eyebrow eyebrow--light">Únete a la comunidad</p>
          <h2>Sé la primera en conocer el catálogo completo</h2>
          <p>Te avisaremos del lanzamiento y recibirás un 10% de descuento en tu primer pedido.</p>
        </div>
        {sent ? (
          <p className="newsletter__thanks">¡Gracias! Te escribiremos muy pronto 🌿</p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn--light">Suscribirme</button>
          </form>
        )}
      </div>
    </section>
  )
}
