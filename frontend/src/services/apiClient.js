/**
 * Cliente HTTP central do sistema.
 *
 * Como conectar ao seu back-end:
 * 1. Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`).
 * 2. Defina VITE_API_URL apontando para a URL base da sua API, por exemplo:
 *      VITE_API_URL=https://api.revigorar.com.br
 * 3. Pronto — a partir do próximo `npm run dev`/`npm run build`, todos os
 *    serviços em `src/services/*Service.js` passam a chamar sua API de
 *    verdade em vez dos dados mockados.
 *
 * Enquanto VITE_API_URL não estiver definida (ou se uma chamada falhar),
 * cada serviço devolve os dados mockados de `src/data/mockData.js`, então o
 * front-end continua funcionando normalmente para telas/demonstração mesmo
 * sem back-end.
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'revigorar_token'

export function isApiConfigured() {
  return Boolean(BASE_URL)
}

/**
 * O token fica em sessionStorage por padrão: cada vez que o sistema é aberto
 * (nova aba/sessão do navegador), é preciso fazer login novamente.
 * Se o usuário marcar "Lembrar de mim" no login, o token vai para
 * localStorage e a sessão persiste entre execuções.
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export function setToken(token, persist = false) {
  if (!token) return
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = data.message || data.error || message
    } catch {
      // resposta sem corpo JSON, mantém statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

/**
 * Executa `fn` (uma chamada real de API) somente se VITE_API_URL estiver
 * configurada. Caso contrário — ou se a chamada falhar (backend fora do ar,
 * endpoint ainda não implementado, etc.) — devolve `fallback` (dado
 * mockado), avisando no console em vez de quebrar a tela.
 */
export async function withFallback(fn, fallback) {
  if (!isApiConfigured()) return fallback
  try {
    return await fn()
  } catch (err) {
    console.warn(`[API] Falha na chamada, usando dado mockado: ${err.message}`)
    return fallback
  }
}

export { ApiError }
