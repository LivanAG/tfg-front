import { useState, useEffect } from 'react'

const MAX_VISIBLE_PAGES = 5

/**
 * Calcula el rango de páginas visibles para la paginación.
 */
export const getPageRange = (currentPage, totalPages) => {
  let startPage = Math.max(currentPage - Math.floor(MAX_VISIBLE_PAGES / 2), 1)
  let endPage = startPage + MAX_VISIBLE_PAGES - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(endPage - MAX_VISIBLE_PAGES + 1, 1)
  }

  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)

  return { pageNumbers, startPage, endPage }
}

/**
 * Hook de paginación genérico.
 * @param {Object} params
 * @param {Function} params.fetchFn - Función async que recibe (page) y retorna { content, totalPages, totalElements }
 * @param {Array} params.deps - Dependencias adicionales que resetean la página (filtros, etc.)
 * @param {number} [params.initialPage=1]
 */
export const usePagination = ({ fetchFn, deps = [], initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Resetea la página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await fetchFn(currentPage)
        if (!cancelled) {
          setData(result?.content || [])
          setTotalPages(result?.totalPages || 0)
          setTotalElements(result?.totalElements || 0)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error al cargar los datos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, ...deps])

  return {
    data,
    totalPages,
    totalElements,
    currentPage,
    setCurrentPage,
    loading,
    error,
    setError,
    refetch: () => {
      // Forzar re-fetch manteniendo la página actual
      setCurrentPage((p) => p)
    },
  }
}
