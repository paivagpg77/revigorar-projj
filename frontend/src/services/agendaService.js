import { apiClient } from './apiClient.js'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export async function getSchedule() {
  const data = await apiClient.get('/agenda')
  const empty = Object.fromEntries(DAYS.map((d) => [d, []]))
  if (Array.isArray(data)) {
    for (const day of data) empty[day.label] = Array.isArray(day.appointments) ? day.appointments : []
    return empty
  }
  return { ...empty, ...(data || {}) }
}

export function createAppointment(day, data) {
  const dayIndex = DAYS.indexOf(day)
  if (dayIndex < 0) throw new Error('Dia inválido.')
  return apiClient.post(`/agenda/${dayIndex}`, data)
}

export function updateAppointmentStatus(id, status) {
  return apiClient.patch(`/agenda/appointments/${encodeURIComponent(id)}`, { status })
}

export function deleteAppointment(id) {
  return apiClient.delete(`/agenda/appointments/${encodeURIComponent(id)}`)
}
