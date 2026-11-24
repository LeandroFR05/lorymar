import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatPrice } from './formatPrice.js'

// Pruebas para el formato de precios en pesos argentinos (RF-13).
describe('formatPrice', () => {
  it('formatea miles y decimales con $ + espacio, punto de miles y coma decimal', () => {
    assert.equal(formatPrice(24900), '$ 24.900,00')
  })

  it('agrupa con punto los importes de cuatro cifras', () => {
    assert.equal(formatPrice(1000), '$ 1.000,00')
  })

  it('formatea el precio cero con dos decimales', () => {
    assert.equal(formatPrice(0), '$ 0,00')
  })

  it('completa a dos decimales cuando hay un solo decimal', () => {
    assert.equal(formatPrice(7.5), '$ 7,50')
  })

  it('separa múltiples grupos de miles en importes de siete cifras', () => {
    assert.equal(formatPrice(1234567.8), '$ 1.234.567,80')
  })
})
