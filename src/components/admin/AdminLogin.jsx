import { useEffect, useRef, useState } from 'react'
import { ADMIN_CREDENTIALS } from '../../data/admin.js'

export default function AdminLogin({ onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const usernameRef = useRef(null)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()

    const isValid =
      username.trim() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password

    if (isValid) {
      onSuccess()
    } else {
      setError('Usuario o contraseña incorrectos.')
    }
  }

  return (
    <div
      className="admin-login"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="admin-login__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <button
          type="button"
          className="admin-login__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <p className="eyebrow">Acceso privado</p>
        <h2 id="admin-login-title">Administrador</h2>
        
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__field">
            <label htmlFor="admin-username">Usuario</label>
            <input
              ref={usernameRef}
              id="admin-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="admin-login__field">
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
