// Selección de la presentación representativa de una variedad (RF-9, RF-10, RF-11, RF-35).

// Normaliza la etiqueta: devuelve null si no existe o si solo contiene espacios.
function normalizeTag(tag) {
  if (typeof tag !== 'string') return null
  const trimmed = tag.trim()
  return trimmed.length > 0 ? trimmed : null
}

// Compara dos presentaciones por menor precio, luego menor peso numérico (sin importar la unidad) y luego menor id.
function comparePresentations(a, b) {
  if (a.price !== b.price) return a.price - b.price
  if (a.weight !== b.weight) return a.weight - b.weight
  return a.id - b.id
}

// Elige la presentación representativa entre las visibles (deleted_at == null).
export function pickRepresentativePresentation(presentations) {
  if (!Array.isArray(presentations)) return null

  // Filtra las presentaciones visibles y convierte campos numéricos que pueden venir como string desde PostgREST.
  const visible = presentations
    .filter((item) => item != null && item.deleted_at == null)
    .map((item) => ({
      id: Number(item.id),
      price: Number(item.price),
      weight: Number(item.weight),
      unit: item.unit,
      tag: normalizeTag(item.tag),
    }))

  if (visible.length === 0) return null

  // Si hay al menos una con precio > 0, elige entre las de precio > 0; si todas valen 0, elige entre todas.
  const positive = visible.filter((item) => item.price > 0)
  const candidates = positive.length > 0 ? positive : visible

  const sorted = [...candidates].sort(comparePresentations)
  return sorted[0]
}
