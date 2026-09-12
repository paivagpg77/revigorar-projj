import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, register } from '../../services/api';
import './Login.css';

export default function Login() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const fd = new FormData(e.target);
    try {
      await login(fd.get('email'), fd.get('password'));
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const fd = new FormData(e.target);
    try {
      await register({
        full_name: fd.get('full_name'),
        email: fd.get('email'),
        password: fd.get('password'),
        phone: fd.get('phone'),
        professional_license: fd.get('professional_license'),
        specialization: fd.get('specialization'),
      });
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-float af1"><div className="af-lab">Taxa de cicatrização</div><div className="af-val">87.3%</div></div>
        <div className="auth-float af2"><div className="af-lab">PUSH 3.0</div><div className="af-val" style={{color:'#5EEAD4'}}>Score: 11</div></div>
        <div className="auth-text">
          <h2>Onde a evidência clínica encontra a <em>gestão inteligente</em></h2>
          <p>Prontuário especializado, escalas automatizadas e indicadores de cicatrização.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-inner">
          <div className="brand" style={{marginBottom:32}}>
            <div className="brand-icon" /><span className="brand-name">REVIGORAR</span>
          </div>

          <div className="auth-tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Entrar</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Criar conta</button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <h1 className="auth-h">Bem-vindo de volta</h1>
              <p className="auth-sub">Acesse sua plataforma clínica.</p>
              <label className="field-label">E-mail</label>
              <input name="email" type="email" className="field-input" placeholder="seu@email.com" required />
              <label className="field-label">Senha</label>
              <input name="password" type="password" className="field-input" placeholder="Sua senha" required />
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h1 className="auth-h">Crie sua conta</h1>
              <p className="auth-sub">7 dias gratuitos. Sem cartão de crédito.</p>
              <label className="field-label">Nome completo</label>
              <input name="full_name" className="field-input" placeholder="Dr(a). Nome Sobrenome" required />
              <label className="field-label">E-mail profissional</label>
              <input name="email" type="email" className="field-input" placeholder="seu@email.com" required />
              <div className="field-row">
                <div><label className="field-label">Registro</label><input name="professional_license" className="field-input" placeholder="COREN, CRM..." /></div>
                <div><label className="field-label">Telefone</label><input name="phone" className="field-input" placeholder="(00) 00000-0000" /></div>
              </div>
              <label className="field-label">Especialidade</label>
              <select name="specialization" className="field-input">
                <option value="">Selecione...</option>
                <option>Estomaterapia</option>
                <option>Enfermagem em feridas</option>
                <option>Laserterapia</option>
                <option>Podiatria</option>
                <option>Medicina</option>
                <option>Outra</option>
              </select>
              <label className="field-label">Senha</label>
              <input name="password" type="password" className="field-input" placeholder="Mínimo 8 caracteres" required />
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Criando...' : 'Criar conta gratuita →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
