import { create } from 'zustand'
import api from '../api/axios'

interface Usuario {
  id: number
  nome: string
  email: string
  role: string
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadFromStorage: () => {
    const token = localStorage.getItem('pnae_token')
    const usuarioStr = localStorage.getItem('pnae_usuario')
    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr)
        set({ token, usuario, isAuthenticated: true })
      } catch {
        localStorage.removeItem('pnae_token')
        localStorage.removeItem('pnae_usuario')
      }
    }
  },

  login: async (email: string, senha: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/api/auth/login', { email, senha })
      const { token, usuario } = data
      localStorage.setItem('pnae_token', token)
      localStorage.setItem('pnae_usuario', JSON.stringify(usuario))
      set({ token, usuario, isAuthenticated: true, isLoading: false })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Credenciais inválidas'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem('pnae_token')
    localStorage.removeItem('pnae_usuario')
    set({ token: null, usuario: null, isAuthenticated: false })
  },
}))
