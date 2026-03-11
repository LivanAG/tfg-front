import { CPagination, CPaginationItem } from '@coreui/react'
import { getPageRange } from "../../hooks/usePagination";
/**
 * Componente de paginación genérico y reutilizable.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const { pageNumbers, startPage, endPage } = getPageRange(currentPage, totalPages)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <CPagination>
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </CPaginationItem>

        {startPage > 1 && (
          <>
            <CPaginationItem onClick={() => onPageChange(1)}>1</CPaginationItem>
            {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
          </>
        )}

        {pageNumbers.map((num) => (
          <CPaginationItem
            key={num}
            active={currentPage === num}
            onClick={() => onPageChange(num)}
          >
            {num}
          </CPaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
            <CPaginationItem onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </CPaginationItem>
          </>
        )}

        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </CPaginationItem>
      </CPagination>
    </div>
  )
}

export default Pagination
