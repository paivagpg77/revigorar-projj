import { apiClient } from './apiClient.js'

export async function getMessages(patientId) {
  const data = await apiClient.get(`/patients/${encodeURIComponent(patientId)}/monitoring/messages`)
  return Array.isArray(data) ? data.map((m) => ({
    id: m.id,
    from: m.sender === 'professional' ? 'nurse' : 'patient',
    name: m.name || '',
    time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    text: m.text,
    photo: Boolean(m.photo),
  })) : []
}

export async function sendMessage(patientId, text) {
  return apiClient.post(`/patients/${encodeURIComponent(patientId)}/monitoring/messages`, { text })
}

export async function requestPhoto(patientId) {
  return apiClient.post(`/patients/${encodeURIComponent(patientId)}/monitoring/request-photo`, {})
}

export function getMonitoringStatus(patientId) {
  return apiClient.get(`/patients/${encodeURIComponent(patientId)}/monitoring/status`)
}
