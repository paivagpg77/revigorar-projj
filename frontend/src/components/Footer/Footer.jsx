import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{marginBottom:12}}>
              <div className="brand-icon" />
              <span className="brand-name" style={{color:'rgba(255,255,255,.9)'}}>REVIGORAR</span>
            </div>
            <p className="foot-desc">Plataforma de gestão clínica para profissionais especializados em feridas, estomias e reabilitação tecidual.</p>
          </div>
          <div className="foot-col">
            <h4>Plataforma</h4>
            <Link to="/">Avaliação clínica</Link>
            <Link to="/">Escalas e scores</Link>
            <Link to="/">Gestão financeira</Link>
            <Link to="/">Assistente IA</Link>
          </div>
          <div className="foot-col">
            <h4>Suporte</h4>
            <Link to="/">Central de ajuda</Link>
            <Link to="/">Documentação</Link>
            <Link to="/">Contato</Link>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <Link to="/">Termos de uso</Link>
            <Link to="/">Privacidade</Link>
            <Link to="/">LGPD</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Revigorar. Todos os direitos reservados.</span>
          <div className="foot-badges">
            <span className="foot-badge">LGPD</span>
            <span className="foot-badge">SSL</span>
            <span className="foot-badge">BR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
