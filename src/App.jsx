import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { useAdminSession } from './hooks/useAdminSession.js'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

// Protege el panel: sin la marca de sesión se redirige al inicio.
function RequireAdmin({ children }) {
  const { isAdmin } = useAdminSession()
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Suspense fallback={<p className="sr-only" role="status">Cargando…</p>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
