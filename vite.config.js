import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { assertRequiredEnv } from './src/utils/env.js'

// Plugin que verifica al compilar o al iniciar el servidor de desarrollo
// que las variables públicas requeridas de Supabase estén presentes (RF-39).
function validateSupabaseEnvPlugin() {
  return {
    name: 'validate-supabase-env',
    config(userConfig, { mode, command }) {
      if (command === 'build' || command === 'serve') {
        const root = userConfig.root || process.cwd()
        const env = loadEnv(mode, root, 'VITE_')
        assertRequiredEnv(env)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [validateSupabaseEnvPlugin(), react()],
})
