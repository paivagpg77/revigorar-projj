import { useState } from 'react'
import {
  Stethoscope, TrendingUp, FileText, Brain, Radio, Settings, ShieldCheck,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import Card from '../../components/Card/Card.jsx'
import Button from '../../components/Button/Button.jsx'
import './Features.css'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1666887360726-f55472d96c34?auto=format&fit=crop&w=900&q=80'

const FEATURE_GROUPS = [
  {
    icon: <Stethoscope size={20} />,
    title: 'Avaliação clínica',
    items: ['Prontuário eletrônico', 'Anamnese', 'Avaliação de estomas e feridas', 'Mensurações', 'Escalas clínicas'],
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Evolução',
    items: ['Fotografias', 'Histórico visual', 'Comparativo de imagens', 'Linha do tempo', 'Registro de evolução'],
  },
  {
    icon: <FileText size={20} />,
    title: 'Prescrição e condutas',
    items: ['Prescrição de enfermagem', 'Catálogo de coberturas', 'Registro de condutas', 'Histórico'],
  },
  {
    icon: <Brain size={20} />,
    title: 'Inteligência',
    items: ['Assistente inteligente', 'Sugestões de conduta', 'Análise de imagens', 'Base de conhecimento'],
  },
  {
    icon: <Radio size={20} />,
    title: 'Telemonitoramento',
    items: ['Envio de fotos', 'Acompanhamento remoto', 'Comunicação com a equipe', 'Alertas'],
  },
  {
    icon: <Settings size={20} />,
    title: 'Gestão',
    items: ['Estoque e dispensação', 'Alertas e notificações', 'Relatórios e indicadores', 'Controle de insumos'],
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Segurança',
    items: ['Controle de acesso', 'Histórico de ações', 'Proteção de dados', 'Conformidade com a LGPD'],
  },
]

const SLIDES = [
  { title: 'Dashboard', desc: 'Visão geral da sua rotina' },
  { title: 'Prontuário de paciente', desc: 'Todas as informações em um só lugar' },
  { title: 'Avaliação de feridas', desc: 'Registro e acompanhamento' },
]

export default function Features() {
  const [slide, setSlide] = useState(0)

  const prev = () => setSlide((s) => (s === 0 ? SLIDES.length - 1 : s - 1))
  const next = () => setSlide((s) => (s === SLIDES.length - 1 ? 0 : s + 1))

  return (
    <>
      <PageBanner
        eyebrow="FUNCIONALIDADES"
        title="Tudo o que você precisa em um só lugar."
        subtitle="O REVIGORAR reúne as principais ferramentas para um cuidado mais completo, seguro e humanizado."
        quote="Mais controle, mais resultado."
        image={BANNER_IMAGE}
      />

      <section className="section features-grid">
        <div className="container features-grid__inner">
          {FEATURE_GROUPS.map((group) => (
            <Card key={group.title} icon={group.icon} title={group.title} items={group.items} />
          ))}

          <div className="features-cta">
            <h3>Conheça cada detalhe do sistema</h3>
            <p>Explore todas as funcionalidades e veja como o REVIGORAR pode facilitar o seu dia a dia.</p>
            <Button as="link" to="/contatos" variant="secondary">
              Ver demonstração
            </Button>
          </div>
        </div>
      </section>

      <section className="section carousel-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'left' }}>Veja o sistema em ação</h2>
          <div className="carousel">
            <button className="carousel__arrow" onClick={prev} aria-label="Anterior">
              <ChevronLeft size={18} />
            </button>

            <div className="carousel__track">
              {SLIDES.map((s, i) => (
                <div
                  key={s.title}
                  className={`carousel__slide ${i === slide ? 'is-active' : ''}`}
                >
                  <div className="carousel__preview" />
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </div>
              ))}
            </div>

            <button className="carousel__arrow" onClick={next} aria-label="Próximo">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="carousel__dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                className={`carousel__dot ${i === slide ? 'is-active' : ''}`}
                onClick={() => setSlide(i)}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
