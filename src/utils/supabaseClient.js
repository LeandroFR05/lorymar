import { createClient } from '@supabase/supabase-js'

// Cliente anónimo de Supabase para lectura del catálogo público sin sesión persistente (RF-2).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Reintentos automáticos desactivados: supabase-js reintenta los GET hasta 3 veces
  // (backoff 1s/2s/4s) ante errores de red o HTTP 503/520, lo que rompería RF-3
  // ("una sola petición") y duplicaría el reintento manual de RF-28.
  db: {
    retry: false,
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
