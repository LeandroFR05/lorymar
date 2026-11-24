import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MAX_ROWS, isCatalogIncomplete } from './catalogLimits.js'

// Pruebas para la detección de catálogo potencialmente incompleto por límite de filas (RF-4, RNF-5).
describe('catalogLimits', () => {
  it('define MAX_ROWS en 1000', () => {
    assert.equal(MAX_ROWS, 1000)
  })

  it('devuelve false cuando la colección raíz es vacía, nula o tiene 999 filas y las anidadas tienen menos de 1000', () => {
    assert.equal(isCatalogIncomplete([]), false)
    assert.equal(isCatalogIncomplete(null), false)
    assert.equal(isCatalogIncomplete(undefined), false)

    const rows999 = Array.from({ length: 999 }, (_, i) => ({
      id: i + 1,
      presentations: [{ id: 1 }],
    }))
    assert.equal(isCatalogIncomplete(rows999), false)
  })

  it('devuelve true cuando la colección de nivel superior alcanza 1000 o 1001 elementos', () => {
    const rows1000 = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      presentations: [],
    }))
    const rows1001 = Array.from({ length: 1001 }, (_, i) => ({
      id: i + 1,
      presentations: [],
    }))

    assert.equal(isCatalogIncomplete(rows1000), true)
    assert.equal(isCatalogIncomplete(rows1001), true)
  })

  it('devuelve false cuando una colección anidada presentations tiene 999 elementos y la raíz tiene menos de 1000', () => {
    const rows = [
      {
        id: 1,
        presentations: Array.from({ length: 999 }, (_, i) => ({ id: i + 1 })),
      },
    ]
    assert.equal(isCatalogIncomplete(rows), false)
  })

  it('devuelve true cuando alguna colección anidada presentations tiene 1000 o 1001 elementos', () => {
    const rowsWith1000 = [
      { id: 1, presentations: [{ id: 1 }] },
      {
        id: 2,
        presentations: Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 })),
      },
    ]
    const rowsWith1001 = [
      {
        id: 1,
        presentations: Array.from({ length: 1001 }, (_, i) => ({ id: i + 1 })),
      },
    ]

    assert.equal(isCatalogIncomplete(rowsWith1000), true)
    assert.equal(isCatalogIncomplete(rowsWith1001), true)
  })
})
