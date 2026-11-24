import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CATALOG_SELECT, fetchCatalog } from './catalogQuery.js'

// Cliente falso que registra las llamadas realizadas y devuelve una respuesta fija.
function createFakeClient(response) {
  const calls = { from: [], select: [] }

  return {
    calls,
    from(table) {
      calls.from.push(table)
      return {
        select(columns) {
          calls.select.push(columns)
          return Promise.resolve(response)
        },
      }
    },
  }
}

// Pruebas para la consulta única del catálogo público y su lectura (RF-1, RF-3, RF-31, RNF-1).
describe('catalogQuery', () => {
  describe('CATALOG_SELECT', () => {
    it('es una consulta raíz en varieties con productos, categorías y presentaciones anidadas', () => {
      assert.equal(typeof CATALOG_SELECT, 'string')
      assert.ok(CATALOG_SELECT.startsWith('id, name, deleted_at'))
      assert.ok(CATALOG_SELECT.includes('products ('))
      assert.ok(CATALOG_SELECT.includes('categories ('))
      assert.ok(CATALOG_SELECT.includes('presentations ('))
    })

    it('no pide columnas ni tablas que no usa la tarjeta (RF-17, RF-31)', () => {
      for (const forbidden of ['description', 'stock', 'pictures', 'aromas']) {
        assert.equal(
          CATALOG_SELECT.includes(forbidden),
          false,
          `CATALOG_SELECT no debe mencionar "${forbidden}"`,
        )
      }
    })
  })

  describe('fetchCatalog', () => {
    it('hace exactamente una llamada a from("varieties") y un select(CATALOG_SELECT)', async () => {
      const client = createFakeClient({ data: [{ id: 1 }], error: null })

      await fetchCatalog(client)

      assert.deepEqual(client.calls.from, ['varieties'])
      assert.equal(client.calls.select.length, 1)
      assert.equal(client.calls.select[0], CATALOG_SELECT)
    })

    it('devuelve las filas recibidas cuando la consulta no da error', async () => {
      const rows = [
        {
          id: 1,
          name: 'Única',
          deleted_at: null,
          products: {
            id: 1,
            name: 'Sérum',
            deleted_at: null,
            categories: { id: 1, name: 'Rostro' },
          },
          presentations: [
            {
              id: 1,
              price: '24900.00',
              weight: '30.00',
              unit: 'ml',
              tag: null,
              deleted_at: null,
            },
          ],
        },
      ]
      const client = createFakeClient({ data: rows, error: null })

      assert.deepEqual(await fetchCatalog(client), rows)
    })

    it('devuelve un arreglo vacío cuando la respuesta trae data null', async () => {
      const client = createFakeClient({ data: null, error: null })

      assert.deepEqual(await fetchCatalog(client), [])
    })

    it('devuelve un arreglo vacío cuando la respuesta no trae data ni error', async () => {
      const client = createFakeClient({})

      assert.deepEqual(await fetchCatalog(client), [])
    })

    it('lanza un error con el mensaje del fallo cuando la consulta responde con error', async () => {
      const client = createFakeClient({ data: null, error: { message: 'boom' } })

      await assert.rejects(() => fetchCatalog(client), /boom/)
    })

    it('no hace una segunda petición cuando la primera falla', async () => {
      const client = createFakeClient({ data: null, error: { message: 'boom' } })

      await assert.rejects(() => fetchCatalog(client))

      assert.equal(client.calls.from.length, 1)
      assert.equal(client.calls.select.length, 1)
    })
  })
})
