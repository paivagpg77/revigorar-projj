import { useState } from 'react'
import { Phone, Mail, MapPin, CalendarCheck } from 'lucide-react'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import Button from '../../components/Button/Button.jsx'
import './Contact.css'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?auto=format&fit=crop&w=900&q=80'

const OTHER_CONTACTS = [
  {
    icon: <Phone size={18} />,
    title: 'WhatsApp',
    lines: ['(11) 4000-0802', 'Segunda a sexta, das 8h às 18h'],
  },
  {
    icon: <Mail size={18} />,
    title: 'E-mail',
    lines: ['contato@revigorar.com', 'Respondemos em até 24h'],
  },
  {
    icon: <MapPin size={18} />,
    title: 'Localização',
    lines: ['Rua Exemplo, 123 — São Paulo/SP', '(Atendimento online e presencial)'],
  },
]

const FAQ = [
  'Como funciona a implementação?',
  'É possível cadastrar vários profissionais?',
  'Posso utilizar pelo celular?',
  'Como funciona o suporte?',
  'Posso utilizar pelo tablet?',
  'Como funciona a contratação?',
  'O sistema funciona em clínicas?',
  'Quais são as formas de pagamento?',
]

const INITIAL_FORM = {
  nome: '', email: '', whatsapp: '', instituicao: '', cargo: '', assunto: '', mensagem: '',
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm(INITIAL_FORM)
  }

  return (
    <>
      <PageBanner
        eyebrow="CONTATOS"
        title="Fale com o REVIGORAR"
        subtitle="Tire suas dúvidas, solicite uma demonstração ou peça uma proposta personalizada."
        quote="Estamos prontos para te atender!"
        image={BANNER_IMAGE}
      />

      <section className="section contact-main">
        <div className="container contact-main__grid">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Envie sua mensagem</h2>

            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" required />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" required />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input id="whatsapp" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" />
              </div>
              <div className="field">
                <label htmlFor="instituicao">Instituição</label>
                <input id="instituicao" name="instituicao" value={form.instituicao} onChange={handleChange} placeholder="Nome da instituição" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="cargo">Cargo / Profissão</label>
              <select id="cargo" name="cargo" value={form.cargo} onChange={handleChange}>
                <option value="">Selecione</option>
                <option>Enfermeiro(a)</option>
                <option>Estomaterapeuta</option>
                <option>Gestor(a) de saúde</option>
                <option>Outro</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="assunto">Assunto</label>
              <select id="assunto" name="assunto" value={form.assunto} onChange={handleChange}>
                <option value="">Selecione</option>
                <option>Solicitar demonstração</option>
                <option>Dúvidas sobre planos</option>
                <option>Suporte técnico</option>
                <option>Parcerias</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea id="mensagem" name="mensagem" rows={4} value={form.mensagem} onChange={handleChange} placeholder="Digite sua mensagem..." required />
            </div>

            <Button type="submit" variant="primary" className="contact-form__submit">
              Enviar mensagem
            </Button>
            {sent && <p className="contact-form__success">Mensagem enviada com sucesso! Em breve entraremos em contato.</p>}
          </form>

          <aside className="contact-side">
            <div className="contact-side__card">
              <h3>Outros meios de contato</h3>
              {OTHER_CONTACTS.map((c) => (
                <div className="contact-item" key={c.title}>
                  <span className="contact-item__icon">{c.icon}</span>
                  <div>
                    <strong>{c.title}</strong>
                    {c.lines.map((line) => <span key={line}>{line}</span>)}
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-side__card contact-side__card--dark">
              <CalendarCheck size={22} />
              <h3>Solicite uma demonstração</h3>
              <p>Veja na prática como o REVIGORAR pode facilitar o seu dia a dia.</p>
              <Button variant="secondary">Agendar demonstração</Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section contact-faq">
        <div className="container">
          <h2 className="section-title">Perguntas frequentes</h2>
          <div className="contact-faq__grid">
            {FAQ.map((question) => (
              <div className="contact-faq__item" key={question}>{question}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
