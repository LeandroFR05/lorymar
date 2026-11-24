const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <a href="#inicio" className="logo">LoryMar</a>
          <p>Cosmética natural, hecha a mano con respeto por ti y por el planeta.</p>
        </div>
        <div>
          <h4>Explora</h4>
          <a href="#productos">Productos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#opiniones">Opiniones</a>
        </div>
        <div>
          <h4>Contacto</h4>
          <a href="mailto:hola@raizyflor.com">hola@raizyflor.com</a>
          <a href="tel:+34600000000">+34 600 000 000</a>
          <span>Instagram · Facebook</span>
        </div>
      </div>
      <p className="footer__copy">© {CURRENT_YEAR} Raíz &amp; Flor. Todos los derechos reservados.</p>
    </footer>
  )
}
