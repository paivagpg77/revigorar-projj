import { apiClient } from './apiClient.js'

export async function listDocuments(patientId) {
  const data = await apiClient.get(`/patients/${encodeURIComponent(patientId)}/documents`)
  return Array.isArray(data) ? data : []
}

export function addDocument(patientId, data) {
  return apiClient.post(`/patients/${encodeURIComponent(patientId)}/documents`, data)
}

export function getDownloadUrl(patientId, documentName) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return `${base}/patients/${encodeURIComponent(patientId)}/documents/${encodeURIComponent(documentName)}/download`
}
