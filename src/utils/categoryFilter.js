import { compareNames, normalizeText } from './text.js'

// Opción por defecto del filtro que representa el catálogo completo (RF-21 a RF-23).
export const ALL_CATEGORY = 'Todos'

const NORMALIZED_ALL = normalizeText(ALL_CATEGORY)

// Filtra las categorías válidas (con variedades visibles si traen `cards`) y las ordena con locale es-AR y desempate por id (RF-21).
function getSortedVisibleCategories(categories) {
  if (!Array.isArray(categories)) return []

  const visible = categories.filter((cat) => {
    if (!cat || typeof cat.name !== 'string' || !cat.name.trim()) return false
    if (Array.isArray(cat.cards) && cat.cards.length === 0) return false
    return true
  })

  return [...visible].sort((a, b) => {
    const byName = compareNames(a.name, b.name)
    if (byName !== 0) return byName
    return Number(a.id) - Number(b.id)
  })
}

// Construye las opciones del filtro con "Todos" siempre primero seguido de las categorías visibles ordenadas (RF-21).
export function buildFilterOptions(categories) {
  const sorted = getSortedVisibleCategories(categories)
  return [ALL_CATEGORY, ...sorted.map((cat) => cat.name)]
}

// Resuelve la categoría activa a partir del parámetro `categoria` de la URL (RF-22, RF-23).
export function resolveActiveCategory(rawParam, categories) {
  let paramValue = rawParam
  if (Array.isArray(rawParam)) {
    if (rawParam.length === 0) {
      return {
        activeCategory: ALL_CATEGORY,
        matchedCategory: null,
        shouldCleanParam: false,
      }
    }
    paramValue = rawParam[0]
  }

  if (paramValue == null) {
    return {
      activeCategory: ALL_CATEGORY,
      matchedCategory: null,
      shouldCleanParam: false,
    }
  }

  const normalizedParam = normalizeText(String(paramValue))

  // Si está vacío o pide literalmente "Todos", no debe quedar parámetro en la URL (RF-22, RF-23).
  if (!normalizedParam || normalizedParam === NORMALIZED_ALL) {
    return {
      activeCategory: ALL_CATEGORY,
      matchedCategory: null,
      shouldCleanParam: true,
    }
  }

  const visible = getSortedVisibleCategories(categories)
  const matches = visible.filter(
    (cat) => normalizeText(cat.name) === normalizedParam,
  )

  if (matches.length === 0) {
    return {
      activeCategory: ALL_CATEGORY,
      matchedCategory: null,
      shouldCleanParam: true,
    }
  }

  // Ante coincidencias ambiguas (por ejemplo, diferencias solo en acentos), gana la de menor id numérico (plan.md).
  const matched = [...matches].sort((a, b) => Number(a.id) - Number(b.id))[0]

  return {
    activeCategory: matched.name,
    matchedCategory: matched,
    shouldCleanParam: false,
  }
}
