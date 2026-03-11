import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CFormSelect, CButton, CCard, CCardBody, CCardHeader, CBadge,
  CRow, CCol,
} from '@coreui/react'
import { apiFetch } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/myComponents/Pagination'

const ITEMS_PER_PAGE = 10

const fmt = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n != null ? n : '—'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [details, setDetails] = useState(null)
  const [stocks, setStocks] = useState([])

  // Filtros de movimientos
  const [search, setSearch] = useState('')
  const [movementTypeFilter, setMovementTypeFilter] = useState('')
  const [quantityFilter, setQuantityFilter] = useState('')
  const [unitCostFilter, setUnitCostFilter] = useState('')

  const fetchMovements = useCallback(
    (page) => {
      const params = new URLSearchParams({ page: page - 1, size: ITEMS_PER_PAGE })
      if (search) params.append('reference', search)
      if (movementTypeFilter) params.append('movementType', movementTypeFilter)
      if (quantityFilter) params.append('quantity', quantityFilter)
      if (unitCostFilter) params.append('unitCost', unitCostFilter)
      return apiFetch('/api/inventory-movements/product/' + id + '?' + params.toString())
    },
    [id, search, movementTypeFilter, quantityFilter, unitCostFilter]
  )

  const {
    data: movementsContent,
    totalPages: totalMovementPages,
    currentPage: currentMovementsPage,
    setCurrentPage: setCurrentMovementsPage,
  } = usePagination({ fetchFn: fetchMovements, deps: [search, movementTypeFilter, quantityFilter, unitCostFilter] })

  useEffect(() => {
    setLoadingProduct(true)
    apiFetch('/api/products/' + id)
      .then((data) => setProduct(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingProduct(false))

    apiFetch('/api/products/' + id + '/details')
      .then((data) => setDetails(data))
      .catch(() => setDetails(null))

    apiFetch('/api/products/' + id + '/stocks')
      .then((data) => setStocks(data || []))
      .catch(() => setStocks([]))
  }, [id])

  if (loadingProduct) return <p>Cargando detalles del producto...</p>
  if (!product) return <p>No se encontró el producto.</p>

  // Calcular stock total y por almacén
  const stockWithQty = stocks.filter((s) => s.quantity > 0)
  const totalStock = stocks.reduce((sum, s) => sum + (s.quantity || 0), 0)

  // Agrupar por almacén para la sección de resumen
  const stockByWarehouse = stocks.reduce((acc, s) => {
    const key = s.warehouseName || s.warehouseId
    if (!acc[key]) acc[key] = { name: s.warehouseName || ('Almacén #' + s.warehouseId), total: 0 }
    acc[key].total += s.quantity || 0
    return acc
  }, {})

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">Detalle del Producto</h2>
        <div className="d-flex gap-2">
          <CButton color="warning" size="sm" onClick={() => navigate('/products/' + id + '/edit')}>
            Editar
          </CButton>
          <CButton color="secondary" size="sm" onClick={() => navigate('/products')}>
            Volver
          </CButton>
        </div>
      </div>

      <CRow className="mb-4">
        {/* Info del producto */}
        <CCol md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="fw-semibold">Información general</CCardHeader>
            <CCardBody>
              <table style={{ width: '100%', borderSpacing: '0 6px' }}>
                <tbody>
                  {[
                    ['ID', product.id],
                    ['Nombre', product.name],
                    ['SKU', product.sku],
                    ['Código de barras', product.barcode],
                    ['Categoría', product.categoryName],
                    ['Vencimiento', product.hasExpirationDate ? 'Sí' : 'No'],
                    ['Descripción', product.description || 'Sin descripción'],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td style={{ width: '40%', color: '#6B7280', paddingBottom: 6 }}><strong>{label}</strong></td>
                      <td style={{ paddingBottom: 6 }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Stock total */}
        <CCol md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="fw-semibold d-flex align-items-center justify-content-between">
              <span>Stock disponible</span>
              <CBadge color={totalStock > 0 ? 'success' : 'danger'} className="fs-6 px-3">
                Total: {totalStock.toLocaleString('es-AR')} uds.
              </CBadge>
            </CCardHeader>
            <CCardBody>
              {Object.values(stockByWarehouse).length === 0 ? (
                <p className="text-secondary mb-0">Sin stock registrado.</p>
              ) : (
                <>
                  {/* Resumen por almacén */}
                  <div className="mb-3">
                    <p className="text-secondary small mb-2">Resumen por almacén</p>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.values(stockByWarehouse).map((wh) => (
                        <div
                          key={wh.name}
                          className="rounded-2 px-3 py-2 text-center"
                          style={{ background: '#f8f9fa', minWidth: 120, border: '1px solid #e5e7eb' }}
                        >
                          <div className="fw-semibold" style={{ fontSize: '1.1rem' }}>
                            {wh.total.toLocaleString('es-AR')}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{wh.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabla de lotes */}
                  <p className="text-secondary small mb-2">Detalle de lotes</p>
                  <CTable hover responsive bordered small className="mb-0">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Almacén</CTableHeaderCell>
                        <CTableHeaderCell>Cantidad</CTableHeaderCell>
                        <CTableHeaderCell>Lote</CTableHeaderCell>
                        {product.hasExpirationDate && <CTableHeaderCell>Vence</CTableHeaderCell>}
                        <CTableHeaderCell>Costo unit.</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {stocks.map((s) => (
                        <CTableRow
                          key={s.id}
                          style={s.quantity === 0 ? { opacity: 0.4 } : undefined}
                        >
                          <CTableDataCell>{s.warehouseName || ('ID ' + s.warehouseId)}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={s.quantity > 0 ? 'success' : 'secondary'}>
                              {s.quantity}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{s.lotNumber}</CTableDataCell>
                          {product.hasExpirationDate && (
                            <CTableDataCell>{s.expirationDate || '—'}</CTableDataCell>
                          )}
                          <CTableDataCell>${fmt(s.unitCost)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Detalles técnicos */}
      <CCard className="shadow-sm mb-4">
        <CCardHeader className="fw-semibold d-flex align-items-center justify-content-between">
          <span>Detalles técnicos</span>
          {details ? (
            <CButton color="primary" size="sm" onClick={() => navigate('/products/' + id + '/details/edit')}>
              Editar
            </CButton>
          ) : (
            <CButton color="success" size="sm" onClick={() => navigate('/products/' + id + '/details/add')}>
              Agregar
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          {details ? (
            <div className="d-flex flex-wrap gap-4">
              <span><strong>Peso:</strong> {details.weight} {details.weightUnit || ''}</span>
              <span><strong>Largo:</strong> {details.length} {details.dimensionUnit || ''}</span>
              <span><strong>Ancho:</strong> {details.width} {details.dimensionUnit || ''}</span>
            </div>
          ) : (
            <p className="text-secondary mb-0">Sin detalles técnicos registrados.</p>
          )}
        </CCardBody>
      </CCard>

      {/* Movimientos */}
      <CCard className="shadow-sm">
        <CCardHeader className="fw-semibold">Historial de movimientos</CCardHeader>
        <CCardBody>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <CFormInput
              placeholder="Buscar por referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 220 }}
            />
            <CFormSelect
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              style={{ maxWidth: 160 }}
            >
              <option value="">Todos los tipos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </CFormSelect>
            <CFormInput
              type="number"
              placeholder="Cantidad..."
              value={quantityFilter}
              onChange={(e) => setQuantityFilter(e.target.value)}
              style={{ maxWidth: 140 }}
            />
            <CFormInput
              type="number"
              placeholder="Costo unitario..."
              value={unitCostFilter}
              onChange={(e) => setUnitCostFilter(e.target.value)}
              style={{ maxWidth: 160 }}
            />
          </div>

          {movementsContent.length > 0 ? (
            <CTable hover responsive bordered>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Referencia</CTableHeaderCell>
                  <CTableHeaderCell>Cantidad</CTableHeaderCell>
                  <CTableHeaderCell>Costo Unit.</CTableHeaderCell>
                  <CTableHeaderCell>Precio Venta</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {movementsContent.map((mov, index) =>
                  mov.details
                    .filter((item) => item.productId === parseInt(id))
                    .map((item, idx) => (
                      <CTableRow key={index + '-' + idx}>
                        <CTableDataCell>
                          <CBadge color={mov.movementType === 'IN' ? 'success' : 'danger'}>
                            {mov.movementType === 'IN' ? 'Entrada' : 'Salida'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{mov.referenceDocument || '—'}</CTableDataCell>
                        <CTableDataCell>{item.quantity}</CTableDataCell>
                        <CTableDataCell>{item.unitCost != null ? '$' + fmt(item.unitCost) : '—'}</CTableDataCell>
                        <CTableDataCell>{item.sellPriceUnit != null ? '$' + fmt(item.sellPriceUnit) : '—'}</CTableDataCell>
                      </CTableRow>
                    ))
                )}
              </CTableBody>
            </CTable>
          ) : (
            <p className="text-secondary">No hay movimientos registrados para este producto.</p>
          )}

          <Pagination
            currentPage={currentMovementsPage}
            totalPages={totalMovementPages}
            onPageChange={setCurrentMovementsPage}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ProductDetail
