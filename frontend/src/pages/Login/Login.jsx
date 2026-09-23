import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { login } from '../../services/authService.js'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form.email, form.password, remember)
      navigate('/', { replace: true })
    } catch (err) {
      showToast(err.message || 'Não foi possível entrar. Verifique suas credenciais.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    if (!form.email.trim()) {
      showToast('Digite seu e-mail acima para receber o link de redefinição.')
      return
    }
    showToast(`Link de redefinição enviado para ${form.email}.`)
  }

  return (
    <div className="login">
      <div className="login__side">
        <h1>
          Tecnologia e cuidado em cada etapa do tratamento de estomias e feridas.
        </h1>
        <ul className="login__benefits">
          <li>Mais organização</li>
          <li>Maior segurança</li>
          <li>Melhor cuidado</li>
        </ul>
        <div className="login__side-brand">
          <Leaf size={18} strokeWidth={2.4} />
          REVIGORAR
        </div>
      </div>

      <div className="login__panel">
        <form className="login__card" onSubmit={handleSubmit}>
          <div className="login__logo">
            <span className="login__logo-icon"><Leaf size={22} strokeWidth={2.4} /></span>
            <strong>REVIGORAR</strong>
            <small>CUIDADO QUE EVOLUI</small>
          </div>

          <div className="form-field">
            <label htmlFor="login-email">E-mail ou usuário</label>
            <input
              id="login-email"
              type="text"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <div className="login__password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login__row">
            <label className="login__remember">
              <input type="checkbox" checked={remember} onChange={() => setRemember((v) => !v)} />
              Lembrar de mim
            </label>
            <a href="#" onClick={handleForgotPassword}>Esqueceu sua senha?</a>
          </div>

          <button type="submit" className="btn btn-primary login__submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="login__footer">
            Ainda não tem uma conta? <Link to="/cadastro">Criar nova conta</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
