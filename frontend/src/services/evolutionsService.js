import { apiClient } from './apiClient.js'

export async function getPatientRecords(patientId) {
  const data = await apiClient.get(`/patients/${encodeURIComponent(patientId)}/records`)
  return Array.isArray(data) ? data : []
}

export async function getEvolutionTimeline(patientId) {
  const data = await apiClient.get(`/patients/${encodeURIComponent(patientId)}/evolution-timeline`)
  return Array.isArray(data) ? data : []
}

export async function getEvolutionFeed() {
  const data = await apiClient.get('/evolutions/feed')
  return Array.isArray(data) ? data : []
}
