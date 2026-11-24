// Datos de productos.
// `color` se usa para el fondo ilustrado mientras no haya fotos; cuando las tengas,
// añade `image: '/productos/archivo.jpg'` (dentro de /public) y se mostrará automáticamente.

export const categories = ['Todos', 'Rostro', 'Cuerpo', 'Cabello']

export const products = [
  {
    id: 1,
    name: 'Sérum de Rosa Mosqueta',
    category: 'Rostro',
    description: 'Regenerador e iluminador con aceite de rosa mosqueta prensado en frío.',
    price: 24.9,
    color: '#e8c4b8',
    tag: 'Más vendido',
  },
  {
    id: 2,
    name: 'Jabón de Avena y Miel',
    category: 'Cuerpo',
    description: 'Elaborado en frío, suave para pieles sensibles y atópicas.',
    price: 7.5,
    color: '#ead9b9',
  },
  {
    id: 3,
    name: 'Crema Hidratante de Aloe',
    category: 'Rostro',
    description: 'Hidratación ligera diaria con aloe vera ecológico y ácido hialurónico vegetal.',
    price: 19.9,
    color: '#cfdcc3',
    tag: 'Nuevo',
  },
  {
    id: 4,
    name: 'Champú Sólido de Romero',
    category: 'Cabello',
    description: 'Fortalece y estimula el crecimiento. Cero plástico, hasta 80 lavados.',
    price: 11.0,
    color: '#bccbb0',
  },
  {
    id: 5,
    name: 'Manteca Corporal de Karité',
    category: 'Cuerpo',
    description: 'Nutrición profunda con karité puro y un toque de vainilla natural.',
    price: 16.5,
    color: '#f0dfc8',
  },
  {
    id: 6,
    name: 'Aceite Capilar de Argán',
    category: 'Cabello',
    description: 'Repara puntas y aporta brillo sin apelmazar.',
    price: 18.0,
    color: '#e3cfa6',
  },
]
