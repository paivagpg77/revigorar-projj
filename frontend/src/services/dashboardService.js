import { apiClient, withFallback } from './apiClient.js'
import { UPCOMING, WEEKLY_SERIES, WEEKDAYS, DISTRIBUTION } from '../data/mockData.js'

/**
 * GET /dashboard/stats
 * Resposta esperada: { activePatients, assessmentsToday, evolutionsToday, pendencies }
 */
export function getStats() {
  return withFallback(
    () => apiClient.get('/dashboard/stats'),
    { activePatients: 48, assessmentsToday: 12, evolutionsToday: 8, pendencies: 5 }
  )
}

/**
 * GET /dashboard/upcoming
 * Resposta esperada: Array<{ name, detail, status }>
 */
export function getUpcoming() {
  return withFallback(() => apiClient.get('/dashboard/upcoming'), UPCOMING)
}

/**
 * GET /dashboard/weekly-series
 * Resposta esperada: { labels: string[], values: number[] }
 */
export function getWeeklySeries() {
  return withFallback(
    () => apiClient.get('/dashboard/weekly-series'),
    { labels: WEEKDAYS, values: WEEKLY_SERIES }
  )
}

/**
 * GET /dashboard/distribution
 * Resposta esperada: Array<{ label, value, color }>
 */
export function getDistribution() {
  return withFallback(() => apiClient.get('/dashboard/distribution'), DISTRIBUTION)
}
