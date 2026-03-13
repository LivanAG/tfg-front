import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm,
  CFormInput, CFormLabel, CRow, CAlert, CSpinner,
} from '@coreui/react'

function ResetPassword() {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [tokenValid, setTokenValid] = useState(null) // null = checking, true/false
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }
    fetch(`${BASE_URL}/auth/reset-password/validate?token=` + encodeURIComponent(token))
      .then((res) => setTokenValid(res.ok))
      .catch(() => setTokenValid(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword.trim()) return setError('La contraseña no puede estar vacía.')
    if (newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (newPassword !== confirmPassword) return setError('Las contraseñas no coinciden.')

    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.backendMessage || data?.message || 'Error al restablecer la contraseña.')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <CSpinner color="primary" />
        <span className="ms-3 text-secondary">Validando enlace...</span>
      </div>
    )

  if (!tokenValid)
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6} lg={5}>
              <CCard className="p-4 shadow-sm">
                <CCardBody className="text-center">
                  <h4 className="text-danger mb-3">Enlace inválido o expirado</h4>
                  <p className="text-secondary mb-4">
                    Este enlace no es válido o ya ha sido utilizado. Los enlaces tienen una validez de 30 minutos.
                  </p>
                  <Link to="/forgot-password" className="btn btn-primary me-2">
                    Solicitar nuevo enlace
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary">
                    Iniciar sesión
                  </Link>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4 shadow-sm">
              <CCardBody>
                <h2 className="mb-1">Nueva contraseña</h2>
                <p className="text-secondary mb-4">Elige una contraseña segura para tu cuenta.</p>

                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}

                {success ? (
                  <CAlert color="success">
                    Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...
                  </CAlert>
                ) : (
                  <CForm onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <CFormLabel>Nueva contraseña</CFormLabel>
                      <CFormInput
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <div className="mb-4">
                      <CFormLabel>Confirmar contraseña</CFormLabel>
                      <CFormInput
                        type="password"
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                      {loading ? 'Guardando...' : 'Restablecer contraseña'}
                    </CButton>
                  </CForm>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ResetPassword