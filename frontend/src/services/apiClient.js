const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const TOKEN_KEY = 'revigorar_token'


export function isApiConfigured() {
  return Boolean(BASE_URL)
}


export function getToken() {
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY)
  )
}


export function setToken(token, persist = false) {
  if (!token) return

  if (persist) {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.removeItem(TOKEN_KEY)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  }
}


export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}


class ApiError extends Error {
  constructor(status, message) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}


async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new ApiError(
      0,
      'VITE_API_URL não configurada no arquivo .env'
    )
  }

  const {
    method = 'GET',
    body,
    headers = {},
  } = options

  const token = getToken()

  const url = `${BASE_URL}${path}`

  console.log(`[API] ${method} ${url}`)

  const response = await fetch(url, {
    method,

    headers: {
      Accept: 'application/json',

      ...(body !== undefined
        ? {
            'Content-Type': 'application/json',
          }
        : {}),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...headers,
    },

    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  })


  let data = null

  const contentType =
    response.headers.get('content-type') || ''


  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    try {
      const text = await response.text()

      if (text) {
        data = text
      }
    } catch {
      data = null
    }
  }


  console.log(
    `[API] ${response.status} ${method} ${url}`,
    data
  )


  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Erro HTTP ${response.status}`

    throw new ApiError(
      response.status,
      message
    )
  }


  return data
}


/*
 * Remove o "data" quando o backend responde:
 *
 * {
 *   data: {...}
 * }
 *
 * Se a API já retornar diretamente o objeto,
 * ele é mantido.
 */
export function unwrapData(response) {
  if (
    response &&
    typeof response === 'object' &&
    Object.prototype.hasOwnProperty.call(
      response,
      'data'
    )
  ) {
    return response.data
  }

  return response
}


/*
 * Compatibilidade com os outros services.
 *
 * IMPORTANTE:
 * O fallback abaixo NÃO cria pacientes ou usuários falsos.
 * Ele apenas retorna o valor vazio informado pelo service.
 */
export async function withFallback(
  requestFunction,
  fallbackValue
) {
  try {
    return await requestFunction()
  } catch (error) {
    console.error(
      '[API] Erro na requisição:',
      error
    )

    return fallbackValue
  }
}


export const apiClient = {

  async get(path) {
    const response = await request(path)

    return unwrapData(response)
  },


  async post(path, body) {
    const response = await request(
      path,
      {
        method: 'POST',
        body,
      }
    )

    return unwrapData(response)
  },


  async put(path, body) {
    const response = await request(
      path,
      {
        method: 'PUT',
        body,
      }
    )

    return unwrapData(response)
  },


  async patch(path, body) {
    const response = await request(
      path,
      {
        method: 'PATCH',
        body,
      }
    )

    return unwrapData(response)
  },


  async delete(path) {
    const response = await request(
      path,
      {
        method: 'DELETE',
      }
    )

    return unwrapData(response)
  },
}


export { ApiError }