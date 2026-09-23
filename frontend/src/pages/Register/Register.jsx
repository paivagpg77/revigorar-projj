import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { register } from '../../services/authService.js'
import '../Login/Login.css'

export default function Register() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirmPassword) {
      showToast('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password)
      showToast('Conta criada com sucesso. Bem-vindo(a)!')
      navigate('/', { replace: true })
    } catch (err) {
      showToast(err.message || 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
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
            <label htmlFor="register-name">Nome completo</label>
            <input
              id="register-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Senha</label>
            <div className="login__password">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="register-confirm-password">Confirmar senha</label>
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login__submit" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="login__footer">
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
