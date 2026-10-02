const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
const TOKEN_KEY = 'revigorar_token'

export function isApiConfigured() { return Boolean(BASE_URL) }
export function getToken() { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) }
export function setToken(token, persist = false) { clearToken(); if (!token) return; (persist ? localStorage : sessionStorage).setItem(TOKEN_KEY, token) }
export function clearToken() { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY) }

export class ApiError extends Error {
  constructor(status, message) { super(message); this.name = 'ApiError'; this.status = status }
}

function unwrap(data) {
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) return data.data
  return data
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await response.text()
    let payload = null
    if (text) { try { payload = JSON.parse(text) } catch { payload = text } }

    if (!response.ok) {
      const message = payload?.message || payload?.error || response.statusText || 'Erro na API.'
      if (response.status === 401) clearToken()
      throw new ApiError(response.status, message)
    }
    return unwrap(payload)
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error?.name === 'AbortError') throw new ApiError(0, 'A API demorou para responder.')
    throw new ApiError(0, error?.message || 'Não foi possível conectar ao backend.')
  } finally {
    clearTimeout(timer)
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

// Mantido somente para compatibilidade com componentes antigos.
// Nunca retorna dados fictícios.
export async function withFallback(fn) { return fn() }
export { unwrap as unwrapData }
