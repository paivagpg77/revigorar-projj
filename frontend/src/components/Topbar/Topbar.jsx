import { useEffect, useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'

import {
  Search,
  RefreshCw,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut
} from 'lucide-react'

import Avatar from '../Avatar/Avatar.jsx'

import { useToast } from '../Toast/ToastContext.jsx'

import {
  logout,
  getCurrentUser
} from '../../services/authService.js'

import './Topbar.css'


const NOTIFICATIONS = [
  {
    text: 'Nenhuma nova notificação.',
    time: ''
  }
]


export default function Topbar({ onOpenMobileMenu }) {

  const [menuOpen, setMenuOpen] = useState(false)

  const [notifOpen, setNotifOpen] = useState(false)

  const [syncing, setSyncing] = useState(false)

  const [query, setQuery] = useState('')


  // Usuário que será preenchido pelo Backend
  const [currentUser, setCurrentUser] = useState({
    name: 'Carregando...',
    role: 'Usuário',
    initials: '...'
  })


  const navigate = useNavigate()

  const showToast = useToast()


  // Busca o usuário logado no Backend
  useEffect(() => {

    let mounted = true

    async function loadUser() {

      try {

        const user = await getCurrentUser()

        if (!mounted || !user) {
          return
        }


        // Aceita diferentes nomes de campos
        // para ficar compatível com o Backend.
        const name =
          user.name ||
          user.full_name ||
          user.nome ||
          'Usuário'


        const role =
          user.role ||
          user.perfil ||
          user.cargo ||
          'Usuário'


        const initials =
          user.initials ||
          user.iniciais ||
          name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase()


        setCurrentUser({
          name,
          role,
          initials
        })


      } catch (error) {

        console.error(
          'Erro ao carregar usuário:',
          error
        )

        // Não volta para Ana Silva.
        // Mantém apenas um usuário genérico.
        if (mounted) {

          setCurrentUser({
            name: 'Usuário',
            role: 'Usuário',
            initials: 'US'
          })

        }

      }

    }


    loadUser()


    return () => {
      mounted = false
    }

  }, [])


  const handleSync = () => {

    setSyncing(true)

    setTimeout(() => {

      setSyncing(false)

      showToast(
        'Dados sincronizados com sucesso.'
      )

    }, 900)

  }


  const handleSearch = (e) => {

    e.preventDefault()

    if (!query.trim()) {
      return
    }

    navigate(
      `/pacientes?q=${encodeURIComponent(
        query.trim()
      )}`
    )

    setQuery('')

  }


  const handleLogout = () => {

    setMenuOpen(false)

    logout()

    navigate('/login')

  }


  return (

    <header className="topbar">


      <button
        className="topbar__menu-btn"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu"
      >

        <Menu size={20} />

      </button>


      <form
        className="topbar__search"
        onSubmit={handleSearch}
      >

        <Search size={16} />

        <input
          type="text"
          placeholder="Buscar paciente, ferida, documento..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />

      </form>


      <div className="topbar__actions">


        {/* SINCRONIZAR */}

        <button
          className="btn-icon"
          aria-label="Sincronizar"
          onClick={handleSync}
        >

          <RefreshCw
            size={16}
            className={
              syncing
                ? 'topbar__spin'
                : ''
            }
          />

        </button>


        {/* NOTIFICAÇÕES */}

        <div className="topbar__notif">

          <button
            className="btn-icon topbar__bell"
            aria-label="Notificações"
            onClick={() => {

              setNotifOpen(
                (v) => !v
              )

              setMenuOpen(false)

            }}
          >

            <Bell size={16} />

            <span className="topbar__dot" />

          </button>


          {notifOpen && (

            <div className="topbar__dropdown topbar__dropdown--wide">

              <strong className="topbar__dropdown-title">
                Notificações
              </strong>


              {NOTIFICATIONS.map((n) => (

                <div
                  className="topbar__notif-item"
                  key={n.text}
                >

                  <p>
                    {n.text}
                  </p>

                  {n.time && (
                    <span>
                      {n.time}
                    </span>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>


        {/* USUÁRIO */}

        <div className="topbar__user">

          <button
            className="topbar__user-trigger"
            onClick={() => {

              setMenuOpen(
                (v) => !v
              )

              setNotifOpen(false)

            }}
          >

            <Avatar
              initials={
                currentUser.initials
              }
              size={34}
            />


            <div className="topbar__user-text">

              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.role}
              </span>

            </div>


            <ChevronDown size={14} />

          </button>


          {menuOpen && (

            <div className="topbar__dropdown">


              <Link
                to="/configuracoes"
                onClick={() =>
                  setMenuOpen(false)
                }
              >

                <User size={14} />

                Meu perfil

              </Link>


              <Link
                to="/configuracoes"
                onClick={() =>
                  setMenuOpen(false)
                }
              >

                <Settings size={14} />

                Configurações

              </Link>


              <button
                onClick={handleLogout}
              >

                <LogOut size={14} />

                Sair

              </button>


            </div>

          )}

        </div>


      </div>

    </header>

  )

}