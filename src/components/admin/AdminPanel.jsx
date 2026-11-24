import { useState } from 'react'
import AddProductForm from './AddProductForm.jsx'

// Secciones del menú lateral. Para añadir otra: nueva entrada aquí + su componente.
const SECTIONS = [
  { id: 'add-product', label: 'Agregar productos', Component: AddProductForm },
]

export default function AdminPanel() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const { Component: ActiveSection } = SECTIONS.find((s) => s.id === activeId)

  return (
    <div className="admin-panel">
      {/* Menú de navegación del panel */}
      <nav className="admin-panel__menu" aria-label="Menú de administración">
        <p className="eyebrow">Administración</p>
        <ul>
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="admin-panel__link"
                aria-current={id === activeId ? 'page' : undefined}
                onClick={() => setActiveId(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="admin-panel__content">
        <ActiveSection />
      </main>
    </div>
  )
}
