import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'

const LOCATIONS = [
  'Membro inferior direito', 'Região sacral', 'Membro superior esquerdo',
  'Calcâneo direito', 'Região abdominal', 'Membro inferior esquerdo', 'Região torácica',
]

/**
 * GET /assessments
 * Lista de avaliações de todos os pacientes (tela "Avaliações" no menu lateral).
 * Resposta esperada: Array<{ id, name, age, type, status, lastEval, location, assessmentStatus }>
 */
export function listAssessments() {
  return withFallback(
    () => apiClient.get('/assessments'),
    PATIENTS.map((p, i) => ({
      ...p,
      location: LOCATIONS[i % LOCATIONS.length],
      assessmentStatus: i % 3 === 0 ? 'Concluída' : 'Ativo',
    }))
  )
}

/**
 * GET /patients/:patientId/wound-assessment
 * Resposta esperada: objeto com os campos de cada seção (dadosGerais,
 * avaliacaoFerida, caracteristicas, escalasClinicas, condutas).
 */
export function getWoundAssessment(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/wound-assessment`), null)
}

/**
 * PUT /patients/:patientId/wound-assessment/:section
 * Body: os campos daquela seção do formulário.
 */
export function saveWoundAssessmentSection(patientId, section, data) {
  return withFallback(
    () => apiClient.put(`/patients/${patientId}/wound-assessment/${section}`, data),
    data
  )
}
