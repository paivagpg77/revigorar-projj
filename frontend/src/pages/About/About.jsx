import { Eye, Heart, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import Button from '../../components/Button/Button.jsx'
import './About.css'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?auto=format&fit=crop&w=900&q=80'
const WHY_IMAGE = 'https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?auto=format&fit=crop&w=1400&q=80'

export default function About() {
  return (
    <>
      <PageBanner
        eyebrow="SOBRE O REVIGORAR"
        title="Mais que um sistema, é um parceiro no cuidado."
        subtitle="O REVIGORAR nasceu da união entre tecnologia, saúde e empatia. Somos uma equipe apaixonada por inovações e comprometida com a rotina de profissionais da saúde, oferecendo uma solução completa para facilitar o dia a dia das equipes e melhorar a qualidade do atendimento."
        quote="Tecnologia a serviço da vida."
        image={BANNER_IMAGE}
      />
      <div className="container">
        <Button as="link" to="/funcionalidades" variant="secondary" className="about__cta-link" icon>
          Conheça nossa história
        </Button>
      </div>

      {/* HISTÓRIA / MISSÃO */}
      <section className="section about-block">
        <div className="container about-block__grid">
          <div>
            <h2>Nossa história</h2>
            <p>
              O REVIGORAR surgiu a partir da vivência de profissionais da saúde que
              enfrentavam desafios no registro e acompanhamento de pacientes com feridas e
              estomas. Percebemos que era possível unir tecnologia e cuidado para facilitar
              o dia a dia das equipes e melhorar a qualidade de vida dos pacientes.
            </p>
          </div>
          <div>
            <h2>Nossa missão</h2>
            <p>
              Contribuir para a melhoria da vida de pacientes com estomas e feridas, por
              meio de tecnologia e cuidado humanizado.
            </p>
          </div>
        </div>
      </section>

      {/* VISÃO / VALORES */}
      <section className="section about-block about-block--soft">
        <div className="container about-block__grid">
          <div>
            <h2>Nossa visão</h2>
            <p>
              Ser referência em soluções digitais para estomaterapia, reconhecida pela
              inovação, confiabilidade e impacto positivo na vida das pessoas.
            </p>
          </div>
          <div>
            <h2>Nossos valores</h2>
            <ul className="about-values">
              <li><ShieldCheck size={16} /> Ética e responsabilidade</li>
              <li><ArrowRight size={16} /> Inovação contínua</li>
              <li><Heart size={16} /> Humanização no cuidado</li>
              <li><Users size={16} /> Trabalho em equipe</li>
              <li><Eye size={16} /> Compromisso com a vida</li>
            </ul>
          </div>
        </div>
      </section>

      {/* POR QUE REVIGORAR */}
      <section className="section about-why">
        <div className="container about-why__grid">
          <div className="about-why__text">
            <h2>Por que REVIGORAR?</h2>
            <p>
              O nome REVIGORAR representa renovação, cuidado e força. É o que
              acreditamos que toda vida acometida por atenção necessita: ser cuidada
              com atenção, tecnologia e humanidade.
            </p>
          </div>
          <div className="about-why__text">
            <h2>Tecnologia + saúde + cuidado</h2>
            <p>
              Juntos, esses pilares formam a nossa forma única de cuidar e transformar o
              cotidiano de quem depende do sistema.
            </p>
          </div>
          <img className="about-why__photo" src={WHY_IMAGE} alt="Profissional de saúde utilizando tablet com paciente" />
        </div>
      </section>

      {/* SEGURANÇA / DEMONSTRAÇÃO */}
      <section className="section security">
        <div className="container security__grid">
          <div className="security__card">
            <h3>Segurança e privacidade</h3>
            <p>
              Seguimos as melhores práticas de segurança da informação e estamos em
              conformidade com a LGPD, garantindo a proteção dos dados dos nossos usuários
              e pacientes.
            </p>
          </div>
          <div className="security__card security__card--dark">
            <h3>Conheça o REVIGORAR na prática.</h3>
            <Button as="link" to="/contatos" variant="secondary">
              Ver demonstração
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
