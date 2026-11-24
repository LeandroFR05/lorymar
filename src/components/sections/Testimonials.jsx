const testimonials = [
  { name: 'Lucía M.', text: 'El sérum de rosa mosqueta me ha cambiado la piel. Se nota que está hecho con cariño.' },
  { name: 'Carmen R.', text: 'Por fin un champú sólido que funciona de verdad. Y sin plásticos, ¡me encanta!' },
  { name: 'Andrea P.', text: 'Tengo la piel muy sensible y el jabón de avena es lo único que no me irrita.' },
]

export default function Testimonials() {
  return (
    <section id="opiniones" className="section testimonials">
      <div className="container">
        <div className="section__header">
          <p className="eyebrow">Opiniones</p>
          <h2>Lo que dicen nuestros clientes</h2>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((t) => (
            <figure key={t.name} className="testimonial">
              <div className="testimonial__stars" aria-label="5 de 5 estrellas">★★★★★</div>
              <blockquote>“{t.text}”</blockquote>
              <figcaption>— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
