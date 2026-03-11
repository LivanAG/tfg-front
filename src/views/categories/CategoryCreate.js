import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CForm, CFormInput, CFormLabel, CAlert, CFormTextarea } from '@coreui/react'
import { apiFetch } from '../../services/api'

function CategoryCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('El campo Nombre es obligatorio')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), description: form.description?.trim() || '' }),
      })
      setSuccess('Categoría creada correctamente')
      setTimeout(() => navigate('/categories'), 1200)
    } catch (err) {
      setError(err.message || 'Error al crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Crear Categoría</h2>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <CFormLabel>Nombre *</CFormLabel>
        <CFormInput name="name" value={form.name} onChange={handleChange} required disabled={loading} />

        <CFormLabel style={{ marginTop: '1rem' }}>Descripción</CFormLabel>
        <CFormTextarea name="description" value={form.description} onChange={handleChange} rows="3" disabled={loading} />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <CButton type="submit" color="success" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Categoría'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/categories')} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default CategoryCreate
