import { apiClient } from './apiClient.js'

export function getInstitution() { return apiClient.get('/settings/institution') }
export function updateInstitution(data) { return apiClient.put('/settings/institution', data) }
export function listUsers() { return apiClient.get('/users') }
export function createUser(data) { return apiClient.post('/users', data) }
export function updateUser(id, data) { return apiClient.put(`/users/${encodeURIComponent(id)}`, data) }
export function deleteUser(id) { return apiClient.delete(`/users/${encodeURIComponent(id)}`) }
export function listIntegrations() { return apiClient.get('/settings/integrations') }
export function toggleIntegration(name, enabled) { return apiClient.patch(`/settings/integrations/${encodeURIComponent(name)}`, { enabled }) }
export function updateSecurity(data) { return apiClient.put('/settings/security', data) }
export function getBackupInfo() { return apiClient.get('/settings/backup') }
export function runBackup() { return apiClient.post('/settings/backup/run', {}) }
export function updateBackupFrequency(frequency) { return apiClient.put('/settings/backup/frequency', { frequency }) }
