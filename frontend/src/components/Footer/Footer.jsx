import { NavLink } from 'react-router-dom'
import { Leaf, Instagram, Linkedin, Facebook } from 'lucide-react'
import './Footer.css'

const LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Sobre nós', to: '/sobre-nos' },
  { label: 'Funcionalidades', to: '/funcionalidades' },
  { label: 'Planos', to: '/planos' },
  { label: 'Contatos', to: '/contatos' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <NavLink to="/" className="footer__brand">
          <span className="footer__brand-icon">
            <Leaf size={18} strokeWidth={2.4} />
          </span>
          <span className="footer__brand-text">
            REVIGORAR
            <small>Cuidado que evolui</small>
          </span>
        </NavLink>

        <nav className="footer__nav">
          <ul>
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__social">
          <a href="#" aria-label="Instagram"><Instagram size={16} /></a>
          <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
          <a href="#" aria-label="Facebook"><Facebook size={16} /></a>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© 2026 Revigorar. Todos os direitos reservados.</span>
          <div className="footer__legal">
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
