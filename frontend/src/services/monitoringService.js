import { apiClient, withFallback } from './apiClient.js'

const INITIAL_MESSAGES = [
  { id: 1, from: 'patient', time: '14:20', text: 'enviou uma foto pelo WhatsApp', photo: true },
  { id: 2, from: 'nurse', name: 'Enfermeira Ana Silva', time: '14:35', text: 'Ok, ferida evoluindo bem. Manter cuidados. Obrigada!' },
]

/**
 * GET /patients/:patientId/monitoring/messages
 * Resposta esperada: Array<{ id, from: 'patient'|'nurse', name, time, text, photo }>
 */
export function getMessages(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/monitoring/messages`), INITIAL_MESSAGES)
}

/**
 * POST /patients/:patientId/monitoring/messages
 * Body: { text }
 * Obs: o envio real ao paciente (WhatsApp, SMS, etc.) fica a cargo do seu
 * back-end / integração já configurada em Configurações > Integrações.
 */
export function sendMessage(patientId, text) {
  return withFallback(
    () => apiClient.post(`/patients/${patientId}/monitoring/messages`, { text }),
    { id: Date.now(), from: 'nurse', text }
  )
}

/**
 * POST /patients/:patientId/monitoring/request-photo
 */
export function requestPhoto(patientId) {
  return withFallback(
    () => apiClient.post(`/patients/${patientId}/monitoring/request-photo`, {}),
    { id: Date.now(), from: 'nurse', text: 'solicitou uma nova foto da ferida ao paciente' }
  )
}

/**
 * GET /patients/:patientId/monitoring/status
 * Resposta esperada: { active: boolean, nextContact: string }
 */
export function getMonitoringStatus(patientId) {
  return withFallback(
    () => apiClient.get(`/patients/${patientId}/monitoring/status`),
    { active: true, nextContact: '18/09/2025' }
  )
}
