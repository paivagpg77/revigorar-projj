import { apiClient } from './apiClient.js'

export async function getStats() {
  const data = await apiClient.get('/dashboard/stats')
  return {
    activePatients: Number(data?.patients ?? data?.activePatients ?? 0),
    assessmentsToday: Number(data?.evaluationsToday ?? data?.assessmentsToday ?? 0),
    evolutionsToday: Number(data?.evolutionsToday ?? 0),
    pendencies: Number(data?.pendencias ?? data?.pendencies ?? 0),
  }
}

export async function getUpcoming() {
  const data = await apiClient.get('/dashboard/upcoming')
  return Array.isArray(data) ? data : []
}

export async function getWeeklySeries() {
  const data = await apiClient.get('/dashboard/weekly-series')
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  if (Array.isArray(data)) return { labels, values: data.map((v) => Number(v) || 0) }
  return { labels: data?.labels || labels, values: data?.values || labels.map(() => 0) }
}

export async function getDistribution() {
  const data = await apiClient.get('/dashboard/distribution')
  return Array.isArray(data) ? data : []
}
