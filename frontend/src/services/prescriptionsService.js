import { apiClient } from './apiClient.js'

function normalizeRow(row) {
  return {
    ...row,
    type: row.type || row.category || '',
    date: row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '—'),
    status: row.status === 'active' ? 'Ativa' : row.status === 'completed' ? 'Concluída' : (row.status || 'Ativa'),
  }
}

export async function listPatientPrescriptions(patientId) {
  const data = await apiClient.get(`/patients/${encodeURIComponent(patientId)}/prescriptions`)
  return Array.isArray(data) ? data.map(normalizeRow) : []
}

export async function createPatientPrescription(patientId, data) {
  return normalizeRow(await apiClient.post(`/patients/${encodeURIComponent(patientId)}/prescriptions`, {
    category: data.type,
    description: data.description,
    status: 'active',
  }))
}

export function updatePrescription(id, data) {
  const payload = { ...data }
  if (payload.status === 'Ativa') payload.status = 'active'
  if (payload.status === 'Concluída') payload.status = 'completed'
  if (payload.type) { payload.category = payload.type; delete payload.type }
  return apiClient.put(`/prescriptions/${encodeURIComponent(id)}`, payload).then(normalizeRow)
}

export function deletePrescription(id) {
  return apiClient.delete(`/prescriptions/${encodeURIComponent(id)}`)
}

export async function listAllPrescriptions() {
  const data = await apiClient.get('/prescriptions')
  const active = Array.isArray(data?.active) ? data.active : []
  const completed = Array.isArray(data?.completed) ? data.completed : []
  return [...active, ...completed].map(normalizeRow).map((p) => ({ ...p, patient: p.patient || p.name || '' }))
}

export async function createPrescription(data) {
  const patientName = data.patient
  const patients = await apiClient.get('/patients')
  const patient = Array.isArray(patients) ? patients.find((p) => p.name === patientName) : null
  if (!patient?.id) throw new Error('Paciente não encontrado.')
  return normalizeRow(await apiClient.post('/prescriptions', {
    patient_id: patient.id,
    category: data.type,
    description: data.description,
    status: 'active',
  }))
}

export async function getDressingCatalog() {
  const data = await apiClient.get('/dressing-catalog')
  return Array.isArray(data) ? data : []
}
