import { useEffect, useState, useMemo } from 'react'
import { CForm, CFormInput, CButton, CRow, CCol, CSpinner, CFormLabel, CAlert, CCard, CCardBody } from '@coreui/react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { apiFetch, apiFetchBlob } from '../../services/api'

const REPORT_OPTIONS = [
  {
    label: 'Inventario',
    options: [
      { value: 'INVENTORY_SUMMARY',   label: 'Resumen de Inventario' },
      { value: 'STOCK_VALUATION',     label: 'Valoración de Stock por Lote' },
      { value: 'PRODUCT_STOCK_VALUE', label: 'Valor por Producto' },
    ],
  },
  {
    label: 'Movimientos',
    options: [
      { value: 'SALES',                    label: 'Ventas' },
      { value: 'PURCHASES',               label: 'Compras' },
      { value: 'PRODUCT_MOVEMENT_HISTORY', label: 'Historial de Movimientos' },
    ],
  },
  {
    label: 'Alertas',
    options: [
      { value: 'EXPIRATION', label: 'Productos Próximos a Vencer' },
    ],
  },
]

// Tipos que requieren rango de fechas obligatorio
const DATE_REQUIRED_TYPES = ['SALES', 'PURCHASES']
// Tipos que admiten fechas opcionales
const DATE_OPTIONAL_TYPES = ['EXPIRATION', 'PRODUCT_MOVEMENT_HISTORY']

const REPORT_DESCRIPTIONS = {
  INVENTORY_SUMMARY:
    'Resumen consolidado del inventario: una fila por producto y almacén con cantidad total, costo promedio ponderado y valor total. Filtra por almacén o categoría.',
  STOCK_VALUATION:
    'Detalle de cada lote en stock con su costo unitario y valor total. Incluye lotes próximos a vencer. Filtra por almacén o categoría.',
  PRODUCT_STOCK_VALUE:
    'Una fila por producto con el stock total en todos los almacenes, su costo promedio y el valor total en dinero. Ordenado de mayor a menor valor.',
  SALES:
    'Todas las salidas de inventario en el rango de fechas seleccionado con precio unitario de venta y total por línea.',
  PURCHASES:
    'Todas las entradas de inventario en el rango de fechas seleccionado con costo unitario y total por línea.',
  PRODUCT_MOVEMENT_HISTORY:
    'Entradas y salidas combinadas en el rango de fechas. Útil para auditar el movimiento de un producto o almacén específico.',
  EXPIRATION:
    'Lotes con fecha de vencimiento próxima. La fecha "Hasta" define el límite (por defecto 90 días). Incluye valor en riesgo.',
}

// Tipos de reporte que pueden filtrar por producto
const PRODUCT_FILTER_TYPES = ['PRODUCT_STOCK_VALUE', 'PRODUCT_MOVEMENT_HISTORY', 'STOCK_VALUATION']

