import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Utensils, Mail, Lock, Eye, EyeOff, AlertCircle, Leaf, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-grid-emerald"
      style={{ backgroundColor: '#f4f7f5' }}
    >
      {/* Ambient background blobs */}
      <div
        className="pointer-events-none absolute -top-[15%] -left-[10%] w-[48%] h-[48%] rounded-full blur-[120px] animate-float-blob"
        style={{ backgroundColor: 'rgba(16,185,129,0.18)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-[15%] -right-[10%] w-[48%] h-[48%] rounded-full blur-[120px] animate-float-blob"
        style={{ backgroundColor: 'rgba(6,182,212,0.16)', animationDelay: '-4s' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
        style={{ zIndex: 10 }}
      >
        <div
          className="relative rounded-[32px] overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8ecea',
            boxShadow:
              '0 30px 60px -12px rgba(6,78,59,0.12), 0 10px 20px -10px rgba(0,0,0,0.05)',
          }}
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="px-8 pt-8 pb-8 sm:px-10"
          >
            {/* Top row: brand + status */}
            <motion.div variants={item} className="flex items-center justify-between mb-9">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#059669' }}
                >
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-bold leading-tight" style={{ color: '#065f46' }}>
                    PNAE
                  </p>
                  <p className="text-xs" style={{ color: '#10b981' }}>
                    Alimentação Escolar
                  </p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: '#34d399' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: '#10b981' }}
                  />
                </span>
                Sistema online
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={item}
              className="text-3xl font-semibold tracking-tight leading-tight"
              style={{ color: '#18181b' }}
            >
              Bem-vindo de volta
            </motion.h1>
            <motion.p variants={item} className="mt-1.5 text-sm" style={{ color: '#71717a' }}>
              Faça login para acessar o painel de gestão.
            </motion.p>

            {/* Error */}
            {error && (
              <motion.div
                variants={item}
                className="flex items-center gap-2 rounded-xl px-4 py-3 mt-6"
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#dc2626' }} />
                <p className="text-sm" style={{ color: '#991b1b' }}>
                  {error}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
              {/* Email */}
              <motion.div variants={item}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#3f3f46' }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#a1a1aa' }}
                  />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@pnae.gov.br"
                    className="login-input w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e4e4e7', color: '#27272a' }}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              {/* Senha */}
              <motion.div variants={item}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#3f3f46' }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#a1a1aa' }}
                  />
                  <input
                    {...register('senha')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="login-input w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e4e4e7', color: '#27272a' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                    style={{ color: '#a1a1aa' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
                    {errors.senha.message}
                  </p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.button
                variants={item}
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="group w-full font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#059669',
                  color: '#fff',
                  boxShadow: '0 10px 20px -6px rgba(5,150,105,0.35)',
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full animate-spin"
                      style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
                    />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Footer strip */}
          <div
            className="px-8 sm:px-10 py-4 flex items-center justify-center gap-1.5"
            style={{ borderTop: '1px solid #f1f5f4', backgroundColor: '#fafbfb' }}
          >
            <Leaf className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            <span className="text-[11px]" style={{ color: '#9ca3af' }}>
              Programa Nacional de Alimentação Escolar
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
