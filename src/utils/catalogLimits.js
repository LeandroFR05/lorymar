// Límite de filas por consulta y detección de catálogo potencialmente incompleto (RF-4).

export const MAX_ROWS = 1000

// Evalúa sobre las filas recibidas si la colección raíz o alguna colección anidada de presentaciones alcanzó el límite.
export function isCatalogIncomplete(rows) {
  if (!Array.isArray(rows)) return false
  if (rows.length >= MAX_ROWS) return true

  return rows.some(
    (row) =>
      row != null &&
      Array.isArray(row.presentations) &&
      row.presentations.length >= MAX_ROWS,
  )
}
