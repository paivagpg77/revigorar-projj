import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import Button from '../../components/Button/Button.jsx'
import './Plans.css'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?auto=format&fit=crop&w=900&q=80'

const PLANS = [
  {
    name: 'Mensal',
    price: 'R$ 149,90',
    period: '/mês',
    items: ['Sistema completo', 'Suporte técnico', 'Atualizações constantes'],
  },
  {
    name: 'Trimestral',
    price: 'R$ 399,90',
    period: '/trimestre',
    installment: 'R$ 133,30/mês',
    highlight: 'Mais escolhido',
    items: ['Sistema completo', 'Suporte técnico', 'Atualizações constantes'],
  },
  {
    name: 'Anual',
    price: 'R$ 1.399,90',
    period: '/ano',
    installment: 'R$ 116,66/mês',
    items: ['Sistema completo', 'Suporte técnico', 'Atualizações constantes'],
  },
]

const IMPLEMENTATION_ITEMS = [
  'Configuração inicial',
  'Personalização do sistema',
  'Cadastro de profissionais e pacientes',
  'Orientação para utilização',
  'Suporte na implantação',
]

const COMPARISON = [
  { feature: 'Sistema completo', mensal: true, trimestral: true, anual: true },
  { feature: 'Suporte técnico', mensal: true, trimestral: true, anual: true },
  { feature: 'Atualizações', mensal: false, trimestral: true, anual: true },
  { feature: 'Recursos clínicos', mensal: false, trimestral: true, anual: true },
]

const FAQ = [
  'Como funciona a implementação?',
  'Posso usar no celular ou tablet?',
  'Quais formas de pagamento são aceitas?',
  'Existe contrato mínimo?',
  'O valor de implementação é único?',
  'É possível personalizar o sistema?',
  'É possível cadastrar vários profissionais?',
  'Como funciona o suporte?',
  'Como funciona a contratação?',
  'Quais são as formas de pagamento?',
]

export default function Plans() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <PageBanner
        eyebrow="PLANOS"
        title="Planos e valores"
        subtitle="Escolha o plano ideal para sua instituição e tenha acesso a todas as funcionalidades do sistema."
        quote="Investimento em cuidado."
        image={BANNER_IMAGE}
      />

      <section className="section pricing">
        <div className="container pricing__grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.highlight ? 'is-highlight' : ''}`}>
              {plan.highlight && <span className="pricing-card__badge">{plan.highlight}</span>}
              <h3>{plan.name}</h3>
              <div className="pricing-card__price">
                {plan.price} <span>{plan.period}</span>
              </div>
              {plan.installment && <span className="pricing-card__installment">({plan.installment})</span>}
              <ul>
                {plan.items.map((item) => (
                  <li key={item}><Check size={15} /> {item}</li>
                ))}
              </ul>
              <Button variant={plan.highlight ? 'primary' : 'secondary'} className="pricing-card__cta">
                Contratar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="section extra-grid">
        <div className="container extra-grid__inner">
          <div className="implementation-card">
            <h3>Implementação do REVIGORAR</h3>
            <div className="implementation-card__price">R$ 1.500,00</div>
            <span className="implementation-card__label">Inclui:</span>
            <ul>
              {IMPLEMENTATION_ITEMS.map((item) => (
                <li key={item}><Check size={15} /> {item}</li>
              ))}
            </ul>
            <p className="implementation-card__note">
              O valor pode variar conforme o porte e as necessidades específicas da instituição.
            </p>
          </div>

          <div className="comparison-card">
            <h3>Comparativo de planos</h3>
            <table>
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Mensal</th>
                  <th>Trimestral</th>
                  <th>Anual</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{row.mensal && <Check size={15} />}</td>
                    <td>{row.trimestral && <Check size={15} />}</td>
                    <td>{row.anual && <Check size={15} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="faq-card">
            <h3>Perguntas frequentes</h3>
            <ul className="faq-list">
              {FAQ.map((question, i) => (
                <li key={question} className={openFaq === i ? 'is-open' : ''}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {question}
                    <ChevronDown size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="closing-banner">
        <div className="container closing-banner__inner">
          <h3>Ainda tem dúvidas?</h3>
          <p>Nossa equipe está pronta para te ajudar.</p>
          <Button as="link" to="/contatos" variant="secondary">
            Falar com um especialista
          </Button>
        </div>
      </section>
    </>
  )
}
