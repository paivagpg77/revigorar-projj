import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS, PATIENT_RECORDS } from '../data/mockData.js'

const TEMPLATES = [
  { type: 'Fotográfica', text: 'Novo registro fotográfico adicionado.' },
  { type: 'Prescrição', text: 'Troca de cobertura com hidrogel.' },
  { type: 'Avaliação', text: 'Avaliação clínica registrada, ferida em processo de cicatrização.' },
  { type: 'Prescrição', text: 'Limpeza da ferida com SF 0,9%.' },
  { type: 'Avaliação', text: 'Reavaliação de estomia sem intercorrências.' },
  { type: 'Fotográfica', text: 'Comparação de imagens realizada.' },
]

/**
 * GET /patients/:patientId/records
 * Histórico completo do paciente (usado no perfil e na aba "Registros").
 * Resposta esperada: Array<{ date, type, professional, description }>
 */
export function getPatientRecords(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/records`), PATIENT_RECORDS)
}

/**
 * GET /patients/:patientId/evolution-timeline
 * Resposta esperada: Array<{ date, title, description, details, hasPhoto }>
 */
export function getEvolutionTimeline(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/evolution-timeline`), null)
}

/**
 * GET /evolutions/feed?type=&page=
 * Feed cronológico entre pacientes (tela "Evoluções" no menu lateral).
 * Resposta esperada: Array<{ id, patient: {id,name}, type, text, date }>
 */
export function getEvolutionFeed() {
  return withFallback(
    () => apiClient.get('/evolutions/feed'),
    Array.from({ length: 18 }, (_, i) => {
      const patient = PATIENTS[i % PATIENTS.length]
      const template = TEMPLATES[i % TEMPLATES.length]
      const day = 12 - Math.floor(i / 2)
      return {
        id: i,
        patient,
        type: template.type,
        text: template.text,
        date: `${String(Math.max(day, 1)).padStart(2, '0')}/09/2025`,
      }
    })
  )
}
