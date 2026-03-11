import { useState, useCallback } from 'react'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CButton, CFormSelect, CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/myComponents/Pagination'
import { useEffect } from 'react'

const ITEMS_PER_PAGE = 10

function ProductsList() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const fetchFn = useCallback(
    (page) =>
      apiFetch(
        `/api/products/paged?page=${page - 1}&size=${ITEMS_PER_PAGE}` +
          (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '') +
          (sku ? `&sku=${encodeURIComponent(sku)}` : '') +
          (categoryId ? `&categoryId=${categoryId}` : '')
      ),
    [searchTerm, sku, categoryId]
  )

  const { data: products, totalPages, currentPage, setCurrentPage, error, setError } = usePagination({
    fetchFn,
    deps: [searchTerm, sku, categoryId],
  })

  // Combinar errores del hook con errores de acciones
  const displayError = errorMessage || error

  useEffect(() => {
    apiFetch('/api/categories')
      .then((data) => setCategories(data || []))
      .catch((err) => console.error(err))
  }, [])

  // Limpiar selected cuando cambian los datos
  useEffect(() => {
    setSelectedProducts([])
  }, [products])

  const handleSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length ? [] : products.map((p) => p.id)
    )
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm('¿Estás seguro de eliminar los productos seleccionados?')) return
    setErrorMessage('')
    try {
      await apiFetch('/api/products/delete-multiple', {
        method: 'POST',
        body: JSON.stringify(selectedProducts),
      })
      // Forzar recarga cambiando filtro (truco: resetear página)
      setCurrentPage(1)
      setSelectedProducts([])
    } catch (err) {
      setErrorMessage(err.message || 'Error eliminando productos')
    }
  }

  const allSelected = products.length > 0 && selectedProducts.length === products.length

  return (
    <div>
      <h2>Productos</h2>

      {displayError && (
        <CAlert color="danger" dismissible onClose={() => { setErrorMessage(''); setError('') }} style={{ marginBottom: '1rem' }}>
          {displayError}
        </CAlert>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <CFormInput placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <CFormInput placeholder="Buscar por SKU..." value={sku} onChange={(e) => setSku(e.target.value)} />
        <CFormSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </CFormSelect>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
        <CButton color="success" size="sm" onClick={() => navigate('/products/create')}>
          Crear Producto
        </CButton>
        {selectedProducts.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionados ({selectedProducts.length})
          </CButton>
        )}
      </div>

      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
            </CTableHeaderCell>
            <CTableHeaderCell>SKU</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>BarCode</CTableHeaderCell>
            <CTableHeaderCell>Categoría</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {products.length > 0 ? (
            products.map((p) => (
              <CTableRow key={p.id}>
                <CTableDataCell>
                  <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => handleSelect(p.id)} />
                </CTableDataCell>
                <CTableDataCell>{p.sku}</CTableDataCell>
                <CTableDataCell>{p.name}</CTableDataCell>
                <CTableDataCell>{p.barcode}</CTableDataCell>
                <CTableDataCell>{p.categoryName}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" disabled={selectedProducts.length >= 1} onClick={() => navigate('/products/' + p.id)}>
                    Detalles
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} style={{ textAlign: 'center' }}>
                No se encontraron productos.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default ProductsList
