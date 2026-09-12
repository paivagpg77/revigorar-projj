import { Link } from 'react-router-dom';
import { Heart, Shield, Wifi, FileText, Calendar, DollarSign, Package, MessageCircle, Stethoscope } from 'lucide-react';
import './Home.css';

const MODULES = [
  { icon: <Stethoscope size={20} />, title: 'Avaliação clínica', desc: 'Prontuário com mapa corporal, fotos ilimitadas, composição do leito e comparativo visual entre semanas.', color: 'var(--teal-400)' },
  { icon: <FileText size={20} />, title: 'Escalas e scores', desc: 'PUSH 3.0, RESVECH 2.0, Braden, Wagner, SACS 2.0. Sugestão automática pela etiologia.', color: 'var(--coral)' },
  { icon: <Shield size={20} />, title: 'Documentação e laudos', desc: 'Relatórios clínicos com sua logo, assinatura digital e verificação por QR code.', color: '#818CF8' },
  { icon: <Calendar size={20} />, title: 'Agenda inteligente', desc: 'Espelho no Google Calendar, retornos sugeridos e confirmação automática.', color: '#FBBF24' },
  { icon: <DollarSign size={20} />, title: 'Gestão financeira', desc: 'Fluxo de caixa, pacotes, recibos e relatórios prontos para contabilidade.', color: '#F472B6' },
  { icon: <Package size={20} />, title: 'Estoque fracionado', desc: 'Controle por unidade, cm, ml ou g. Consumo registrado direto na avaliação.', color: '#22D3EE' },
];

const PLANS = [
  { name: 'Essencial', price: '79', desc: 'Prontuário completo e agenda para o profissional autônomo.', features: ['Pacientes ilimitados','Prontuário especializado','Fotos ilimitadas','Mapa corporal','Escalas clínicas','Agenda com retornos'], featured: false },
  { name: 'Profissional', price: '149', desc: 'Inteligência, gestão financeira e comunicação integrada.', features: ['Tudo do Essencial','Assistente IA','Estoque fracionado','Gestão financeira','Comunicação automática','Assinatura digital','Indicadores clínicos','Modo offline completo'], featured: true },
  { name: 'Equipe', price: '249', desc: 'Para clínicas com múltiplos profissionais.', features: ['Tudo do Profissional','Até 5 profissionais','Permissões por perfil','Auditoria de acessos','Suporte prioritário'], featured: false },
];

