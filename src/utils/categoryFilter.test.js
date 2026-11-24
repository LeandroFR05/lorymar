import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ALL_CATEGORY,
  buildFilterOptions,
  resolveActiveCategory,
} from './categoryFilter.js'

// Pruebas para las opciones del filtro de categorías y la resolución del parámetro ?categoria= (RF-21 a RF-25, RNF-5).
describe('categoryFilter', () => {
  const sampleCategories = [
    { id: 4, name: 'Aromaterapia', cards: [{ id: 9 }] },
    { id: 2, name: 'Cabello', cards: [{ id: 2 }, { id: 3 }] },
    { id: 3, name: 'Cuerpo', cards: [{ id: 5 }] },
    { id: 1, name: 'Rostro', cards: [{ id: 1 }] },
  ]

  describe('ALL_CATEGORY', () => {
    it('exporta la constante "Todos"', () => {
      assert.equal(ALL_CATEGORY, 'Todos')
    })
  })

  describe('buildFilterOptions', () => {
    it('coloca siempre "Todos" primero seguido de las categorías ordenadas con compareNames y desempate por id (RF-21)', () => {
      const unordered = [
        { id: 1, name: 'Rostro', cards: [{ id: 1 }] },
        { id: 4, name: 'Aromaterapia', cards: [{ id: 9 }] },
        { id: 5, name: 'Áloe', cards: [{ id: 10 }] },
        { id: 2, name: 'aloe', cards: [{ id: 11 }] },
        { id: 3, name: 'Cuerpo', cards: [{ id: 5 }] },
      ]

      assert.deepEqual(buildFilterOptions(unordered), [
        'Todos',
        'aloe',
        'Áloe',
        'Aromaterapia',
        'Cuerpo',
        'Rostro',
      ])
    })

    it('devuelve ["Todos"] cuando la lista está vacía o no es un array', () => {
      assert.deepEqual(buildFilterOptions([]), ['Todos'])
      assert.deepEqual(buildFilterOptions(null), ['Todos'])
      assert.deepEqual(buildFilterOptions(undefined), ['Todos'])
    })

    it('ignora categorías sin variedades visibles (cards: [])', () => {
      const withEmpty = [
        { id: 1, name: 'Rostro', cards: [{ id: 1 }] },
        { id: 2, name: 'Maquillaje', cards: [] },
        { id: 3, name: 'Cabello', cards: [{ id: 2 }] },
      ]

      assert.deepEqual(buildFilterOptions(withEmpty), [
        'Todos',
        'Cabello',
        'Rostro',
      ])
    })
  })

  describe('resolveActiveCategory', () => {
    it('devuelve "Todos" sin limpiar parámetro cuando no hay parámetro (null, undefined o [])', () => {
      assert.deepEqual(resolveActiveCategory(null, sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: false,
      })
      assert.deepEqual(resolveActiveCategory(undefined, sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: false,
      })
      assert.deepEqual(resolveActiveCategory([], sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: false,
      })
    })

    it('resuelve una categoría visible cuando el nombre coincide exactamente', () => {
      const result = resolveActiveCategory('Rostro', sampleCategories)
      assert.deepEqual(result, {
        activeCategory: 'Rostro',
        matchedCategory: sampleCategories[3],
        shouldCleanParam: false,
      })
    })

    it('resuelve una categoría visible sin distinguir mayúsculas, acentos ni espacios laterales (RF-22)', () => {
      assert.deepEqual(resolveActiveCategory('rostro', sampleCategories), {
        activeCategory: 'Rostro',
        matchedCategory: sampleCategories[3],
        shouldCleanParam: false,
      })
      assert.deepEqual(resolveActiveCategory('  CABELLO  ', sampleCategories), {
        activeCategory: 'Cabello',
        matchedCategory: sampleCategories[1],
        shouldCleanParam: false,
      })
      assert.deepEqual(resolveActiveCategory('aromaterápia', sampleCategories), {
        activeCategory: 'Aromaterapia',
        matchedCategory: sampleCategories[0],
        shouldCleanParam: false,
      })
    })

    it('devuelve "Todos" y marca shouldCleanParam en true cuando el valor está vacío o solo tiene espacios (RF-22)', () => {
      assert.deepEqual(resolveActiveCategory('', sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
      assert.deepEqual(resolveActiveCategory('   ', sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
    })

    it('devuelve "Todos" y marca shouldCleanParam en true cuando el parámetro es "Todos" literal (RF-22, RF-23)', () => {
      assert.deepEqual(resolveActiveCategory('Todos', sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
      assert.deepEqual(resolveActiveCategory('  todos ', sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
    })

    it('devuelve "Todos" y marca shouldCleanParam en true cuando la categoría no existe o no tiene variedades visibles (RF-22)', () => {
      const categoriesWithEmpty = [
        ...sampleCategories,
        { id: 9, name: 'Maquillaje', cards: [] },
      ]

      assert.deepEqual(resolveActiveCategory('Maquillaje', categoriesWithEmpty), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
      assert.deepEqual(resolveActiveCategory('Perfumería', sampleCategories), {
        activeCategory: 'Todos',
        matchedCategory: null,
        shouldCleanParam: true,
      })
    })

    it('usa el primer valor cuando el parámetro se repite en la URL (RF-23)', () => {
      assert.deepEqual(
        resolveActiveCategory(['Cabello', 'Rostro'], sampleCategories),
        {
          activeCategory: 'Cabello',
          matchedCategory: sampleCategories[1],
          shouldCleanParam: false,
        },
      )

      assert.deepEqual(
        resolveActiveCategory(['Inexistente', 'Rostro'], sampleCategories),
        {
          activeCategory: 'Todos',
          matchedCategory: null,
          shouldCleanParam: true,
        },
      )
    })

    it('desempata eligiendo la categoría de menor id numérico cuando dos categorías coinciden tras normalizar', () => {
      const ambiguousCategories = [
        { id: 5, name: 'Áloe', cards: [{ id: 1 }] },
        { id: 2, name: 'Aloe', cards: [{ id: 2 }] },
      ]

      const result = resolveActiveCategory('aloe', ambiguousCategories)
      assert.deepEqual(result, {
        activeCategory: 'Aloe',
        matchedCategory: ambiguousCategories[1],
        shouldCleanParam: false,
      })
    })
  })
})
