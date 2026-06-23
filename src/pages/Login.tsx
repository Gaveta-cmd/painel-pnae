import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Utensils, Mail, Lock, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.senha)
      navigate('/dashboard')
    } catch {
      // error is in store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-300/10 rounded-full blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Glass card */}
        <div className="glass-effect bg-white/15 border border-white/25 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">PNAE</h1>
              <p className="text-white/70 text-sm">Alimentação Escolar</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h2>
          <p className="text-white/70 text-sm mb-7">Faça login para acessar o painel</p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0" />
              <p className="text-red-100 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@pnae.gov.br"
                  className="w-full bg-white/15 border border-white/25 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-200 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  {...register('senha')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-white/15 border border-white/25 text-white placeholder-white/40 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-red-200 text-xs mt-1">{errors.senha.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-emerald-700 font-semibold rounded-xl py-3 text-sm hover:bg-white/90 transition-all beautiful-shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-white/50 text-xs">
          <Leaf className="w-3.5 h-3.5" />
          <span>Programa Nacional de Alimentação Escolar</span>
        </div>
      </motion.div>
    </div>
  )
}