export default function Home() {
  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-pulse" />
              Plataforma clínica de nova geração
            </div>
            <h1>Onde a evidência clínica encontra a <em>gestão inteligente</em></h1>
            <p className="hero-desc">Prontuário especializado, escalas automatizadas e indicadores de cicatrização reunidos em uma plataforma pensada por quem entende a rotina de feridas.</p>
            <div className="hero-actions">
              <Link to="/login?tab=register" className="btn-primary">Iniciar período gratuito →</Link>
              <a href="#modulos" className="btn-outline">Conhecer a plataforma</a>
            </div>
            <div className="hero-proof">
              <span><b className="dot" /> Acesso imediato</span>
              <span><b className="dot" /> 7 dias sem compromisso</span>
              <span><b className="dot" /> Dados no Brasil</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="clin-card">
              <div className="clin-header">
                <div className="clin-avatar">MS</div>
                <div>
                  <div className="clin-name">Maria S., 67 anos</div>
                  <div className="clin-meta">Sacro · Estágio III · 45 dias</div>
                </div>
                <span className="clin-status">Em tratamento</span>
              </div>
              <div className="clin-body">
                <div className="wb-label">Composição do leito</div>
                <div className="wb-bar">
                  <div className="wb-seg" style={{flex:65,background:'#4ADE80'}} />
                  <div className="wb-seg" style={{flex:18,background:'#FBBF24'}} />
                  <div className="wb-seg" style={{flex:7,background:'#94A3B8'}} />
                  <div className="wb-seg" style={{flex:10,background:'#F472B6'}} />
                </div>
                <div className="wb-legend">
                  <span><b style={{background:'#4ADE80'}} /> 65% Gran</span>
                  <span><b style={{background:'#FBBF24'}} /> 18% Esf</span>
                  <span><b style={{background:'#94A3B8'}} /> 7% Nec</span>
                  <span><b style={{background:'#F472B6'}} /> 10% Epit</span>
                </div>
                <div className="clin-scores">
                  <div className="cs"><span className="cs-val">11</span><span className="cs-lab">PUSH 3.0</span></div>
                  <div className="cs"><span className="cs-val">14</span><span className="cs-lab">Braden</span></div>
                  <div className="cs"><span className="cs-val">-38%</span><span className="cs-lab">Área (30d)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PULSE DIVIDER */}
      <div className="pulse-div">
        <svg viewBox="0 0 800 40" fill="none" style={{width:'100%',maxWidth:800,height:40}}>
          <path d="M0 20 H280 L300 6 L320 34 L340 12 L360 28 L380 20 H520 L540 6 L560 34 L580 12 L600 28 L620 20 H800"
            stroke="var(--teal-300)" strokeWidth="2" fill="none" className="pulse-anim" />
        </svg>
      </div>

      {/* STATS */}
      <section className="stats-bar">
        <div className="wrap stats-grid">
          <div><span className="stat-num">87%</span><span className="stat-lab">Taxa de cicatrização</span></div>
          <div><span className="stat-num">5 min</span><span className="stat-lab">Economia por registro</span></div>
          <div><span className="stat-num">100%</span><span className="stat-lab">Offline no domiciliar</span></div>
          <div><span className="stat-num">LGPD</span><span className="stat-lab">Conformidade total</span></div>
        </div>
      </section>

      {/* MODULES */}
      <section className="modules" id="modulos">
        <div className="wrap">
          <span className="eyebrow light">A plataforma completa</span>
          <h2 className="sec-title light">Seis eixos que cobrem toda a sua prática</h2>
          <div className="mod-grid">
            {MODULES.map((m, i) => (
              <div className="mod-card" key={i} style={{'--accent': m.color}}>
                <span className="mod-num">0{i + 1}</span>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFLINE */}
      <section className="offline-bar">
        <div className="wrap offline-inner">
          <Wifi size={36} />
          <div>
            <h3>Sem sinal? Sem problema.</h3>
            <p>Cadastre, agende e registre avaliações com fotos em modo avião. Tudo sincroniza quando a conexão volta.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="planos">
        <div className="wrap">
          <span className="eyebrow">Planos</span>
          <h2 className="sec-title center">Escolha o tamanho certo para a sua prática</h2>
          <p className="sec-desc center">Sem taxa de adesão, sem fidelidade. Comece com 7 dias gratuitos.</p>
          <div className="plans-grid">
            {PLANS.map((p, i) => (
              <div className={`plan-card ${p.featured ? 'pop' : ''}`} key={i}>
                {p.featured && <span className="plan-tag">Recomendado</span>}
                <h3 className="plan-name">{p.name}</h3>
                <div className="plan-price"><span>R$</span><b>{p.price}</b><span>/mês</span></div>
                <p className="plan-desc">{p.desc}</p>
                <ul>{p.features.map((f, j) => <li key={j}><span className="chk">✓</span>{f}</li>)}</ul>
                <Link to="/login?tab=register" className={p.featured ? 'btn-primary' : 'btn-outline'} style={{width:'100%',textAlign:'center'}}>
                  {p.featured ? 'Iniciar teste grátis' : p.price === '249' ? 'Falar com a equipe' : 'Iniciar teste grátis'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="wrap" style={{textAlign:'center'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:40,marginBottom:16}}>Comece a documentar com precisão</h2>
          <p style={{fontSize:18,color:'var(--ink-muted)',maxWidth:440,margin:'0 auto 36px'}}>Sete dias para testar tudo, sem compromisso.</p>
          <Link to="/login?tab=register" className="btn-primary" style={{fontSize:17,padding:'16px 40px'}}>Criar minha conta gratuita →</Link>
          <p style={{fontSize:13,color:'var(--ink-faint)',marginTop:16}}>Sem cartão · Cancele quando quiser · LGPD compliant</p>
        </div>
      </section>
    </div>
  );
}
