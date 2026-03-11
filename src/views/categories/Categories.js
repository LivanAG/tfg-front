import { useCallback, useState } from 'react'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CButton, CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/myComponents/Pagination'

const ITEMS_PER_PAGE = 10

function CategoriesList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [actionError, setActionError] = useState('')

  const fetchFn = useCallback(
    (page) =>
      apiFetch('/api/categories/paged?page=' + (page - 1) + '&size=' + ITEMS_PER_PAGE + '&search=' + encodeURIComponent(searchTerm)),
    [searchTerm]
  )

  const { data: categories, totalPages, currentPage, setCurrentPage, error, setError } = usePagination({
    fetchFn,
    deps: [searchTerm],
  })

  const displayError = actionError || error

  const visibleIds = categories.map((c) => c.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCategories.includes(id))

  const handleSelect = (id) => {
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedCategories((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      setSelectedCategories((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm('¿Estás seguro de eliminar las categorías seleccionadas?')) return
    setActionError('')
    try {
      await apiFetch('/api/categories/delete-multiple', {
        method: 'POST',
        body: JSON.stringify(selectedCategories),
      })
      setSelectedCategories([])
      setCurrentPage(1)
    } catch (err) {
      setActionError(err.message || 'Error eliminando categorías')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Categorías</h2>

      {displayError && (
        <CAlert color="danger" dismissible onClose={() => { setActionError(''); setError('') }} style={{ marginBottom: '1rem' }}>
          {displayError}
        </CAlert>
      )}

      <CFormInput
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
        <CButton color="success" size="sm" onClick={() => navigate('/categories/create')}>
          Crear Categoría
        </CButton>
        {selectedCategories.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionadas ({selectedCategories.length})
          </CButton>
        )}
      </div>

      <CTable hover responsive bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} />
            </CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Nº de Productos</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {categories.length > 0 ? (
            categories.map((c) => (
              <CTableRow key={c.id}>
                <CTableDataCell>
                  <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => handleSelect(c.id)} />
                </CTableDataCell>
                <CTableDataCell>{c.name}</CTableDataCell>
                <CTableDataCell>{c.totalProducts}</CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={3} style={{ textAlign: 'center' }}>
                No se encontraron categorías.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default CategoriesList
