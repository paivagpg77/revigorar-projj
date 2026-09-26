import { apiClient, setToken, clearToken, getToken } from './apiClient.js'

export async function login(email, password, remember = false) {
  const data = await apiClient.post('/auth/login', {
    email: email.trim(),
    password,
  })

  if (!data?.token) throw new Error('A API não retornou um token de acesso.')
  setToken(data.token, remember)
  return data
}

export async function register(name, email, password, specialization = '') {
  const data = await apiClient.post('/auth/register', {
    full_name: name.trim(),
    email: email.trim(),
    password,
    specialization: specialization.trim() || null,
  })

  if (!data?.token) throw new Error('A API não retornou um token de acesso.')
  setToken(data.token, false)
  return data
}

export function logout() {
  clearToken()
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getCurrentUser() {
  return apiClient.get('/auth/me')
}
