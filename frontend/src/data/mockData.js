// =====================================================
// DADOS TEMPORÁRIOS DO FRONTEND
// =====================================================
// Os dados reais devem vir do Backend/PostgreSQL.
// Este arquivo NÃO contém mais pacientes fictícios.
// =====================================================


// Usuário padrão vazio.
// O usuário real deve ser carregado pelo authService.js.
export const CURRENT_USER = {
  name: '',
  role: '',
  initials: '',
}


// Pacientes
// Os pacientes reais devem vir de:
// GET /patients
export const PATIENTS = []


// Próximos atendimentos
// Os dados reais devem vir do Backend.
export const UPCOMING = []


// Dados do gráfico semanal.
// Enquanto a API não retornar dados, tudo fica em zero.
export const WEEKLY_SERIES = [
  0,
  0,
  0,
  0,
  0,
  0,
  0
]


export const WEEKDAYS = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
  'Dom'
]


// Distribuição de pacientes/feridas.
// Os dados reais devem vir da API.
export const DISTRIBUTION = []


// Documentos do paciente.
// Os dados reais devem vir do Backend.
export const PATIENT_DOCUMENTS = []


// Histórico/prontuário do paciente.
// Os dados reais devem vir do Backend.
export const PATIENT_RECORDS = []


// Catálogo de coberturas.
// Mantido vazio para não exibir dados fictícios.
// Depois podemos conectar ao estoque/produtos do Backend.
export const DRESSING_CATALOG = []


// Usuários do sistema.
// Os usuários reais devem vir do Backend.
export const SYSTEM_USERS = []


// Integrações.
// Mantido vazio até as integrações serem carregadas pelo Backend.
export const INTEGRATIONS = []