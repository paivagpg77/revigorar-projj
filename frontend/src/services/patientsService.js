import { apiClient } from './apiClient.js'

export async function listPatients(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return apiClient.get(qs ? `/patients?${qs}` : '/patients')
}

export function getPatient(id) {
  return apiClient.get(`/patients/${encodeURIComponent(id)}`)
}

export function createPatient(data) {
  return apiClient.post('/patients', data)
}

export function updatePatient(id, data) {
  return apiClient.put(`/patients/${encodeURIComponent(id)}`, data)
}

export function deletePatient(id) {
  return apiClient.delete(`/patients/${encodeURIComponent(id)}`)
}
