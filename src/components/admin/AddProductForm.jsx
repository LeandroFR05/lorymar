import { useEffect, useRef, useState } from 'react'
import { categories } from '../../data/products.js'
import { formatPrice } from '../../utils/formatPrice.js'

// "Todos" es solo un filtro del catálogo, no una categoría asignable a un producto.
const PRODUCT_CATEGORIES = categories.filter((c) => c !== 'Todos')

const EMPTY_FORM = { name: '', category: '', description: '', price: '' }

export default function AddProductForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [image, setImage] = useState(null) // { file, url } con url de vista previa
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

  // Libera la URL temporal de la vista previa al cambiar de imagen o desmontar.
  const previewUrl = image?.url
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setMessage('')
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setImage(file ? { file, url: URL.createObjectURL(file) } : null)
    setMessage('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Objeto con la misma forma que `src/data/products.js` (contrato del catálogo).
    // TODO: enviarlo a la base de datos cuando exista; por ahora no se guarda.
    const product = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      image: image?.file.name ?? null,
    }

    setMessage(`Producto «${product.name}» validado. Aún no se guarda: falta la base de datos.`)
    setForm(EMPTY_FORM)
    setImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section aria-labelledby="add-product-title">
      <h1 id="add-product-title">Agregar productos al catálogo</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__field">
          <label htmlFor="product-name">Nombre</label>
          <input
            id="product-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form__field">
          <label htmlFor="product-category">Categoría</label>
          <select
            id="product-category"
            name="category"
            required
            value={form.category}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form__field">
          <label htmlFor="product-description">Descripción</label>
          <textarea
            id="product-description"
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form__field">
          <label htmlFor="product-price">Precio ($)</label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.price}
            onChange={handleChange}
          />
          {form.price !== '' && !Number.isNaN(Number(form.price)) && (
            <span className="admin-form__price-preview" aria-live="polite">
              {formatPrice(Number(form.price))}
            </span>
          )}
        </div>

        <div className="admin-form__field">
          <label htmlFor="product-image">Imagen</label>
          <input
            ref={fileInputRef}
            id="product-image"
            type="file"
            accept="image/*"
            required
            onChange={handleImage}
          />
          {image && (
            <img className="admin-form__preview" src={image.url} alt="Vista previa del producto" />
          )}
        </div>

        {message && (
          <p className="admin-form__message" role="status">
            {message}
          </p>
        )}

        <button type="submit" className="btn">
          Agregar producto
        </button>
      </form>
    </section>
  )
}
