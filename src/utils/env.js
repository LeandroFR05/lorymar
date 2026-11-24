// Variables de entorno requeridas para conectar el cliente público de Supabase (RF-38, RF-39).
export const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

// Devuelve la lista de variables requeridas que faltan o están vacías.
export function findMissingEnvVars(env = {}) {
  return REQUIRED_ENV_VARS.filter((name) => {
    const value = env?.[name]
    return typeof value !== 'string' || value.trim().length === 0
  })
}

// Lanza un error indicando las variables faltantes si la configuración está incompleta.
export function assertRequiredEnv(env = {}) {
  const missing = findMissingEnvVars(env)
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. Configura tu archivo .env basándote en .env.example.`,
    )
  }
}
