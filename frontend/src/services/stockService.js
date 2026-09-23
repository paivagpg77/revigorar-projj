import { apiClient, withFallback } from './apiClient.js'

const INITIAL_ITEMS = [
  { id: 1, name: 'Hidrogel 25g', category: 'Cobertura', quantity: 42 },
  { id: 2, name: 'Gaze estéril', category: 'Insumo básico', quantity: 180 },
  { id: 3, name: 'Espuma de poliuretano', category: 'Cobertura', quantity: 8 },
  { id: 4, name: 'Bolsa de estomia', category: 'Estomaterapia', quantity: 65 },
  { id: 5, name: 'Alginato de cálcio', category: 'Cobertura', quantity: 5 },
  { id: 6, name: 'Filme transparente', category: 'Cobertura', quantity: 54 },
]

/**
 * GET /stock
 * Resposta esperada: Array<{ id, name, category, quantity }>
 */
export function listStock() {
  return withFallback(() => apiClient.get('/stock'), INITIAL_ITEMS)
}

/**
 * POST /stock
 * Body: { name, category, quantity }
 */
export function createStockItem(data) {
  return withFallback(() => apiClient.post('/stock', data), { id: Date.now(), ...data })
}

/**
 * PATCH /stock/:id
 * Body: { quantity } — usado pelos botões +/- de quantidade
 */
export function updateStockQuantity(id, quantity) {
  return withFallback(() => apiClient.patch(`/stock/${id}`, { quantity }), { id, quantity })
}

/**
 * DELETE /stock/:id
 */
export function deleteStockItem(id) {
  return withFallback(() => apiClient.delete(`/stock/${id}`), null)
}
