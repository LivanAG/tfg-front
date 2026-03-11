import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CForm, CFormInput, CButton, CAlert } from '@coreui/react'
import { apiFetch } from '../../services/api'

const INITIAL_FORM = { weight: '', length: '', width: '', weightUnit: '', dimensionUnit: '' }
const NUMERIC_FIELDS = ['weight', 'length', 'width']
const NUMERIC_REGEX = /^[0-9]*\.?[0-9]*$/

function ProductDetailsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isEdit = location.pathname.includes('/details/edit')

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return

    apiFetch('/api/products/' + id + '/details')
      .then((data) => {
        if (!data) return
        setFormData({
          weight: data.weight ?? '',
          length: data.length ?? '',
          width: data.width ?? '',
          weightUnit: data.weightUnit ?? '',
          dimensionUnit: data.dimensionUnit ?? '',
        })
      })
      .catch((err) => setError(err.message || 'Error al obtener detalles'))
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (NUMERIC_FIELDS.includes(name) && value !== '' && !NUMERIC_REGEX.test(value)) return
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { weight, length, width, weightUnit, dimensionUnit } = formData

    if (!weight || !length || !width || !weightUnit || !dimensionUnit) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (parseFloat(weight) <= 0 || parseFloat(length) <= 0 || parseFloat(width) <= 0) {
      setError('Los valores numéricos deben ser mayores que cero')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/api/products/' + id + '/details', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({
          weight: parseFloat(weight),
          length: parseFloat(length),
          width: parseFloat(width),
          weightUnit,
          dimensionUnit,
        }),
      })
      navigate('/products/' + id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = { marginBottom: '1rem' }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2>{isEdit ? 'Editar' : 'Agregar'} Detalles Técnicos</h2>

      {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        <CFormInput label="Peso" name="weight" type="text" inputMode="decimal" value={formData.weight} onChange={handleChange} style={fieldStyle} />
        <CFormInput label="Unidad de Peso (kg, g, lb...)" name="weightUnit" type="text" value={formData.weightUnit} onChange={handleChange} style={fieldStyle} />
        <CFormInput label="Largo" name="length" type="text" inputMode="decimal" value={formData.length} onChange={handleChange} style={fieldStyle} />
        <CFormInput label="Ancho" name="width" type="text" inputMode="decimal" value={formData.width} onChange={handleChange} style={fieldStyle} />
        <CFormInput label="Unidad de Dimensión (cm, m, in...)" name="dimensionUnit" type="text" value={formData.dimensionUnit} onChange={handleChange} style={fieldStyle} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/products/' + id)} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default ProductDetailsForm
