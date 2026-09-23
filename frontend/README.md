# REVIGORAR — Sistema (Front-End)

Este repositório contém o **sistema interno** usado pelos profissionais de
saúde no dia a dia (não é o site institucional/marketing — esse fica em um
repositório separado, ex: `revigorar-site`).

## Conectando ao seu back-end

O front-end já está com **todas as conexões pré-prontas** em
`src/services/` — uma função por operação (buscar pacientes, salvar
avaliação, enviar mensagem etc.), pronta pra chamar sua API.

**Para conectar:**

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Defina a URL da sua API:
   ```
   VITE_API_URL=https://api.seudominio.com.br
   ```
3. Rode `npm run dev` normalmente.

A partir daí, cada tela passa a chamar seu back-end de verdade. **Enquanto
`VITE_API_URL` não estiver definida, ou se alguma chamada falhar**, o sistema
usa os dados mockados de `src/data/mockData.js` automaticamente — então o
front-end nunca quebra, mesmo sem back-end no ar.

### Como funciona por baixo dos panos

- `src/services/apiClient.js` — cliente HTTP central: monta a URL a partir de
  `VITE_API_URL`, injeta o token (`Authorization: Bearer ...`) em toda
  requisição, e trata erros.
- `src/services/*Service.js` — um arquivo por área do sistema
  (`patientsService`, `prescriptionsService`, `stockService`, etc.), cada um
  com funções como `listPatients()`, `createPatient(data)`,
  `deletePatient(id)`. **Cada função tem um comentário no topo dizendo o
  endpoint, o método HTTP e o formato de dado esperado** — é só abrir o
  arquivo do recurso que você quer conectar.
- Autenticação: `authService.login(email, senha)` guarda o token retornado
  pelo back-end no `localStorage`; `logout()` remove. Ajuste o formato da
  resposta esperada em `authService.js` se o seu back-end devolver o token
  de outro jeito.

### Se os endpoints do seu back-end tiverem nomes diferentes

Só editar o caminho dentro da função correspondente. Por exemplo, se sua
rota de pacientes for `/api/v1/pacientes` em vez de `/patients`, edite
`patientsService.js`:

```js
export function listPatients() {
  return withFallback(() => apiClient.get('/api/v1/pacientes'), PATIENTS)
}
```

O componente da tela (`Patients.jsx`) não precisa mudar nada — ele só chama
`listPatients()`.

### Upload de arquivos (fotos e documentos)

`photosService.js` (`uploadPatientPhoto`) e `documentsService.js` já usam
`FormData` + `fetch` diretamente (em vez do `apiClient` genérico, que manda
JSON), prontos para receber um arquivo real do paciente/input. Ajuste o
endpoint dentro dessas funções conforme a rota de upload do seu back-end.

## O que tem aqui

- **Login** — tela de acesso ao sistema
- **Dashboard (Início)** — indicadores do dia, gráfico de atendimentos e
  distribuição por tipo de atendimento
- **Pacientes** — listagem, busca, filtros, cadastro e remoção
- **Perfil do paciente** — dados pessoais (editáveis), histórico, avaliações,
  evoluções, prescrições e documentos
- **Avaliação da ferida** — formulário clínico em 5 seções (dados gerais,
  avaliação, características, escalas clínicas, condutas)
- **Registro fotográfico** — upload de fotos da ferida e comparação entre datas
- **Evolução do paciente** — linha do tempo, registros e fotos
- **Prescrições e condutas** — por paciente e em quadro (Kanban) geral
- **Acompanhamento remoto** — envio de orientações e solicitação de fotos ao
  paciente (por fora do sistema, ex: WhatsApp — o paciente não acessa o
  sistema diretamente)
- **Relatórios e indicadores** — gráficos e exportação real em `.csv`
- **Configurações** — instituição, usuários, integrações, segurança e backup
- **Agenda** — agendamentos por dia da semana
- **Estoque** — controle de insumos com quantidade ajustável

Só profissionais da equipe (enfermeiras, estomaterapeutas etc.) usam este
sistema — o paciente nunca faz login aqui.

## Tecnologias usadas

- **React 18**
- **React Router DOM** — navegação entre todas as telas
- **Vite** — servidor de desenvolvimento e build
- **CSS puro** — sem Tailwind, Bootstrap, Sass ou bibliotecas de UI
- **lucide-react** — ícones
- Gráficos (linha e rosca) feitos **sem biblioteca**, com SVG e
  `conic-gradient` em CSS puro
