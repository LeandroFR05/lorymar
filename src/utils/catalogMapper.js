import { isCatalogIncomplete } from './catalogLimits.js'
import { getCategoryColor } from './categoryColor.js'
import { pickRepresentativePresentation } from './representativePresentation.js'
import { compareNames } from './text.js'

// Construcción del catálogo público (tarjetas, categorías visibles e indicador de catálogo incompleto) (RF-4 a RF-12, RF-17, RF-35, RF-36).
export function buildCatalog(rows) {
  const safeRows = Array.isArray(rows) ? rows : []
  const incomplete = isCatalogIncomplete(safeRows)

  // Segunda barrera de visibilidad: descarta bajas propias, en cascada desde producto o variedades sin presentaciones visibles.
  const visibleEntries = []
  for (const row of safeRows) {
    if (!row || row.deleted_at != null) continue

    const product = row.products
    if (!product || product.deleted_at != null) continue

    const category = product.categories
    if (!category || category.id == null || !category.name) continue

    const representative = pickRepresentativePresentation(row.presentations)
    if (!representative) continue

    visibleEntries.push({
      varietyId: Number(row.id),
      varietyName: String(row.name ?? ''),
      productId: Number(product.id),
      productName: String(product.name ?? ''),
      categoryId: Number(category.id),
      categoryName: String(category.name),
      representative,
    })
  }

  // Cuenta cuántas variedades visibles tiene cada producto para decidir si el nombre lleva "Producto — Variedad" (RF-7).
  const varietiesPerProduct = new Map()
  for (const entry of visibleEntries) {
    varietiesPerProduct.set(
      entry.productId,
      (varietiesPerProduct.get(entry.productId) ?? 0) + 1,
    )
  }

  // Ordena los pares producto-variedad por nombre de producto, nombre de variedad e id de variedad ascendente (RF-5).
  const sortedEntries = [...visibleEntries].sort((a, b) => {
    const byProduct = compareNames(a.productName, b.productName)
    if (byProduct !== 0) return byProduct

    const byVariety = compareNames(a.varietyName, b.varietyName)
    if (byVariety !== 0) return byVariety

    return a.varietyId - b.varietyId
  })

  // Construye las tarjetas con exactamente las 7 claves del contrato (RF-17) y agrupa por categoría visible.
  const cards = []
  const categoriesMap = new Map()

  for (const entry of sortedEntries) {
    const hasMultipleVarieties = (varietiesPerProduct.get(entry.productId) ?? 0) > 1
    const cardName = hasMultipleVarieties
      ? `${entry.productName} — ${entry.varietyName}`
      : entry.productName
    const color = getCategoryColor(entry.categoryName)

    const card = {
      id: entry.varietyId,
      name: cardName,
      category: entry.categoryName,
      price: entry.representative.price,
      color,
      image: '',
      tag: entry.representative.tag,
    }

    cards.push(card)

    let categoryBucket = categoriesMap.get(entry.categoryId)
    if (!categoryBucket) {
      categoryBucket = {
        id: entry.categoryId,
        name: entry.categoryName,
        color,
        cards: [],
      }
      categoriesMap.set(entry.categoryId, categoryBucket)
    }
    categoryBucket.cards.push(card)
  }

  // Ordena las categorías visibles por nombre con locale es-AR y desempata por id ascendente (RF-21).
  const categories = [...categoriesMap.values()].sort((a, b) => {
    const byName = compareNames(a.name, b.name)
    if (byName !== 0) return byName
    return a.id - b.id
  })

  return {
    cards,
    categories,
    incomplete,
  }
}
