# REVIGORAR — Site institucional

Este repositório contém o **site institucional / apresentação (marketing)** do
REVIGORAR — não é o sistema/aplicativo usado pelos profissionais de saúde no
dia a dia. É a "vitrine" pública da plataforma, com 5 páginas:

- **Início** — apresentação geral, benefícios e proposta de valor
- **Sobre nós** — história, missão, visão e valores
- **Funcionalidades** — o que o sistema oferece
- **Planos** — preços, comparativo e perguntas frequentes
- **Contatos** — formulário de contato e canais de atendimento

Todos os dados (preços, FAQ, textos) estão mockados diretamente no código —
não há integração com backend ou com o sistema real do REVIGORAR.

## Tecnologias usadas

- **React 18** — biblioteca de componentes
- **React Router DOM** — navegação entre as páginas
- **Vite** — servidor de desenvolvimento e build
- **CSS puro** — sem Tailwind, Bootstrap, Sass ou bibliotecas de UI
- **lucide-react** — pacote de ícones

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** versão 18 ou superior ([baixar aqui](https://nodejs.org))
- **npm** (já vem junto com o Node.js)

Para conferir se já tem instalado, rode no terminal:

```bash
node -v
npm -v
```

## Como rodar o projeto na sua máquina

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   cd SEU-REPOSITORIO
   ```

2. Instale as dependências (isso cria a pasta `node_modules`, que não fica no
   repositório):

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra o navegador em **http://localhost:5173** — o site vai carregar com
   hot-reload (qualquer alteração no código atualiza a página automaticamente).

### Gerar a versão de produção

Quando quiser gerar os arquivos finais otimizados (para hospedar em algum
serviço como Vercel, Netlify, etc.):

```bash
npm run build      # gera a pasta dist/ com o site pronto para produção
npm run preview    # abre um servidor local para conferir o resultado do build
```

## Estrutura de pastas

```
src/
├── assets/
├── components/
│   ├── Header/        → cabeçalho fixo com navegação e busca
│   ├── Footer/         → rodapé com links e redes sociais
│   ├── Button/         → botão reutilizável (variantes primary/secondary/outline/ghost)
│   ├── Card/            → card de recurso e "StatBox" (ícone + rótulo)
│   └── PageBanner/    → banner de topo usado nas páginas internas
├── layouts/
│   └── MainLayout.jsx  → aplica Header/Footer em todas as páginas
├── pages/
│   ├── Home/            → Início
│   ├── About/           → Sobre nós
│   ├── Features/        → Funcionalidades (com carrossel)
│   ├── Plans/           → Planos (pricing, comparativo, FAQ)
│   └── Contact/         → Contatos (formulário + FAQ)
├── App.jsx              → definição das rotas
├── main.jsx             → bootstrap da aplicação
└── index.css            → tokens de design (cores, tipografia, espaçamentos)
```

## Responsividade

Todas as páginas possuem breakpoints para desktop, tablet (≤960px) e
smartphone (≤700px/560px), com grids que se reorganizam, menu mobile
retrátil no header e tabelas/listas adaptadas.

## Dados e conteúdo

Não há backend: os dados (planos, FAQ, textos de contato etc.) estão
mockados diretamente nos componentes de cada página. Para trocar textos,
preços ou perguntas frequentes, basta editar os arrays/constantes no topo do
arquivo `.jsx` da página correspondente (ex: `PLANS` em `Plans.jsx`).

As imagens usadas são fotos de banco gratuito (Unsplash, licença livre de
uso), carregadas diretamente por URL — não é necessário baixar nenhum
arquivo de imagem para o projeto funcionar.

## Observação importante

Este repositório é **apenas o site de apresentação** do REVIGORAR (páginas
públicas de marketing). O sistema/plataforma real usado pelos profissionais
de saúde (prontuário, avaliação de feridas, telemonitoramento etc., descritos
na página de Funcionalidades) **não está implementado aqui** — este projeto
não tem login, banco de dados nem as telas internas do produto.
