import { useState, useEffect } from 'react'
import { CForm, CFormInput, CFormTextarea, CButton, CFormCheck, CAlert } from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { apiFetch } from '../../services/api'

const INITIAL_FORM = {
  sku: '',
  barcode: '',
  name: '',
  description: '',
  hasExpirationDate: false,
  categoryId: null,
}

function ProductsCreate() {
  const { id } = useParams()
  const isEditMode = !!id
  const navigate = useNavigate()

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar categorías
  useEffect(() => {
    apiFetch('/api/categories')
      .then((data) => setCategories(data.map((c) => ({ value: c.id, label: c.name }))))
      .catch((err) => console.error(err))
  }, [])

  // En modo edición, cargar el producto y sincronizar la categoría seleccionada
  useEffect(() => {
    if (!isEditMode) return

    apiFetch('/api/products/' + id)
      .then((data) => {
        setFormData({
          sku: data.sku,
          barcode: data.barcode,
          name: data.name,
          description: data.description,
          hasExpirationDate: data.hasExpirationDate,
          categoryId: data.categoryId,
        })
        // Sincronizar el select de categoría con el valor cargado
        if (data.categoryId && data.categoryName) {
          setSelectedCategory({ value: data.categoryId, label: data.categoryName })
        }
      })
      .catch((err) => setError(err.message))
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCategoryChange = (option) => {
    setSelectedCategory(option)
    setFormData((prev) => ({ ...prev, categoryId: option ? option.value : null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.sku || !formData.barcode || !formData.name || !formData.categoryId) {
      setError('SKU, Barcode, Nombre y Categoría son obligatorios')
      return
    }

    setLoading(true)
    try {
      await apiFetch(isEditMode ? '/api/products/' + id : '/api/products', {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({
          sku: formData.sku,
          barcode: formData.barcode,
          name: formData.name,
          description: formData.description,
          hasExpirationDate: formData.hasExpirationDate,
          categoryId: parseInt(formData.categoryId),
        }),
      })
      navigate('/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = { marginBottom: '1rem' }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>{isEditMode ? 'Editar Producto' : 'Crear Producto'}</h2>

      {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        <CFormInput type="text" name="sku" label="SKU" value={formData.sku} onChange={handleChange} style={fieldStyle} />
        <CFormInput type="text" name="barcode" label="Código de barras" value={formData.barcode} onChange={handleChange} style={fieldStyle} />
        <CFormInput type="text" name="name" label="Nombre" value={formData.name} onChange={handleChange} style={fieldStyle} />
        <CFormTextarea name="description" label="Descripción" value={formData.description} onChange={handleChange} rows={3} style={fieldStyle} />
        <CFormCheck
          type="checkbox"
          name="hasExpirationDate"
          label="Tiene fecha de vencimiento"
          checked={formData.hasExpirationDate}
          onChange={handleChange}
          style={fieldStyle}
        />

        <div style={fieldStyle}>
          <label>Categoría</label>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Seleccione una categoría"
            isClearable
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading
              ? isEditMode ? 'Guardando...' : 'Creando...'
              : isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/products')} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default ProductsCreate
