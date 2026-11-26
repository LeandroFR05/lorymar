import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  ALL_CATEGORY,
  buildFilterOptions,
  resolveActiveCategory,
} from '../utils/categoryFilter.js'
import { normalizeText } from '../utils/text.js'



// Referencia estable para la lista vacía, usada mientras no hay catálogo.
const NO_CATEGORIES = []

// Mantiene la categoría activa del catálogo sincronizada con la URL (?categoria=Rostro)
// y devuelve las tarjetas visibles según el filtro (RF-21 a RF-25).
//
// `catalog` proviene de `useCatalog`: mientras no hay datos, el filtro queda oculto
// y el parámetro de la URL no se toca (RF-22, RF-24).
export function useProductFilter(catalog, status) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Categorías visibles del catálogo, con referencia estable entre renders.
  const categories = useMemo(
    () => catalog?.categories ?? NO_CATEGORIES,
    [catalog],
  )

  // "Todos" siempre primero y después las categorías visibles ordenadas (RF-21).
  const options = useMemo(() => buildFilterOptions(categories), [categories])

  // El parámetro puede repetirse: vale el primer valor (RF-23).
  // Se serializa para tener una dependencia estable entre renders y para distinguir
  // "sin parámetro" de "parámetro presente pero vacío" (RF-22).
  const requestedKey = JSON.stringify(searchParams.getAll('categoria'))

  const requestedParam = useMemo(
    () => JSON.parse(requestedKey),
    [requestedKey],
  )

  const { activeCategory, shouldCleanParam } = useMemo(
    () => resolveActiveCategory(requestedParam, categories),
    [requestedParam, categories],
  )

  // Si el parámetro está vacío o pide una categoría inexistente, se elimina de la URL
  // solo cuando el catálogo ya cargó con éxito; mientras carga o tras un error no se toca (RF-22).
  useEffect(() => {
    if (!shouldCleanParam) return
    if (status !== 'ready') return

    const next = new URLSearchParams(searchParams)
    next.delete('categoria')
    setSearchParams(next, { replace: true })
  }, [shouldCleanParam, status, searchParams, setSearchParams])

  // Cambia el filtro: "Todos" quita el parámetro y otra categoría guarda su nombre (RF-23).
  const setCategory = useCallback(
    (category) => {
      const next = new URLSearchParams(searchParams)
      if (category === ALL_CATEGORY) {
        next.delete('categoria')
      } else {
        next.set('categoria', category)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // Tarjetas visibles: todas con "Todos" o las de la categoría activa (RF-6).
  const visibleCards = useMemo(() => {
    const cards = catalog?.cards ?? []
    if (activeCategory === ALL_CATEGORY) return cards
    return cards.filter(
      (card) => normalizeText(card.category) === normalizeText(activeCategory),
    )
  }, [catalog, activeCategory])

  return { options, activeCategory, setCategory, visibleCards }
}