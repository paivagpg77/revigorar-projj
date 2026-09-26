import { apiClient, getToken } from './apiClient.js'

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'
).replace(/\/$/, '')

const SERVER_URL = API_URL.replace(/\/api$/, '')

function normalizePhotoPath(path) {
  if (!path) return ''

  if (typeof path !== 'string') {
    return ''
  }

  const value = path.trim()

  if (!value) return ''

  // Já é uma URL completa
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  // Caminho relativo salvo no banco
  if (value.startsWith('/')) {
    return `${SERVER_URL}${value}`
  }

  return `${SERVER_URL}/${value}`
}

export function getPhotoUrl(photo) {
  if (!photo) return ''

  // A API pode retornar url
  if (photo.url) {
    return normalizePhotoPath(photo.url)
  }

  // Ou file_path
  if (photo.file_path) {
    return normalizePhotoPath(photo.file_path)
  }

  // Ou thumbnail
  if (photo.thumbnail) {
    return normalizePhotoPath(photo.thumbnail)
  }

  return ''
}

function normalizePhoto(photo) {
  if (!photo) return null

  return {
    ...photo,

    url: getPhotoUrl(photo),

    date:
      photo.date ||
      photo.created_at ||
      null,
  }
}

export async function getPatientPhotos(patientId) {
  if (!patientId) {
    throw new Error('Paciente inválido.')
  }

  const data = await apiClient.get(
    `/patients/${encodeURIComponent(patientId)}/photos`
  )

  const photos = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.photos)
        ? data.photos
        : []

  return photos
    .map(normalizePhoto)
    .filter(Boolean)
}

export async function uploadPatientPhoto(
  patientId,
  file
) {
  if (!patientId) {
    throw new Error('Paciente inválido.')
  }

  if (!file) {
    throw new Error('Selecione uma imagem.')
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error(
      'Selecione uma imagem válida.'
    )
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Use uma imagem JPG, PNG ou WEBP.'
    )
  }

  const formData = new FormData()

  formData.append(
    'photo',
    file,
    file.name
  )

  const token = getToken()

  const response = await fetch(
    `${API_URL}/patients/${encodeURIComponent(
      patientId
    )}/photos`,
    {
      method: 'POST',

      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},

      body: formData,
    }
  )

  const text = await response.text()

  let payload = null

  try {
    payload = text
      ? JSON.parse(text)
      : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        `Falha no upload da foto (${response.status}).`
    )
  }

  const photo =
    payload?.data ||
    payload?.photo ||
    payload

  return normalizePhoto(photo)
}

export async function listPatientsWithPhotos() {
  const data =
    await apiClient.get('/photos')

  const patients =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.patients)
          ? data.patients
          : []

  return patients.map((patient) => ({
    ...patient,

    thumbnailUrl:
      patient.thumbnail
        ? normalizePhotoPath(
            patient.thumbnail
          )
        : '',
  }))
}