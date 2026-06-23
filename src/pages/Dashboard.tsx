import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import {
  School, Users, Apple, CalendarDays, Package, AlertTriangle,
  TrendingUp, ArrowRight, CheckCircle, Clock, XCircle,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { escolasApi } from '../api/escolasApi'
import { alunosApi } from '../api/alunosApi'
import { alimentosApi } from '../api/alimentosApi'
import { relatoriosApi } from '../api/relatoriosApi'
import { useAuthStore } from '../stores/authStore'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import type { Cardapio, StatusCardapio } from '../types'

const STATUS_COLOR: Record<StatusCardapio, 'gray' | 'blue' | 'emerald' | 'red'> = {
  RASCUNHO: 'gray', VALIDADO: 'blue', APROVADO: 'emerald', REJEITADO: 'red',
}
const STATUS_ICON: Record<StatusCardapio, React.ElementType> = {
  RASCUNHO: Clock, VALIDADO: TrendingUp, APROVADO: CheckCircle, REJEITADO: XCircle,
}

function GreetingBanner({ nome }: { nome: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/10" />
      <div className="relative">
        <p className="text-emerald-100 text-sm font-medium">{greeting},</p>
        <h1 className="text-2xl font-bold mt-0.5">{nome?.split(' ')[0] ?? 'Usuário'}</h1>
        <p className="text-emerald-100 text-sm mt-2">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </motion.div>
  )
}

function CardapioItem({ cardapio, index }: { cardapio: Cardapio; index: number }) {
  const navigate = useNavigate()
  const Icon = STATUS_ICON[cardapio.status]
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => navigate(`/cardapios/${cardapio.id}`)}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate">{cardapio.nome}</p>
        <p className="text-xs text-zinc-400">{cardapio.escola?.nome}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge color={STATUS_COLOR[cardapio.status]}>{cardapio.status}</Badge>
        <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
      </div>
    </motion.div>
  )
}

const radarData = [
  { nutriente: 'Proteínas', pct: 85 },
  { nutriente: 'Carboidratos', pct: 92 },
  { nutriente: 'Gorduras', pct: 73 },
  { nutriente: 'Fibras', pct: 68 },
  { nutriente: 'Cálcio', pct: 80 },
  { nutriente: 'Ferro', pct: 76 },
]

const weekData = [
  { dia: 'Seg', calorias: 1820 },
  { dia: 'Ter', calorias: 1950 },
  { dia: 'Qua', calorias: 1740 },
  { dia: 'Qui', calorias: 2010 },
  { dia: 'Sex', calorias: 1880 },
]

export function Dashboard() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()

  const { data: escolas = [] } = useQuery({ queryKey: ['escolas'], queryFn: escolasApi.listar })
  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: alunosApi.listar })
  const { data: alimentos = [] } = useQuery({ queryKey: ['alimentos'], queryFn: alimentosApi.listar })
  const { data: resumoEscolas } = useQuery({ queryKey: ['rel-escolas'], queryFn: relatoriosApi.escolas })

  const cardapiosRecentes: Cardapio[] = resumoEscolas?.cardapiosRecentes ?? []

  const alertas: { msg: string; tipo: 'red' | 'amber' | 'blue' }[] = []
  if (escolas.length === 0) alertas.push({ msg: 'Nenhuma escola cadastrada', tipo: 'amber' })
  if (alunos.length === 0) alertas.push({ msg: 'Nenhum aluno matriculado', tipo: 'amber' })

  const stats = [
    { icon: School, title: 'Escolas', value: escolas.length, color: 'blue' as const, path: '/escolas', delay: 0 },
    { icon: Users, title: 'Alunos', value: alunos.length, color: 'emerald' as const, path: '/alunos', delay: 0.05 },
    { icon: Apple, title: 'Alimentos', value: alimentos.length, color: 'cyan' as const, path: '/alimentos', delay: 0.1 },
    { icon: Package, title: 'Módulos', value: '6', color: 'amber' as const, path: '/estoque', delay: 0.15 },
  ]

  return (
    <div className="p-6 space-y-6">
      <GreetingBanner nome={usuario?.nome ?? ''} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} onClick={() => navigate(s.path)} className="cursor-pointer">
            <StatCard icon={s.icon} title={s.title} value={s.value} color={s.color} delay={s.delay} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cardápios recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl beautiful-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-zinc-700">Cardápios Recentes</h3>
            </div>
            <button onClick={() => navigate('/cardapios')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {cardapiosRecentes.length > 0 ? (
            <div className="space-y-1">
              {cardapiosRecentes.slice(0, 5).map((c, i) => (
                <CardapioItem key={c.id} cardapio={c} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-300">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum cardápio criado ainda</p>
              <button onClick={() => navigate('/cardapios')} className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Criar primeiro cardápio
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {alertas.length > 0 && (
            <div className="bg-white rounded-2xl beautiful-shadow p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-zinc-700">Alertas</h3>
              </div>
              <div className="space-y-2">
                {alertas.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      a.tipo === 'red' ? 'bg-red-50 text-red-700' :
                      a.tipo === 'amber' ? 'bg-amber-50 text-amber-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {a.msg}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl beautiful-shadow p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-zinc-700">Cobertura Nutricional</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Média dos cardápios aprovados</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f4f4f5" />
                <PolarAngleAxis dataKey="nutriente" tick={{ fontSize: 9, fill: '#71717a' }} />
                <Radar dataKey="pct" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl beautiful-shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-zinc-700">Calorias Semanais</h3>
          <span className="text-xs text-zinc-400 ml-1">— semana atual</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
            <Area type="monotone" dataKey="calorias" stroke="#10b981" strokeWidth={2} fill="url(#calGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
