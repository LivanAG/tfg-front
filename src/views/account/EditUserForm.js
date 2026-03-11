import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CForm, CFormInput, CFormLabel, CAlert, CSpinner } from '@coreui/react'
import { apiFetch } from '../../services/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EditUserForm() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ firstName: '', lastName: '', username: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    apiFetch('/auth/user')
      .then((data) => setUser({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || '',
        email: data.email || '',
      }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user.username.trim() || !user.email.trim()) {
      return setError('El nombre de usuario y el email son obligatorios')
    }
    if (!EMAIL_REGEX.test(user.email)) {
      return setError('Por favor, introduce un email válido')
    }

    setSaving(true)
    try {
      await apiFetch('/auth/user', { method: 'PUT', body: JSON.stringify(user) })
      setSuccess('Usuario actualizado correctamente')
      setTimeout(() => navigate('/account'), 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar el usuario')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CSpinner color="primary" className="d-block mx-auto mt-5" />

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Editar Usuario</h2>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <CFormLabel>Nombre</CFormLabel>
        <CFormInput name="firstName" value={user.firstName} onChange={handleChange} disabled={saving} />

        <CFormLabel>Apellido</CFormLabel>
        <CFormInput name="lastName" value={user.lastName} onChange={handleChange} disabled={saving} />

        <CFormLabel>Username *</CFormLabel>
        <CFormInput name="username" value={user.username} onChange={handleChange} required disabled={saving} />

        <CFormLabel>Email *</CFormLabel>
        <CFormInput type="email" name="email" value={user.email} onChange={handleChange} required disabled={saving} />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <CButton type="submit" color="success" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/account')} disabled={saving}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default EditUserForm
