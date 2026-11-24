import Leaf from '../ui/Leaf.jsx'

export default function About() {
  return (
    <section id="nosotros" className="section about">
      <div className="container about__inner">
        <div className="about__visual" aria-hidden="true">
          <Leaf className="about__leaf" color="#f7f3ec" />
          <div className="about__stat">
            <strong>+10</strong>
            <span>años creando cosmética consciente</span>
          </div>
        </div>
        <div className="about__text">
          <p className="eyebrow">Nuestra historia</p>
          <h2>Nacimos en un pequeño taller, entre plantas y aceites</h2>
          <p>
            Raíz &amp; Flor surgió de una idea sencilla: crear productos que nosotras mismas
            quisiéramos usar. Cosmética honesta, con listas de ingredientes cortas y comprensibles,
            elaborada en pequeños lotes para conservar todas sus propiedades.
          </p>
          <p>
            Trabajamos con agricultores locales y proveedores certificados, y cuidamos cada detalle,
            desde la semilla hasta el envase.
          </p>
          <ul className="about__list">
            <li>Ingredientes certificados ecológicos</li>
            <li>Producción local y artesanal</li>
            <li>Fórmulas aptas para pieles sensibles</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
