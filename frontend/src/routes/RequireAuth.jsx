import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../services/authService.js'

/**
 * Envolve as rotas internas do sistema: se não houver sessão ativa,
 * redireciona para /login (guardando a rota de origem para retornar após
 * o login).
 */
export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
