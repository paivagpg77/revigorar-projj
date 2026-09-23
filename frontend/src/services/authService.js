import {
  apiClient,
  isApiConfigured,
  setToken,
  clearToken,
  getToken,
  unwrapData
} from './apiClient.js'


export async function login(
  email,
  password,
  remember = false
) {

  if (!isApiConfigured()) {
    throw new Error(
      'API não configurada.'
    )
  }

  const response =
    await apiClient.post(
      '/auth/login',
      {
        email: email.trim(),
        password
      }
    )

  const data =
    unwrapData(response)

  if (data?.token) {
    setToken(
      data.token,
      remember
    )
  }

  return data
}


export async function register(
  name,
  email,
  password
) {

  if (!isApiConfigured()) {
    throw new Error(
      'API não configurada.'
    )
  }

  const response =
    await apiClient.post(
      '/auth/register',
      {
        full_name:
          name.trim(),

        email:
          email.trim(),

        password
      }
    )

  const data =
    unwrapData(response)

  if (data?.token) {
    setToken(
      data.token,
      false
    )
  }

  return data
}


export function logout() {
  clearToken()
}


export function isAuthenticated() {
  return Boolean(
    getToken()
  )
}


export async function getCurrentUser() {

  if (!isApiConfigured()) {
    throw new Error(
      'API não configurada.'
    )
  }

  const response =
    await apiClient.get(
      '/auth/profile'
    )

  return unwrapData(response)
}