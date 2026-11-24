import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCatalog } from './catalogMapper.js'
import { CATEGORY_PALETTE, NEUTRAL_COLOR } from './categoryColor.js'

// Fixture sintético equivalente a los datos demo de la base (4 categorías, 7 productos, 9 variedades, 11 presentaciones).
function createDemoRows() {
  const catRostro = { id: 1, name: 'Rostro' }
  const catCabello = { id: 2, name: 'Cabello' }
  const catCuerpo = { id: 3, name: 'Cuerpo' }
  const catAromaterapia = { id: 4, name: 'Aromaterapia' }

  const prodSerum = { id: 1, name: 'Sérum de Rosa Mosqueta', deleted_at: null, categories: catRostro }
  const prodChampu = { id: 2, name: 'Champú Sólido de Romero', deleted_at: null, categories: catCabello }
  const prodCrema = { id: 3, name: 'Crema Hidratante de Aloe', deleted_at: null, categories: catRostro }
  const prodJabon = { id: 4, name: 'Jabón de Avena y Miel', deleted_at: null, categories: catCuerpo }
  const prodManteca = { id: 5, name: 'Manteca Corporal de Karité', deleted_at: null, categories: catCuerpo }
  const prodAceite = { id: 6, name: 'Aceite Capilar de Argán', deleted_at: null, categories: catCabello }
  const prodDifusor = { id: 7, name: 'Difusor de Aromaterapia', deleted_at: null, categories: catAromaterapia }

  return [
    {
      id: 1,
      name: 'Única',
      deleted_at: null,
      products: prodSerum,
      presentations: [
        { id: 1, price: '24900.00', weight: '30.00', unit: 'ml', tag: 'Más vendido', deleted_at: null },
        { id: 2, price: '0.00', weight: '5.00', unit: 'ml', tag: null, deleted_at: null },
      ],
    },
    {
      id: 2,
      name: 'Cabello graso',
      deleted_at: null,
      products: prodChampu,
      presentations: [
        { id: 3, price: '8900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
      ],
    },
    {
      id: 3,
      name: 'Cabello seco',
      deleted_at: null,
      products: prodChampu,
      presentations: [
        { id: 4, price: '9500.00', weight: '120.00', unit: 'g', tag: null, deleted_at: null },
      ],
    },
    {
      id: 4,
      name: 'Única',
      deleted_at: null,
      products: prodCrema,
      presentations: [
        { id: 5, price: '15900.00', weight: '50.00', unit: 'g', tag: 'Nuevo', deleted_at: null },
        { id: 6, price: '24900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
      ],
    },
    {
      id: 5,
      name: 'Única',
      deleted_at: null,
      products: prodJabon,
      presentations: [
        { id: 7, price: '4500.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null },
      ],
    },
    {
      id: 6,
      name: 'Única',
      deleted_at: null,
      products: prodManteca,
      presentations: [
        { id: 8, price: '18500.00', weight: '200.00', unit: 'ml', tag: null, deleted_at: null },
      ],
    },
    {
      id: 7,
      name: 'Cabello fino',
      deleted_at: null,
      products: prodAceite,
      presentations: [
        { id: 9, price: '12900.00', weight: '50.00', unit: 'ml', tag: null, deleted_at: null },
      ],
    },
    {
      id: 8,
      name: 'Cabello grueso',
      deleted_at: null,
      products: prodAceite,
      presentations: [
        { id: 10, price: '19900.00', weight: '100.00', unit: 'ml', tag: null, deleted_at: null },
      ],
    },
    {
      id: 9,
      name: 'Única',
      deleted_at: null,
      products: prodDifusor,
      presentations: [
        { id: 11, price: '8500.00', weight: '1.00', unit: 'unidad', tag: null, deleted_at: null },
      ],
    },
  ]
}

// Pruebas para el mapeo de variedades a tarjetas y categorías del catálogo público (RF-5 a RF-12, RF-17, RF-35, RF-36).
describe('catalogMapper', () => {
  it('mapea los datos sintéticos equivalentes al demo en 9 tarjetas ordenadas y 4 categorías visibles', () => {
    const result = buildCatalog(createDemoRows())

    assert.equal(result.incomplete, false)
    assert.equal(result.cards.length, 9)
    assert.equal(result.categories.length, 4)

    // Orden esperado de las 9 tarjetas por producto y variedad (RF-5, RF-7):
    assert.deepEqual(
      result.cards.map((c) => ({ id: c.id, name: c.name, price: c.price, tag: c.tag })),
      [
        { id: 7, name: 'Aceite Capilar de Argán — Cabello fino', price: 12900, tag: null },
        { id: 8, name: 'Aceite Capilar de Argán — Cabello grueso', price: 19900, tag: null },
        { id: 2, name: 'Champú Sólido de Romero — Cabello graso', price: 8900, tag: null },
        { id: 3, name: 'Champú Sólido de Romero — Cabello seco', price: 9500, tag: null },
        { id: 4, name: 'Crema Hidratante de Aloe', price: 15900, tag: 'Nuevo' },
        { id: 9, name: 'Difusor de Aromaterapia', price: 8500, tag: null },
        { id: 5, name: 'Jabón de Avena y Miel', price: 4500, tag: null },
        { id: 6, name: 'Manteca Corporal de Karité', price: 18500, tag: null },
        { id: 1, name: 'Sérum de Rosa Mosqueta', price: 24900, tag: 'Más vendido' },
      ],
    )

    // Orden esperado de las 4 categorías visibles: Aromaterapia, Cabello, Cuerpo, Rostro
    assert.deepEqual(
      result.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        count: cat.cards.length,
      })),
      [
        { id: 4, name: 'Aromaterapia', color: NEUTRAL_COLOR, count: 1 },
        { id: 2, name: 'Cabello', color: CATEGORY_PALETTE.cabello, count: 4 },
        { id: 3, name: 'Cuerpo', color: CATEGORY_PALETTE.cuerpo, count: 2 },
        { id: 1, name: 'Rostro', color: CATEGORY_PALETTE.rostro, count: 2 },
      ],
    )
  })

  it('entrega en cada tarjeta exactamente las 7 claves del contrato con image vacía y sin description (RF-15, RF-17)', () => {
    const { cards } = buildCatalog(createDemoRows())
    const expectedKeys = ['category', 'color', 'id', 'image', 'name', 'price', 'tag']

    for (const card of cards) {
      assert.deepEqual(Object.keys(card).sort(), expectedKeys)
      assert.equal(card.image, '')
      assert.equal('description' in card, false)
    }
  })

  it('usa solo el nombre del producto si queda una única variedad visible tras descartar otra dada de baja o sin presentaciones (RF-7)', () => {
    const product = {
      id: 10,
      name: 'Champú Sólido de Romero',
      deleted_at: null,
      categories: { id: 2, name: 'Cabello' },
    }
    const rows = [
      {
        id: 20,
        name: 'Cabello graso',
        deleted_at: null,
        products: product,
        presentations: [{ id: 1, price: '8900.00', weight: '100.00', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 21,
        name: 'Cabello seco',
        deleted_at: '2026-06-01T00:00:00Z',
        products: product,
        presentations: [{ id: 2, price: '9500.00', weight: '120.00', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 22,
        name: 'Cabello normal',
        deleted_at: null,
        products: product,
        presentations: [],
      },
    ]

    const { cards } = buildCatalog(rows)
    assert.equal(cards.length, 1)
    assert.equal(cards[0].name, 'Champú Sólido de Romero')
  })

  it('descarta variedades por baja propia (pasada o futura), cascada desde producto, sin presentaciones visibles o sin categoría (RF-35, RF-36)', () => {
    const cat = { id: 1, name: 'Rostro' }
    const activeProduct = { id: 1, name: 'Producto Activo', deleted_at: null, categories: cat }
    const deletedProductPast = { id: 2, name: 'Producto Baja Pasada', deleted_at: '2025-01-01T00:00:00Z', categories: cat }
    const deletedProductFuture = { id: 3, name: 'Producto Baja Futura', deleted_at: '2099-01-01T00:00:00Z', categories: cat }

    const rows = [
      // Variedad con baja propia pasada
      {
        id: 1,
        name: 'Baja pasada',
        deleted_at: '2025-05-01T00:00:00Z',
        products: activeProduct,
        presentations: [{ id: 1, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      // Variedad con baja propia futura
      {
        id: 2,
        name: 'Baja futura',
        deleted_at: '2099-05-01T00:00:00Z',
        products: activeProduct,
        presentations: [{ id: 2, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      // Cascada: producto con baja pasada
      {
        id: 3,
        name: 'Única',
        deleted_at: null,
        products: deletedProductPast,
        presentations: [{ id: 3, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      // Cascada: producto con baja futura
      {
        id: 4,
        name: 'Única',
        deleted_at: null,
        products: deletedProductFuture,
        presentations: [{ id: 4, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      // Variedad con todas sus presentaciones dadas de baja
      {
        id: 5,
        name: 'Sin presentaciones activas',
        deleted_at: null,
        products: activeProduct,
        presentations: [
          { id: 5, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: '2026-01-01T00:00:00Z' },
        ],
      },
      // Variedad sin producto
      {
        id: 6,
        name: 'Huérfana',
        deleted_at: null,
        products: null,
        presentations: [{ id: 6, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      // Variedad visible válida
      {
        id: 7,
        name: 'Válida',
        deleted_at: null,
        products: activeProduct,
        presentations: [{ id: 7, price: '3500', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
    ]

    const { cards, categories } = buildCatalog(rows)
    assert.equal(cards.length, 1)
    assert.equal(cards[0].id, 7)
    assert.equal(categories.length, 1)
    assert.equal(categories[0].cards.length, 1)
  })

  it('ordena tarjetas sin distinguir mayúsculas ni acentos y desempata homónimos por id de variedad sin agrupar productos homónimos (RF-5)', () => {
    const cat = { id: 1, name: 'Rostro' }
    // Dos productos distintos con nombres equivalentes salvo acento/mayúsculas
    const prodA = { id: 100, name: 'Áloe Gel', deleted_at: null, categories: cat }
    const prodB = { id: 1, name: 'aloe gel', deleted_at: null, categories: cat }

    const rows = [
      {
        id: 30,
        name: 'Suave',
        deleted_at: null,
        products: prodB,
        presentations: [{ id: 1, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 10,
        name: 'suave',
        deleted_at: null,
        products: prodA,
        presentations: [{ id: 2, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 20,
        name: 'Fuerte',
        deleted_at: null,
        products: prodA,
        presentations: [{ id: 3, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
    ]

    const { cards } = buildCatalog(rows)
    // "Fuerte" (id 20) va antes que "suave"/"Suave"; entre las dos "suave" empatadas gana variedad id 10 antes que id 30
    assert.deepEqual(
      cards.map((c) => c.id),
      [20, 10, 30],
    )
  })

  it('incluye solo categorías con variedades visibles y las ordena por nombre y desempate por id de categoría', () => {
    const catB = { id: 5, name: 'cuerpo' }
    const catA1 = { id: 9, name: 'Árbol' }
    const catA2 = { id: 2, name: 'arbol' }

    const rows = [
      {
        id: 1,
        name: 'Única',
        deleted_at: null,
        products: { id: 1, name: 'Prod 1', deleted_at: null, categories: catB },
        presentations: [{ id: 1, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 2,
        name: 'Única',
        deleted_at: null,
        products: { id: 2, name: 'Prod 2', deleted_at: null, categories: catA1 },
        presentations: [{ id: 2, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
      {
        id: 3,
        name: 'Única',
        deleted_at: null,
        products: { id: 3, name: 'Prod 3', deleted_at: null, categories: catA2 },
        presentations: [{ id: 3, price: '1000', weight: '50', unit: 'g', tag: null, deleted_at: null }],
      },
    ]

    const { categories } = buildCatalog(rows)
    assert.deepEqual(
      categories.map((c) => c.id),
      [2, 9, 5],
    )
  })

  it('evalúa incomplete sobre las filas recibidas antes de descartar bajas lógicas (RF-4)', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: 'Dada de baja',
      deleted_at: '2026-01-01T00:00:00Z',
      products: null,
      presentations: [],
    }))

    const result = buildCatalog(rows)
    assert.equal(result.cards.length, 0)
    assert.equal(result.categories.length, 0)
    assert.equal(result.incomplete, true)
  })
})
