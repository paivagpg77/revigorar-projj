import { apiClient } from './apiClient.js'

export async function listAssessments() {
  const data = await apiClient.get('/assessments')
  return Array.isArray(data) ? data.map((item) => ({
    ...item,
    assessmentStatus: item.assessmentStatus || (item.lastEval ? 'Concluída' : 'Ativo'),
    location: item.location || 'Não informado',
  })) : []
}

export function getWoundAssessment(patientId) {
  return apiClient.get(`/patients/${encodeURIComponent(patientId)}/wound-assessment`)
}

export function saveWoundAssessmentSection(patientId, section, data) {
  const map = {
    'Dados gerais': 'identification',
    'Avaliação da ferida': 'identification',
    'Características': 'characteristics',
    'Escalas clínicas': 'characteristics',
    'Condutas': 'care_plan',
  }
  const apiSection = map[section] || section
  return apiClient.put(`/patients/${encodeURIComponent(patientId)}/wound-assessment/${apiSection}`, data)
}
