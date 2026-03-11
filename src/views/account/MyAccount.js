import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton, CSpinner } from '@coreui/react'
import { apiFetch } from '../../services/api'

function UserDetail() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/auth/user')
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <CSpinner color="primary" className="d-block mx-auto mt-5" />
  if (!user) return <p>No se encontró el usuario.</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Detalle del Usuario</h2>
      <div style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <CButton color="warning" size="sm" onClick={() => navigate('/account/edit')}>
            Editar Usuario
          </CButton>
          <CButton color="info" size="sm" onClick={() => navigate('/account/password')}>
            Cambiar Contraseña
          </CButton>
        </div>
        <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Contraseña:</strong> ************</p>
      </div>
    </div>
  )
}

export default UserDetail
