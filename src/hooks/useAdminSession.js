import { useCallback, useState } from 'react'

const ADMIN_SESSION_KEY = 'lorymar-admin'

// Lee la marca de acceso guardada en la sesión del navegador.
function readAdminSession() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
}

// Gestiona el acceso provisional al panel durante la sesión actual.
export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState(readAdminSession)

  const login = useCallback(() => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    setIsAdmin(true)
  }, [])

  return { isAdmin, login }
}