function ReportCreate() {
  const navigate = useNavigate()

  const [reportType, setReportType] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportBlob, setReportBlob] = useState(null)

  const typeValue = reportType?.value
  const showDateRequired = DATE_REQUIRED_TYPES.includes(typeValue)
  const showDateOptional = DATE_OPTIONAL_TYPES.includes(typeValue)
  const showDateFields = showDateRequired || showDateOptional
  const showProductFilter = PRODUCT_FILTER_TYPES.includes(typeValue)
  const reportDescription = REPORT_DESCRIPTIONS[typeValue] || null

  useEffect(() => {
    Promise.all([
      apiFetch('/api/warehouses').then((d) => (d || []).map((w) => ({ value: w.id, label: w.name }))),
      apiFetch('/api/categories').then((d) => (d || []).map((c) => ({ value: c.id, label: c.name }))),
      apiFetch('/api/products').then((d) => {
        const list = Array.isArray(d) ? d : d?.content || []
        return list.map((p) => ({ value: p.id, label: p.name + (p.sku ? ' (' + p.sku + ')' : '') }))
      }),
    ])
      .then(([whs, cats, prods]) => {
        setWarehouses(whs)
        setCategories(cats)
        setProducts(prods)
      })
      .catch(console.error)
  }, [])

  // Al cambiar tipo, limpiar selecciones
  const handleTypeChange = (opt) => {
    setReportType(opt)
    setReportBlob(null)
    setError(null)
    setSelectedProduct(null)
    if (!DATE_REQUIRED_TYPES.includes(opt?.value) && !DATE_OPTIONAL_TYPES.includes(opt?.value)) {
      setDateFrom('')
      setDateTo('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setReportBlob(null)

    if (!reportType) return setError('Selecciona un tipo de reporte.')

    if (showDateRequired) {
      if (!dateFrom || !dateTo) return setError('Este reporte requiere seleccionar ambas fechas.')
      if (dateTo < dateFrom) return setError("La fecha 'Hasta' no puede ser anterior a 'Desde'.")
    }

    if (showDateOptional && dateFrom && dateTo && dateTo < dateFrom) {
      return setError("La fecha 'Hasta' no puede ser anterior a 'Desde'.")
    }

    setLoading(true)
    try {
      const blob = await apiFetchBlob('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: typeValue,
          warehouseId: selectedWarehouse?.value || null,
          categoryId: selectedCategory?.value || null,
          productId: selectedProduct?.value || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          format: 'PDF',
        }),
      })
      setReportBlob(blob)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(reportBlob)
    link.download = 'reporte_' + typeValue + '_' + new Date().toISOString().slice(0, 10) + '.pdf'
    link.click()
  }

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto' }}>
      <h2 className="mb-1">Generar Reporte</h2>
      <p className="text-secondary mb-4">Selecciona el tipo de reporte y los filtros que desees aplicar.</p>

      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      <CCard className="shadow-sm mb-4">
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Tipo de reporte */}
            <div className="mb-3">
              <CFormLabel className="fw-semibold">Tipo de Reporte</CFormLabel>
              <Select
                options={REPORT_OPTIONS}
                value={reportType}
                onChange={handleTypeChange}
                placeholder="Selecciona un tipo de reporte..."
              />
              {reportDescription && (
                <div className="text-secondary mt-2" style={{ fontSize: '0.85rem' }}>
                  {reportDescription}
                </div>
              )}
            </div>

            {/* Filtros base: almacén y categoría */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Almacén</CFormLabel>
                <Select
                  options={warehouses}
                  value={selectedWarehouse}
                  onChange={setSelectedWarehouse}
                  placeholder="Todos los almacenes"
                  isClearable
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Categoría</CFormLabel>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Todas las categorías"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* Filtro por producto (solo ciertos tipos) */}
            {showProductFilter && (
              <div className="mb-3">
                <CFormLabel>Producto <span className="text-secondary fw-normal">(opcional)</span></CFormLabel>
                <Select
                  options={products}
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  placeholder="Todos los productos"
                  isClearable
                />
              </div>
            )}

            {/* Fechas */}
            {showDateFields && (
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    label={showDateRequired ? 'Desde *' : 'Desde'}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    label={showDateRequired ? 'Hasta *' : typeValue === 'EXPIRATION' ? 'Vence antes de (opcional)' : 'Hasta'}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </CCol>
              </CRow>
            )}

            <div className="d-flex gap-2 mt-2">
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? <><CSpinner size="sm" className="me-2" />Generando...</> : 'Generar PDF'}
              </CButton>
              <CButton color="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      {/* Vista previa */}
      {reportBlob && (
        <CCard className="shadow-sm">
          <CCardBody>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Vista previa</h5>
              <CButton color="success" size="sm" onClick={handleDownload}>
                Descargar PDF
              </CButton>
            </div>
            <iframe
              src={URL.createObjectURL(reportBlob)}
              width="100%"
              height="620px"
              title="Vista previa del reporte"
              style={{ border: '1px solid #dee2e6', borderRadius: 6 }}
            />
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default ReportCreate
