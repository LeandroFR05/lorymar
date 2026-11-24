import { normalizeText } from './text.js'

// Paleta fija de colores de fondo ilustrado por categoría (estética botica, RF-16).
export const CATEGORY_PALETTE = {
  rostro: '#e8c4b8',
  cuerpo: '#ead9b9',
  cabello: '#bccbb0',
}

// Color de reserva para categorías sin color asignado en la paleta (RF-16).
export const NEUTRAL_COLOR = '#dfe5c8'

// Devuelve el color asociado al nombre normalizado de la categoría o el color neutro.
export function getCategoryColor(name) {
  const key = normalizeText(name)
  return CATEGORY_PALETTE[key] ?? NEUTRAL_COLOR
}
