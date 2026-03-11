import { useState, useEffect } from 'react'
import { CForm, CFormInput, CFormTextarea, CButton, CRow, CCol, CAlert } from '@coreui/react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'

const EMPTY_DETAIL = { product: null, quantity: 0, unitCost: 0, sellPriceUnit: 0, lotNumber: '', expirationDate: '' }

const getProductName = (d, index) => d?.product?.label || 'Línea #' + (index + 1)

const joinNames = (names) => {
  if (names.length === 1) return names[0]
  if (names.length === 2) return names[0] + ' y ' + names[1]
  return names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1]
}

const humanizeBackendError = (data, details) => {
  const raw = data?.backendMessage || data?.message || data?.error || ''

  if (data?.errors && !Array.isArray(data.errors) && typeof data.errors === 'object') {
    const messages = Object.entries(data.errors).map(([path, msg]) => {
      const m = String(path).match(/^(entryDetails|exitDetails)\[(\d+)\]\.(.+)$/)
      if (!m) return String(msg)
      const name = getProductName(details[Number(m[2])], Number(m[2]))
      if (m[3] === 'productId') return name + ': selecciona un producto'
      if (m[3] === 'quantity') return name + ': la cantidad debe ser mayor que 0'
      if (m[3] === 'unitCost') return name + ': el costo unitario debe ser >= 0'
      if (m[3] === 'sellPriceUnit') return name + ': el precio unitario de venta debe ser >= 0'
      return name + ': ' + String(msg)
    })
    return messages[0] || 'Error de validación'
  }

  const parts = String(raw).split(',').map((p) => p.trim()).filter(Boolean)
  const mapped = parts.map((p) => {
    const m = p.match(/^(entryDetails|exitDetails)\[(\d+)\]\.(.+?)\s*:\s*(.*)$/)
    if (!m) return p
    const name = getProductName(details[Number(m[2])], Number(m[2]))
    if (m[3] === 'productId') return name + ': selecciona un producto'
    if (m[3] === 'quantity') return name + ': la cantidad debe ser mayor que 0'
    if (m[3] === 'unitCost') return name + ': el costo unitario debe ser >= 0'
    if (m[3] === 'sellPriceUnit') return name + ': el precio unitario de venta debe ser >= 0'
    return name + ': ' + m[4]
  })
  return mapped[0] || raw || 'Error desconocido del servidor'
}

