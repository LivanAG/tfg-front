import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CForm, CFormInput, CFormLabel, CAlert, CFormTextarea } from '@coreui/react'
import { apiFetch } from '../../services/api'

function WhCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', location: '', description: '' })
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

    if (!form.name.trim() || !form.location.trim()) {
      setError('Los campos Nombre y Ubicación son obligatorios')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/api/warehouses', { method: 'POST', body: JSON.stringify(form) })
      setSuccess('Almacén creado correctamente')
      setTimeout(() => navigate('/warehouse'), 1500)
    } catch (err) {
      setError(err.message || 'Error al crear el almacén')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Crear Almacén</h2>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <CFormLabel>Nombre *</CFormLabel>
        <CFormInput name="name" value={form.name} onChange={handleChange} required disabled={loading} />

        <CFormLabel>Ubicación *</CFormLabel>
        <CFormInput name="location" value={form.location} onChange={handleChange} required disabled={loading} />

        <CFormLabel>Descripción</CFormLabel>
        <CFormTextarea name="description" value={form.description} onChange={handleChange} rows="3" disabled={loading} />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <CButton type="submit" color="success" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Almacén'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/warehouse')} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default WhCreate
