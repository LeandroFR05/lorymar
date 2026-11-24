import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  REQUIRED_ENV_VARS,
  assertRequiredEnv,
  findMissingEnvVars,
} from './env.js'

// Pruebas para la validación de variables de entorno requeridas (RF-38, RF-39).
describe('env', () => {
  it('define las variables públicas requeridas de Supabase', () => {
    assert.deepEqual(REQUIRED_ENV_VARS, [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
    ])
  })

  it('detecta ambas variables faltantes cuando el objeto está vacío', () => {
    assert.deepEqual(findMissingEnvVars({}), [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
    ])
  })

  it('detecta cuando falta una sola variable', () => {
    assert.deepEqual(
      findMissingEnvVars({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
      }),
      ['VITE_SUPABASE_ANON_KEY'],
    )

    assert.deepEqual(
      findMissingEnvVars({
        VITE_SUPABASE_ANON_KEY: 'public-anon-key',
      }),
      ['VITE_SUPABASE_URL'],
    )
  })

  it('detecta valores vacíos o compuestos solo por espacios en blanco', () => {
    assert.deepEqual(
      findMissingEnvVars({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '   ',
      }),
      ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    )
  })

  it('devuelve un arreglo vacío cuando ambas variables están presentes', () => {
    assert.deepEqual(
      findMissingEnvVars({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'public-anon-key',
      }),
      [],
    )
  })

  it('assertRequiredEnv lanza un error en español nombrando las variables faltantes', () => {
    assert.throws(
      () => assertRequiredEnv({ VITE_SUPABASE_URL: 'https://example.supabase.co' }),
      /VITE_SUPABASE_ANON_KEY/,
    )
  })

  it('assertRequiredEnv no lanza error cuando ambas variables están presentes', () => {
    assert.doesNotThrow(() =>
      assertRequiredEnv({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'public-anon-key',
      }),
    )
  })
})
