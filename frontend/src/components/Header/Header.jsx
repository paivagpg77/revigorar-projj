import { Link, useLocation } from 'react-router-dom';
import { getToken, clearToken } from '../../services/api';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isLogged = !!getToken();
  const isDash = location.pathname.startsWith('/dashboard');

  if (isDash) return null;

  return (
    <nav className="nav">
      <div className="nav-inner wrap">
        <Link to="/" className="brand">
          <div className="brand-icon" />
          <span className="brand-name">REVIGORAR</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Início</Link>
          <Link to="/#modulos">Plataforma</Link>
          <Link to="/#planos">Planos</Link>
          {isLogged ? (
            <Link to="/dashboard" className="btn-nav-primary">Painel</Link>
          ) : (
            <>
              <Link to="/login" className="btn-nav-ghost">Entrar</Link>
              <Link to="/login?tab=register" className="btn-nav-primary">Teste grátis</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
