import { apiClient, withFallback } from './apiClient.js'

const INITIAL_SCHEDULE = {
  Seg: [
    { id: 1, name: 'Maria Santos', time: '09:00', type: 'Ferida', status: 'Confirmado' },
    { id: 2, name: 'João Almeida', time: '10:30', status: 'Confirmado', type: 'Estomia' },
  ],
  Ter: [{ id: 3, name: 'Carla Souza', time: '14:00', type: 'Ferida', status: 'Pendente' }],
  Qua: [],
  Qui: [{ id: 4, name: 'Antônio Lima', time: '11:00', type: 'Estomia', status: 'Confirmado' }],
  Sex: [{ id: 5, name: 'Beatriz Rocha', time: '08:30', type: 'Ferida', status: 'Pendente' }],
  Sáb: [],
  Dom: [],
}

/**
 * GET /agenda
 * Resposta esperada: { Seg: [...], Ter: [...], ... }
 * Cada item: { id, name, time, type, status }
 */
export function getSchedule() {
  return withFallback(() => apiClient.get('/agenda'), INITIAL_SCHEDULE)
}

/**
 * POST /agenda/:day
 * Body: { name, time, type }
 */
export function createAppointment(day, data) {
  return withFallback(
    () => apiClient.post(`/agenda/${day}`, data),
    { id: Date.now(), status: 'Pendente', ...data }
  )
}

/**
 * PATCH /agenda/appointments/:id
 * Body: { status }
 */
export function updateAppointmentStatus(appointmentId, status) {
  return withFallback(() => apiClient.patch(`/agenda/appointments/${appointmentId}`, { status }), { id: appointmentId, status })
}

/**
 * DELETE /agenda/appointments/:id
 */
export function deleteAppointment(appointmentId) {
  return withFallback(() => apiClient.delete(`/agenda/appointments/${appointmentId}`), null)
}
