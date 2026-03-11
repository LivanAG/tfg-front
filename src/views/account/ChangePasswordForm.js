import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CForm, CFormInput, CFormLabel, CAlert } from '@coreui/react'
import { apiFetch } from '../../services/api'

function ChangePasswordForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
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

    if (!form.currentPassword.trim() || !form.newPassword.trim()) {
      return setError('Ambos campos son obligatorios')
    }
    if (form.newPassword.length < 6) {
      return setError('La nueva contraseña debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      await apiFetch('/auth/user/password', { method: 'PUT', body: JSON.stringify(form) })
      setSuccess('Contraseña actualizada correctamente')
      setTimeout(() => navigate('/account'), 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Cambiar Contraseña</h2>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <CFormLabel>Contraseña Actual</CFormLabel>
        <CFormInput type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required disabled={loading} />

        <CFormLabel>Nueva Contraseña</CFormLabel>
        <CFormInput type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required disabled={loading} />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <CButton type="submit" color="success" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/account')} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default ChangePasswordForm
