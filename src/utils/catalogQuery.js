// Consulta única del catálogo público desde la base de datos (RF-1, RF-3, RF-31, RNF-1).
// La raíz es `varieties`: cada fila es una variedad (una tarjeta) y trae su producto,
// la categoría del producto y sus presentaciones. Solo se piden columnas que las
// políticas RLS permiten leer y que la tarjeta usa: nada de descripción, stock,
// imágenes ni aromas (RF-17, RF-31).

export const CATALOG_SELECT = [
  'id, name, deleted_at',
  'products (id, name, deleted_at, categories (id, name))',
  'presentations (id, price, weight, unit, tag, deleted_at)',
].join(', ')

// Lee el catálogo completo con una sola petición y devuelve las filas recibidas.
// Si la consulta falla lanza un error con el mensaje del fallo (RF-27, RF-40);
// si no hay filas devuelve un arreglo vacío (RF-29).
export async function fetchCatalog(client) {
  if (!client || typeof client.from !== 'function') {
    throw new Error('No se pudo leer el catálogo: falta el cliente de base de datos.')
  }

  const { data, error } = await client.from('varieties').select(CATALOG_SELECT)

  if (error) {
    throw new Error(
      `No se pudo leer el catálogo desde la base de datos: ${error.message ?? 'error desconocido'}`,
      { cause: error },
    )
  }

  if (!Array.isArray(data)) return []

  return data
}
