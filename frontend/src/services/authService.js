import { apiClient, isApiConfigured, setToken, clearToken, getToken } from './apiClient.js'
import { CURRENT_USER } from '../data/mockData.js'

/**
 * Endpoint esperado: POST /auth/login
 * Body:   { email, password }
 * Resposta esperada: { token: string, user: { name, role, initials } }
 * `remember`: se true, mantém a sessão salva entre execuções do sistema
 * (localStorage); caso contrário, a sessão vale só para esta aba/execução
 * (sessionStorage) e um novo login será pedido na próxima vez.
 */
export async function login(email, password, remember = false) {
  if (!isApiConfigured()) {
    // Sem back-end configurado: aceita qualquer credencial, como no protótipo.
    setToken('demo-token', remember)
    return { user: CURRENT_USER }
  }

  const data = await apiClient.post('/auth/login', { email, password })
  if (data?.token) setToken(data.token, remember)
  return data
}

export function logout() {
  clearToken()
}

export function isAuthenticated() {
  return Boolean(getToken())
}

/**
 * Endpoint esperado: POST /auth/register
 * Body:   { name, email, password }
 * Resposta esperada: { token: string, user: { name, role, initials } }
 */
export async function register(name, email, password) {
  if (!isApiConfigured()) {
    // Sem back-end configurado: cria a conta localmente, como no protótipo,
    // e já autentica o usuário.
    setToken('demo-token', false)
    return { user: { name, role: 'Enfermeira', initials: name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() } }
  }

  const data = await apiClient.post('/auth/register', { name, email, password })
  if (data?.token) setToken(data.token, false)
  return data
}

/**
 * Endpoint esperado: GET /auth/me
 * Resposta esperada: { name, role, initials }
 */
export async function getCurrentUser() {
  if (!isApiConfigured()) return CURRENT_USER
  try {
    return await apiClient.get('/auth/me')
  } catch {
    return CURRENT_USER
  }
}
