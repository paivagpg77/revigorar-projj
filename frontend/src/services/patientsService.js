import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'

/**
 * GET /patients
 * Resposta esperada: Array<{ id, name, age, type, status, lastEval }>
 */
export function listPatients() {
  return withFallback(() => apiClient.get('/patients'), PATIENTS)
}

/**
 * GET /patients/:id
 * Resposta esperada: { id, name, age, type, status, lastEval, ... }
 */
export function getPatient(id) {
  return withFallback(
    () => apiClient.get(`/patients/${id}`),
    PATIENTS.find((p) => String(p.id) === String(id)) || PATIENTS[0]
  )
}

/**
 * POST /patients
 * Body: { name, age, type }
 * Resposta esperada: paciente criado, com id gerado pelo backend
 */
export function createPatient(data) {
  return withFallback(
    () => apiClient.post('/patients', data),
    { id: Date.now(), status: 'Ativo', lastEval: '—', ...data }
  )
}

/**
 * PUT /patients/:id
 * Body: campos a atualizar
 */
export function updatePatient(id, data) {
  return withFallback(() => apiClient.put(`/patients/${id}`, data), { id, ...data })
}

/**
 * DELETE /patients/:id
 */
export function deletePatient(id) {
  return withFallback(() => apiClient.delete(`/patients/${id}`), null)
}
