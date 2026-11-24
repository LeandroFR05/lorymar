// Normalización y comparación de textos con locale es-AR, insensibles a mayúsculas y acentos (RF-5, RF-21, RF-22).
const nameCollator = new Intl.Collator('es-AR', {
  sensitivity: 'base',
})

// Recorta espacios, elimina marcas diacríticas (tildes) y convierte a minúsculas.
export function normalizeText(str) {
  if (typeof str !== 'string') return ''
  return str
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Compara dos nombres con locale es-AR sin distinguir mayúsculas ni acentos.
export function compareNames(a, b) {
  return nameCollator.compare(String(a ?? ''), String(b ?? ''))
}