- Camada de serviços própria (`fetch` nativo) para conectar a qualquer
  back-end REST — sem Axios ou outra lib de HTTP

## Pré-requisitos

- **Node.js** 18 ou superior ([baixar aqui](https://nodejs.org))
- **npm** (já vem com o Node.js)

```bash
node -v
npm -v
```

## Como rodar o projeto

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   cd SEU-REPOSITORIO
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. (Opcional, mas recomendado) Configure seu back-end:

   ```bash
   cp .env.example .env
   # edite o .env com a URL da sua API
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra **http://localhost:5173** — a tela de login será exibida primeiro.
   Se `VITE_API_URL` não estiver configurada, qualquer valor nos campos
   entra no sistema (sem validar credenciais).

### Build de produção

```bash
npm run build      # gera a pasta dist/
npm run preview    # confere o resultado do build localmente
```

## Estrutura de pastas

```
src/
├── services/            → TODA a integração com o back-end mora aqui
│   ├── apiClient.js      → cliente HTTP central (URL base, token, erros)
│   ├── authService.js    → login, logout
│   ├── patientsService.js
│   ├── dashboardService.js
│   ├── assessmentsService.js
│   ├── evolutionsService.js
│   ├── photosService.js
│   ├── prescriptionsService.js
│   ├── monitoringService.js
│   ├── reportsService.js
│   ├── stockService.js
│   ├── agendaService.js
│   ├── settingsService.js
│   ├── documentsService.js
│   └── index.js          → reexporta tudo, se preferir importar por aqui
├── components/
│   ├── Sidebar/          → menu lateral com toda a navegação
│   ├── Topbar/            → busca, notificações e menu do usuário
│   ├── StatCard/          → cartões de indicadores do dashboard
│   ├── DonutChart/        → gráfico de rosca (CSS puro)
│   ├── LineChart/         → gráfico de linha (SVG puro)
│   ├── Badge/             → rótulos de status (Ativo, Pendente etc.)
│   ├── Avatar/            → avatar com iniciais
│   ├── Breadcrumb/        → trilha de navegação nas páginas de paciente
│   ├── Tabs/              → abas reutilizadas em várias páginas
│   ├── Switch/            → toggle usado em Integrações/Segurança
│   └── Toast/             → notificações rápidas de feedback (canto da tela)
├── layouts/
│   └── AppLayout.jsx      → aplica Sidebar + Topbar em todas as páginas internas
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── Patients/
│   ├── PatientProfile/
│   ├── WoundAssessment/
│   ├── PhotoRegistry/
│   ├── Evolution/
│   ├── Prescriptions/          → prescrições de um paciente específico
│   ├── PrescriptionsBoard/     → quadro geral (Kanban) de todos os pacientes
│   ├── RemoteMonitoring/
│   ├── Reports/
│   ├── Settings/
│   ├── Agenda/
│   ├── Assessments/            → lista de avaliações (menu lateral)
│   ├── EvolutionsFeed/         → feed de evoluções (menu lateral)
│   ├── PhotosList/             → fotos por paciente (menu lateral)
│   └── Stock/
├── data/
│   └── mockData.js       → dados fictícios usados como fallback pelos serviços
├── App.jsx               → definição de todas as rotas
├── main.jsx              → bootstrap da aplicação (inclui o ToastProvider)
└── index.css             → tokens de design (cores, tipografia, espaçamentos)
```

## Responsividade

Sidebar recolhível (desktop) e em painel deslizante (mobile/tablet), tabelas
com rolagem horizontal em telas pequenas, grids que se reorganizam em
colunas únicas abaixo de ~900px.

## Próximos passos sugeridos

- Ajustar os caminhos de endpoint em `src/services/*Service.js` para bater
  exatamente com as rotas do seu back-end (o padrão usado é REST simples)
- Revisar o formato esperado de cada resposta (documentado em comentário no
  topo de cada função de serviço) e alinhar com o que sua API retorna
- Implementar upload real de arquivo em `photosService.uploadPatientPhoto` e
  `documentsService.addDocument` se seu back-end usar um serviço de storage
  externo (S3, etc.) em vez de multipart direto
- Adicionar validação de formulários mais robusta
