import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'

const INITIAL_THUMBS = ['12/09/2025', '05/09/2025', '28/08/2025', '20/08/2025']

/**
 * GET /patients/:patientId/photos
 * Resposta esperada: Array<{ id, date, url }>
 */
export function getPatientPhotos(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/photos`), INITIAL_THUMBS)
}

/**
 * POST /patients/:patientId/photos
 * Body: FormData com o arquivo de imagem (multipart/form-data).
 * Obs: como isto envia um arquivo, não usa o apiClient JSON — troque pelo
 * seu próprio upload (FormData + fetch, ou seu SDK de storage) aqui dentro.
 */
export function uploadPatientPhoto(patientId, file) {
  return withFallback(
    async () => {
      const formData = new FormData()
      formData.append('photo', file)
      const token = localStorage.getItem('revigorar_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })
      if (!res.ok) throw new Error('Falha no upload da foto')
      return res.json()
    },
    { date: new Date().toLocaleDateString('pt-BR') }
  )
}

/**
 * GET /photos
 * Última foto de cada paciente (tela "Fotos" no menu lateral).
 * Resposta esperada: Array<{ id, name, lastEval }>
 */
export function listPatientsWithPhotos() {
  return withFallback(() => apiClient.get('/photos'), PATIENTS)
}
