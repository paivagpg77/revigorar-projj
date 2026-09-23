import { apiClient, withFallback } from './apiClient.js'
import { PATIENT_DOCUMENTS } from '../data/mockData.js'

/** GET /patients/:patientId/documents — Array<{ name, date, size }> */
export function listDocuments(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/documents`), PATIENT_DOCUMENTS)
}

/**
 * POST /patients/:patientId/documents
 * Body: FormData com o arquivo (multipart/form-data) — adapte como no
 * upload de fotos em photosService.js caso vá anexar um arquivo real.
 */
export function addDocument(patientId, data) {
  return withFallback(
    () => apiClient.post(`/patients/${patientId}/documents`, data),
    { date: new Date().toLocaleDateString('pt-BR'), size: '—', ...data }
  )
}

/** GET /patients/:patientId/documents/:name/download — retorna a URL de download */
export function getDownloadUrl(patientId, documentName) {
  return `${import.meta.env.VITE_API_URL || ''}/patients/${patientId}/documents/${encodeURIComponent(documentName)}/download`
}
