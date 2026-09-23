import { apiClient } from './apiClient.js'


export async function listPatients(
  params = {}
) {
  const query = new URLSearchParams()

  if (params.search) {
    query.set(
      'search',
      params.search
    )
  }

  if (params.status) {
    query.set(
      'status',
      params.status
    )
  }

  if (params.page) {
    query.set(
      'page',
      params.page
    )
  }

  if (params.limit) {
    query.set(
      'limit',
      params.limit
    )
  }

  const queryString =
    query.toString()

  const endpoint =
    queryString
      ? `/patients?${queryString}`
      : '/patients'

  return apiClient.get(endpoint)
}


export function getPatient(id) {
  return apiClient.get(
    `/patients/${id}`
  )
}


export function createPatient(data) {
  return apiClient.post(
    '/patients',
    data
  )
}


export function updatePatient(
  id,
  data
) {
  return apiClient.put(
    `/patients/${id}`,
    data
  )
}


export function deletePatient(id) {
  return apiClient.delete(
    `/patients/${id}`
  )
}