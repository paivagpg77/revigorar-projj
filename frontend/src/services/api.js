const API = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('revigorar_token');
}

function setToken(token) {
  localStorage.setItem('revigorar_token', token);
}

function clearToken() {
  localStorage.removeItem('revigorar_token');
}

function getUser() {
  const u = localStorage.getItem('revigorar_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('revigorar_user', JSON.stringify(user));
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

// Auth
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.data.token);
  setUser(data.data.user);
  return data.data;
}

export async function register(body) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  setToken(data.data.token);
  setUser(data.data.user);
  return data.data;
}

export async function getProfile() {
  return (await request('/auth/profile')).data;
}

// Patients
export async function getPatients(params = '') {
  return await request(`/patients${params ? '?' + params : ''}`);
}

export async function getPatient(id) {
  return (await request(`/patients/${id}`)).data;
}

export async function createPatient(body) {
  return (await request('/patients', { method: 'POST', body: JSON.stringify(body) })).data;
}

// Wounds
export async function getWoundsByPatient(patientId) {
  return (await request(`/wounds/patient/${patientId}`)).data;
}

export async function getWound(id) {
  return (await request(`/wounds/${id}`)).data;
}

export async function createWound(body) {
  return (await request('/wounds', { method: 'POST', body: JSON.stringify(body) })).data;
}

// Evaluations
export async function getEvaluationsByWound(woundId) {
  return (await request(`/evaluations/wound/${woundId}`)).data;
}

export async function createEvaluation(body) {
  return (await request('/evaluations', { method: 'POST', body: JSON.stringify(body) })).data;
}

// Appointments
export async function getAppointments(params = '') {
  return (await request(`/appointments${params ? '?' + params : ''}`)).data;
}

export async function createAppointment(body) {
  return (await request('/appointments', { method: 'POST', body: JSON.stringify(body) })).data;
}

// Financial
export async function getFinancialDashboard() {
  return (await request('/financial/dashboard')).data;
}

export async function getFinancialRecords(params = '') {
  return await request(`/financial${params ? '?' + params : ''}`);
}

export async function createFinancialRecord(body) {
  return (await request('/financial', { method: 'POST', body: JSON.stringify(body) })).data;
}

// Stock
export async function getStockItems() {
  return (await request('/stock')).data;
}

export async function getStockAlerts() {
  return (await request('/stock/alerts')).data;
}

export { getToken, setToken, clearToken, getUser, setUser };
