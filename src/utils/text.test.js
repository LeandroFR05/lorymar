import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { compareNames, normalizeText } from './text.js'

// Pruebas para normalización y comparación de textos con locale es-AR (RF-5, RF-21, RF-22).
describe('text', () => {
  describe('normalizeText', () => {
    it('recorta espacios, quita tildes/diacríticos y convierte a minúsculas', () => {
      assert.equal(normalizeText('  Áloe Vera  '), 'aloe vera')
      assert.equal(normalizeText('SÉRUM DE ROSA'), 'serum de rosa')
      assert.equal(normalizeText('Champú Sólido'), 'champu solido')
    })

    it('normaliza cadenas compuestas y descompuestas (NFC y NFD) por igual', () => {
      const nfc = 'Áloe'.normalize('NFC')
      const nfd = 'Áloe'.normalize('NFD')
      assert.equal(normalizeText(nfc), 'aloe')
      assert.equal(normalizeText(nfd), 'aloe')
    })

    it('devuelve cadena vacía para entradas nulas, indefinidas o vacías', () => {
      assert.equal(normalizeText(''), '')
      assert.equal(normalizeText('   '), '')
      assert.equal(normalizeText(null), '')
      assert.equal(normalizeText(undefined), '')
    })
  })

  describe('compareNames', () => {
    it('considera iguales nombres que solo difieren en mayúsculas o acentos', () => {
      assert.equal(compareNames('Áloe', 'aloe'), 0)
      assert.equal(compareNames('Rostro', 'ROSTRO'), 0)
      assert.equal(compareNames('Champú', 'champu'), 0)
    })

    it('ordena alfabéticamente con locale es-AR sin distinguir tildes ni mayúsculas', () => {
      assert.ok(compareNames('Aceite', 'Crema') < 0)
      assert.ok(compareNames('Jabón', 'Aceite') > 0)
      assert.ok(compareNames('Árbol', 'Bálsamo') < 0)
    })
  })
})
