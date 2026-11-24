// Formatea precios en pesos argentinos: "$ 24.900,00" (RF-13).
export function formatPrice(value) {
  const num = Number(value)
  const safeNum = Number.isFinite(num) ? num : 0
  const [integerPart, decimalPart] = safeNum.toFixed(2).split('.')
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$ ${groupedInteger},${decimalPart}`
}
