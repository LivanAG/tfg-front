const BASE_URL = 'http://localhost:8080'

const getToken = () => localStorage.getItem('token')

/**
 * Extrae el mensaje de error más útil de una respuesta del backend.
 */
const extractErrorMessage = (data, fallback = 'Error desconocido') => {
  if (!data) return fallback
  return (
    data.backendMessage ||
    data.message ||
    data.details ||
    data.detail ||
    data.title ||
    fallback
  )
}

/**
 * Cliente HTTP centralizado. Lanza un Error si la respuesta no es ok.
 * @param {string} endpoint - Ruta relativa, ej: '/api/products'
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<any>} - JSON parseado o null si no hay cuerpo
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Algunos endpoints devuelven 204 sin cuerpo
  if (response.status === 204) return null

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'Error en la solicitud'))
  }

  return data
}

/**
 * Descarga un archivo blob desde el backend.
 */
export const apiFetchBlob = async (endpoint, options = {}) => {
  const token = getToken()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error('Error al generar el archivo')
  }

  return response.blob()
}
