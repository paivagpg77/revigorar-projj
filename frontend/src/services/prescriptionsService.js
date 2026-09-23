import { apiClient, withFallback } from './apiClient.js'
import { DRESSING_CATALOG } from '../data/mockData.js'

const INITIAL_PATIENT_ROWS = [
  { id: 1, date: '12/09/2025', type: 'Enfermagem', description: 'Troca de cobertura com hidrogel', status: 'Ativa' },
  { id: 2, date: '10/09/2025', type: 'Medicamento', description: 'Analgésico (se necessário)', status: 'Concluída' },
  { id: 3, date: '05/09/2025', type: 'Enfermagem', description: 'Limpeza da ferida com SF 0,9%', status: 'Concluída' },
  { id: 4, date: '28/08/2025', type: 'Nutrição', description: 'Suplementação proteica', status: 'Concluída' },
]

const INITIAL_BOARD = [
  { id: 1, patient: 'Maria Santos', type: 'Enfermagem', description: 'Troca de cobertura com hidrogel', status: 'Ativa' },
  { id: 2, patient: 'João Almeida', type: 'Estomia', description: 'Troca de bolsa de estomia', status: 'Ativa' },
  { id: 3, patient: 'Carla Souza', type: 'Medicamento', description: 'Analgésico (se necessário)', status: 'Ativa' },
  { id: 4, patient: 'Antônio Lima', type: 'Nutrição', description: 'Suplementação proteica', status: 'Concluída' },
  { id: 5, patient: 'Beatriz Rocha', type: 'Enfermagem', description: 'Limpeza da ferida com SF 0,9%', status: 'Concluída' },
]

/**
 * GET /patients/:patientId/prescriptions
 * Resposta esperada: Array<{ id, date, type, description, status }>
 */
export function listPatientPrescriptions(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/prescriptions`), INITIAL_PATIENT_ROWS)
}

/**
 * POST /patients/:patientId/prescriptions
 * Body: { type, description }
 */
export function createPatientPrescription(patientId, data) {
  return withFallback(
    () => apiClient.post(`/patients/${patientId}/prescriptions`, data),
    { id: Date.now(), date: new Date().toLocaleDateString('pt-BR'), status: 'Ativa', ...data }
  )
}

/**
 * PUT /prescriptions/:id
 * Body: campos a atualizar (ex: { description } ou { status })
 */
export function updatePrescription(id, data) {
  return withFallback(() => apiClient.put(`/prescriptions/${id}`, data), { id, ...data })
}

/**
 * DELETE /prescriptions/:id
 */
export function deletePrescription(id) {
  return withFallback(() => apiClient.delete(`/prescriptions/${id}`), null)
}

/**
 * GET /prescriptions
 * Todas as prescrições, de todos os pacientes (tela "Prescrições" no menu,
 * exibida em formato quadro/Kanban).
 * Resposta esperada: Array<{ id, patient, type, description, status }>
 */
export function listAllPrescriptions() {
  return withFallback(() => apiClient.get('/prescriptions'), INITIAL_BOARD)
}

/**
 * POST /prescriptions
 * Body: { patient, type, description }
 */
export function createPrescription(data) {
  return withFallback(
    () => apiClient.post('/prescriptions', data),
    { id: Date.now(), status: 'Ativa', ...data }
  )
}

/**
 * GET /dressing-catalog
 * Resposta esperada: Array<{ name, indication, frequency }>
 */
export function getDressingCatalog() {
  return withFallback(() => apiClient.get('/dressing-catalog'), DRESSING_CATALOG)
}
