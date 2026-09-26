import { apiClient } from './apiClient.js'

export async function listStock() {
  const data = await apiClient.get('/stock')
  return Array.isArray(data) ? data : []
}

export function createStockItem(data) { return apiClient.post('/stock', data) }
export function updateStockQuantity(id, quantity) { return apiClient.patch(`/stock/${encodeURIComponent(id)}`, { quantity }) }
export function deleteStockItem(id) { return apiClient.delete(`/stock/${encodeURIComponent(id)}`) }
