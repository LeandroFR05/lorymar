import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { pickRepresentativePresentation } from './representativePresentation.js'

// Pruebas para la selección de la presentación representativa de una variedad (RF-9, RF-10, RF-11, RF-35).
describe('representativePresentation', () => {
  it('devuelve null cuando la lista está vacía, es nula o todas están dadas de baja', () => {
    assert.equal(pickRepresentativePresentation([]), null)
    assert.equal(pickRepresentativePresentation(null), null)
    assert.equal(pickRepresentativePresentation(undefined), null)
    assert.equal(
      pickRepresentativePresentation([
        { id: 1, price: '8900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: '2026-01-01T00:00:00Z' },
        { id: 2, price: '9500.00', weight: '120.00', unit: 'g', tag: 'Nuevo', deleted_at: '2099-12-31T23:59:59Z' },
      ]),
      null,
    )
  })

  it('elige la única presentación visible y normaliza sus valores numéricos y etiqueta', () => {
    const rep = pickRepresentativePresentation([
      { id: 10, price: '8900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
    ])
    assert.deepEqual(rep, {
      id: 10,
      price: 8900,
      weight: 100,
      unit: 'g',
      tag: null,
    })
  })

  it('cuando hay una presentación con precio cero y otra con precio mayor que cero, elige la mayor que cero', () => {
    const rep = pickRepresentativePresentation([
      { id: 1, price: '24900.00', weight: '30.00', unit: 'ml', tag: 'Más vendido', deleted_at: null },
      { id: 2, price: '0.00', weight: '5.00', unit: 'ml', tag: null, deleted_at: null },
    ])
    assert.equal(rep.id, 1)
    assert.equal(rep.price, 24900)
    assert.equal(rep.tag, 'Más vendido')
  })

  it('cuando hay varias presentaciones con precio mayor que cero, elige la de menor precio', () => {
    const rep = pickRepresentativePresentation([
      { id: 5, price: '24900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
      { id: 4, price: '15900.00', weight: '50.00', unit: 'g', tag: 'Nuevo', deleted_at: null },
    ])
    assert.equal(rep.id, 4)
    assert.equal(rep.price, 15900)
    assert.equal(rep.tag, 'Nuevo')
  })

  it('cuando todas las presentaciones visibles tienen precio cero, elige entre ellas con precio 0', () => {
    const rep = pickRepresentativePresentation([
      { id: 8, price: '0.00', weight: '50.00', unit: 'ml', tag: null, deleted_at: null },
      { id: 7, price: '0.00', weight: '15.00', unit: 'ml', tag: 'Muestra', deleted_at: null },
    ])
    assert.equal(rep.id, 7)
    assert.equal(rep.price, 0)
    assert.equal(rep.tag, 'Muestra')
  })

  it('desempata igual precio eligiendo el menor peso numérico sin importar la unidad (g contra ml)', () => {
    const rep = pickRepresentativePresentation([
      { id: 1, price: '10000.00', weight: '100.00', unit: 'ml', tag: null, deleted_at: null },
      { id: 2, price: '10000.00', weight: '50.00', unit: 'g', tag: 'Compacto', deleted_at: null },
    ])
    assert.equal(rep.id, 2)
    assert.equal(rep.weight, 50)
    assert.equal(rep.tag, 'Compacto')
  })

  it('desempata igual precio e igual peso numérico (aunque difieran g y ml) eligiendo el menor id', () => {
    const rep = pickRepresentativePresentation([
      { id: 9, price: '10000.00', weight: '100.00', unit: 'g', tag: 'Lavanda', deleted_at: null },
      { id: 3, price: '10000.00', weight: '100.00', unit: 'ml', tag: 'Romero', deleted_at: null },
    ])
    assert.equal(rep.id, 3)
    assert.equal(rep.tag, 'Romero')
  })

  it('ignora presentaciones dadas de baja (pasadas o futuras) aunque sean más baratas', () => {
    const rep = pickRepresentativePresentation([
      { id: 1, price: '5000.00', weight: '50.00', unit: 'g', tag: 'Oferta', deleted_at: '2026-05-01T10:00:00Z' },
      { id: 2, price: '6000.00', weight: '50.00', unit: 'g', tag: 'Futura', deleted_at: '2099-01-01T00:00:00Z' },
      { id: 3, price: '12000.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
    ])
    assert.equal(rep.id, 3)
    assert.equal(rep.price, 12000)
    assert.equal(rep.tag, null)
  })

  it('devuelve tag como null cuando la presentación representativa no tiene etiqueta o está vacía', () => {
    const repNull = pickRepresentativePresentation([
      { id: 1, price: '4500.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
    ])
    const repEmpty = pickRepresentativePresentation([
      { id: 2, price: '4500.00', weight: '100.00', unit: 'g', tag: '   ', deleted_at: null },
    ])
    assert.equal(repNull.tag, null)
    assert.equal(repEmpty.tag, null)
  })
})
