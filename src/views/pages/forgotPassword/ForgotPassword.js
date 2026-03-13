import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm,
  CFormInput, CFormLabel, CRow, CAlert,
} from '@coreui/react'

function ForgotPassword() {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Ingresa tu email.')

    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.backendMessage || data?.message || 'Error al procesar la solicitud.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4 shadow-sm">
              <CCardBody>
                <h2 className="mb-1">Olvidé mi contraseña</h2>
                <p className="text-secondary mb-4">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}

                {submitted ? (
                  <CAlert color="success">
                    Si el email está registrado, recibirás un enlace en los próximos minutos.
                    Revisa también tu carpeta de spam.
                    <div className="mt-3">
                      <Link to="/login" className="btn btn-outline-success btn-sm">Volver al inicio de sesión</Link>
                    </div>
                  </CAlert>
                ) : (
                  <CForm onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <CFormLabel>Email</CFormLabel>
                      <CFormInput
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <CButton type="submit" color="primary" disabled={loading} className="flex-fill">
                        {loading ? 'Enviando...' : 'Enviar enlace'}
                      </CButton>
                    </div>
                    <div className="mt-3 text-center">
                      <Link to="/login" className="text-secondary small">Volver al inicio de sesión</Link>
                    </div>
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

export default ForgotPassword