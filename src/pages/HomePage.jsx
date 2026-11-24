import { useNavigate } from 'react-router'
import Navbar from '../components/layout/Navbar.jsx'
import Hero from '../components/sections/Hero.jsx'
import Values from '../components/sections/Values.jsx'
import ProductGrid from '../components/sections/ProductGrid.jsx'
import About from '../components/sections/About.jsx'
import Testimonials from '../components/sections/Testimonials.jsx'
import Newsletter from '../components/sections/Newsletter.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAdminSession } from '../hooks/useAdminSession.js'
import { useCatalog } from '../hooks/useCatalog.js'

export default function HomePage() {
  const navigate = useNavigate()
  const { login } = useAdminSession()
  // Una sola lectura del catálogo para toda la página de inicio (RF-3, RNF-1).
  const catalogState = useCatalog()

  // Tras validar el login, guarda la sesión y navega al panel.
  const handleAdminAccess = () => {
    login()
    navigate('/admin')
  }

  return (
    <>
      <Navbar onAdminAccess={handleAdminAccess} />
      <main>
        <Hero />
        <Values />
        <ProductGrid
          status={catalogState.status}
          catalog={catalogState.catalog}
          error={catalogState.error}
          retry={catalogState.retry}
        />
        <About />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
