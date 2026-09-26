import { apiClient } from './apiClient.js'

export async function listReports() {
  const data = await apiClient.get('/reports')
  if (!Array.isArray(data)) return data || {}
  return Object.fromEntries(data.map((item) => [item.label, { series: [], label: `${item.value ?? 0} registro(s)`, value: item.value ?? 0 }]))
}

export async function getWeekdays() {
  const data = await apiClient.get('/reports/weekdays')
  return Array.isArray(data) ? data : []
}

export async function getDistribution() {
  const data = await apiClient.get('/reports/distribution')
  return Array.isArray(data) ? data : []
}
