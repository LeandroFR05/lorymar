import { useEffect, useState } from 'react'
import AdminLogin from '../admin/AdminLogin.jsx'

const links = [
  { href: '#productos', label: 'Productos' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Navbar({ onAdminAccess }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#inicio" className="logo" onClick={() => setOpen(false)}>
          LoryMar
        </a>

        <button
          className={`navbar__toggle ${open ? 'is-open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#productos" className="btn btn--small" onClick={() => setOpen(false)}>
            Ver catálogo
          </a>
          <button
            type="button"
            className="btn btn--outline btn--small"
            onClick={() => {
              setOpen(false)
              setLoginOpen(true)
            }}
          >
            Administrador
          </button>
        </nav>
      </div>
      {loginOpen && (
        <AdminLogin
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            setLoginOpen(false)
            onAdminAccess()
          }}
        />
      )}
    </header>
  )
}
