import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCardHeader, CAlert, CSpinner } from '@coreui/react'
import { apiFetch } from '../../services/api'

function WarehouseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [warehouse, setWarehouse] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/warehouses/' + id)
      .then((data) => setWarehouse(data))
      .catch((err) => setError(err.message || 'Error al obtener el almacén'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <CSpinner color="primary" className="d-block mx-auto mt-5" />
  if (error) return <CAlert color="danger">{error}</CAlert>
  if (!warehouse) return <CAlert color="warning">No se encontró el almacén</CAlert>

  return (
    <div style={{ padding: '2rem' }}>
      <CCard>
        <CCardHeader><h3>Detalles del Almacén</h3></CCardHeader>
        <CCardBody>
          <p><strong>ID:</strong> {warehouse.id}</p>
          <p><strong>Nombre:</strong> {warehouse.name}</p>
          <p><strong>Ubicación:</strong> {warehouse.location}</p>
          <p><strong>Descripción:</strong> {warehouse.description || 'Sin descripción'}</p>
          <div style={{ marginTop: '1rem' }}>
            <CButton color="secondary" onClick={() => navigate('/warehouse')}>Volver</CButton>
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default WarehouseDetail