function InventoryMovementCreate() {
  const navigate = useNavigate()
  const [movementType, setMovementType] = useState('IN')
  const [referenceDocument, setReferenceDocument] = useState('')
  const [note, setNote] = useState('')
  const [warehouse, setWarehouse] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [details, setDetails] = useState([{ ...EMPTY_DETAIL }])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/products').then((data) => {
        const list = Array.isArray(data) ? data : data?.content || []
        return list.map((p) => ({ value: p.id, label: p.name, hasExpirationDate: p.hasExpirationDate }))
      }),
      apiFetch('/api/warehouses').then((data) =>
        (data || []).map((w) => ({ value: w.id, label: w.name }))
      ),
    ])
      .then(([prods, whs]) => {
        setProducts(prods)
        setWarehouses(whs)
      })
      .catch((err) => console.error(err))
  }, [])

  const validate = () => {
    if (!warehouse) return setError('Debes seleccionar un almacén.'), false
    if (!referenceDocument.trim()) return setError('El documento de referencia es obligatorio.'), false

    if (details.some((d) => !d.product?.value)) return setError('Debes seleccionar un producto en cada línea.'), false

    const seen = new Set()
    for (const d of details) {
      if (seen.has(d.product?.value)) return setError('El producto "' + d.product.label + '" ya está añadido. No puedes repetirlo.'), false
      seen.add(d.product?.value)
    }

    const badQty = details.map((d, i) => ({ d, i })).filter(({ d }) => {
      const q = Number(d.quantity); return !Number.isFinite(q) || q <= 0
    }).map(({ d, i }) => getProductName(d, i))
    if (badQty.length) return setError((badQty.length === 1 ? badQty[0] : 'La cantidad debe ser mayor que 0 en: ' + joinNames(badQty)) + ': la cantidad debe ser mayor que 0.'), false

    if (movementType === 'IN') {
      const badCost = details.map((d, i) => ({ d, i })).filter(({ d }) => {
        const c = Number(d.unitCost); return !Number.isFinite(c) || c < 0
      }).map(({ d, i }) => getProductName(d, i))
      if (badCost.length) return setError((badCost.length === 1 ? badCost[0] + ': el costo unitario' : 'El costo unitario en: ' + joinNames(badCost)) + ' debe ser >= 0.'), false
    }

    if (movementType === 'OUT') {
      const badSell = details.map((d, i) => ({ d, i })).filter(({ d }) => {
        const p = Number(d.sellPriceUnit); return !Number.isFinite(p) || p < 0
      }).map(({ d, i }) => getProductName(d, i))
      if (badSell.length) return setError((badSell.length === 1 ? badSell[0] + ': el precio' : 'El precio en: ' + joinNames(badSell)) + ' debe ser >= 0.'), false
    }

    return true
  }

  const handleDetailChange = (index, field, value) => {
    if (field === 'product' && value?.value != null) {
      const duplicated = details.some((d, i) => i !== index && d?.product?.value === value.value)
      if (duplicated) return setError('El producto "' + value.label + '" ya está añadido. Elige otro.')
      // Si el nuevo producto no tiene vencimiento, limpiar la fecha de vencimiento
      if (!value.hasExpirationDate) {
        setDetails((prev) => prev.map((d, i) => i === index ? { ...d, product: value, expirationDate: '' } : d))
        return
      }
    }
    setDetails((prev) => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const addDetail = () => setDetails((prev) => [...prev, { ...EMPTY_DETAIL }])
  const removeDetail = (index) => setDetails((prev) => prev.filter((_, i) => i !== index))

  const getOptionsForRow = (rowIndex) => {
    const usedIds = new Set(details.filter((_, i) => i !== rowIndex).map((d) => d.product?.value).filter(Boolean))
    return products.filter((p) => !usedIds.has(p.value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading(true)
    try {
      await apiFetch('/api/inventory-movements', {
        method: 'POST',
        body: JSON.stringify({
          movementType,
          referenceDocument: referenceDocument.trim(),
          note,
          warehouseId: warehouse.value,
          entryDetails: movementType === 'IN'
            ? details.map((d) => ({ productId: d.product?.value, quantity: Number(d.quantity), unitCost: Number(d.unitCost), lotNumber: d.lotNumber || null, expirationDate: d.expirationDate || null }))
            : null,
          exitDetails: movementType === 'OUT'
            ? details.map((d) => ({ productId: d.product?.value, quantity: Number(d.quantity), sellPriceUnit: Number(d.sellPriceUnit) }))
            : null,
        }),
      })
      navigate('/movements', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <h2>Registrar Movimiento de Inventario</h2>

      {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        <CRow className="mb-3">
          <CCol md={4}>
            <label>Tipo de Movimiento</label>
            <Select
              options={[{ value: 'IN', label: 'Entrada' }, { value: 'OUT', label: 'Salida' }]}
              value={{ value: movementType, label: movementType === 'IN' ? 'Entrada' : 'Salida' }}
              onChange={(opt) => setMovementType(opt.value)}
            />
          </CCol>
          <CCol md={4}>
            <CFormInput label="Documento de Referencia" value={referenceDocument} onChange={(e) => setReferenceDocument(e.target.value)} />
          </CCol>
          <CCol md={4}>
            <label>Almacén</label>
            <Select options={warehouses} value={warehouse} onChange={setWarehouse} placeholder="Seleccione un almacén" />
          </CCol>
        </CRow>

        <CFormTextarea label="Nota" value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ marginBottom: '1rem' }} />

        <h4 style={{ marginTop: '1rem' }}>Detalles de {movementType === 'IN' ? 'Entrada' : 'Salida'}</h4>

        {details.map((d, i) => (
          <CRow key={i} className="align-items-end mb-3">
            <CCol md={3}>
              <label>Producto</label>
              <Select options={getOptionsForRow(i)} value={d.product} onChange={(val) => handleDetailChange(i, 'product', val)} />
            </CCol>
            <CCol md={2}>
              <CFormInput type="number" label="Cantidad" value={d.quantity} onChange={(e) => handleDetailChange(i, 'quantity', e.target.value)} />
            </CCol>
            {movementType === 'IN' && (
              <>
                <CCol md={2}>
                  <CFormInput type="number" label="Costo Unitario" value={d.unitCost} onChange={(e) => handleDetailChange(i, 'unitCost', e.target.value)} />
                </CCol>
                <CCol md={2}>
                  <CFormInput label="Lote" value={d.lotNumber} onChange={(e) => handleDetailChange(i, 'lotNumber', e.target.value)} />
                </CCol>
                {d.product?.hasExpirationDate && (
                  <CCol md={2}>
                    <CFormInput type="date" label="Vencimiento" value={d.expirationDate} onChange={(e) => handleDetailChange(i, 'expirationDate', e.target.value)} />
                  </CCol>
                )}
              </>
            )}
            {movementType === 'OUT' && (
              <CCol md={2}>
                <CFormInput type="number" label="Precio Unitario Venta" value={d.sellPriceUnit} onChange={(e) => handleDetailChange(i, 'sellPriceUnit', e.target.value)} />
              </CCol>
            )}
            <CCol md={1}>
              <CButton color="danger" onClick={() => removeDetail(i)}>✕</CButton>
            </CCol>
          </CRow>
        ))}

        <CButton type="button" color="info" onClick={addDetail}>+ Agregar Producto</CButton>

        <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Movimiento'}
          </CButton>
          <CButton color="secondary" onClick={() => navigate('/movements')}>Cancelar</CButton>
        </div>
      </CForm>
    </div>
  )
}

export default InventoryMovementCreate
