const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'revigorar_token'

export function isApiConfigured() {
  return Boolean(BASE_URL)
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export function setToken(token, persist = false) {
  clearToken()
  if (!token) return
  const storage = persist ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function unwrap(data) {
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) {
    return data.data
  }
  return data
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  if (!BASE_URL) throw new ApiError(0, 'VITE_API_URL não configurada.')

  const token = getToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let payload = null
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = text }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || 'Erro na API.'
    throw new ApiError(response.status, message)
  }

  return unwrap(payload)
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

// Compatibilidade com serviços antigos. Não existe fallback para mock.
export async function withFallback(fn) {
  return fn()
}
