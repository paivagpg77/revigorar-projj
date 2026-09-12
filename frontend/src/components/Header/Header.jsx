import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Search, Menu, X, Leaf } from 'lucide-react'
import Button from '../Button/Button.jsx'
import './Header.css'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Sobre nós', to: '/sobre-nos' },
  { label: 'Funcionalidades', to: '/funcionalidades' },
  { label: 'Planos', to: '/planos' },
  { label: 'Contatos', to: '/contatos' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="container header__inner">
        <NavLink to="/" className="header__brand" onClick={() => setOpen(false)}>
          <span className="header__brand-icon">
            <Leaf size={20} strokeWidth={2.4} />
          </span>
          <span className="header__brand-text">
            REVIGORAR
            <small>Cuidado que evolui</small>
          </span>
        </NavLink>

        <nav className={`header__nav ${open ? 'is-open' : ''}`}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `header__link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button className="header__icon-btn" aria-label="Buscar">
            <Search size={18} />
          </button>
          <Button as="link" to="/contatos" variant="primary" size="sm">
            Acessar o sistema
          </Button>
          <button
            className="header__icon-btn header__menu-toggle"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
