import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, CalendarDays, ChevronRight } from 'lucide-react'
import { cardapiosApi, type CardapioRequest } from '../api/cardapiosApi'
import { escolasApi } from '../api/escolasApi'
import type { Cardapio, StatusCardapio } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'

const STATUS_LABELS: Record<StatusCardapio, string> = {
  RASCUNHO: 'Rascunho',
  VALIDADO: 'Validado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
}

const STATUS_COLORS: Record<StatusCardapio, 'gray' | 'blue' | 'emerald' | 'red'> = {
  RASCUNHO: 'gray',
  VALIDADO: 'blue',
  APROVADO: 'emerald',
  REJEITADO: 'red',
}

const cardapioSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  escolaId: z.coerce.number().min(1, 'Escola obrigatória'),
  semana: z.coerce.number().min(1).max(53),
  ano: z.coerce.number().min(2024).max(2030),
})

type CardapioForm = z.infer<typeof cardapioSchema>

const currentWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

function NovoCardapioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: escolas = [] } = useQuery({
    queryKey: ['escolas', 'ativas'],
    queryFn: escolasApi.listarAtivas,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CardapioForm>({
    resolver: zodResolver(cardapioSchema) as never,
    defaultValues: { semana: currentWeek(), ano: new Date().getFullYear() },
  })

  const mutation = useMutation({
    mutationFn: (data: CardapioRequest) => cardapiosApi.criar(data),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['cardapios'] })
      reset()
      onClose()
      navigate(`/cardapios/${created.id}`)
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as CardapioRequest)

  const inputClass = (err: boolean) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${err ? 'border-red-300' : 'border-zinc-200 focus:border-emerald-400'}`

  return (
    <Modal open={open} onClose={onClose} title="Novo Cardápio" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Nome do Cardápio</label>
          <input {...register('nome')} className={inputClass(!!errors.nome)} placeholder="Ex: Cardápio Semana 26" />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Escola</label>
          <select {...register('escolaId')} className={inputClass(!!errors.escolaId)}>
            <option value="">Selecione a escola...</option>
            {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          {errors.escolaId && <p className="text-red-500 text-xs mt-1">{errors.escolaId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Semana</label>
            <input {...register('semana')} type="number" className={inputClass(!!errors.semana)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Ano</label>
            <input {...register('ano')} type="number" className={inputClass(!!errors.ano)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Criar e Editar
          </button>
        </div>
      </form>
    </Modal>
  )
}

function CardapioCard({ cardapio, index }: { cardapio: Cardapio; index: number }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={() => navigate(`/cardapios/${cardapio.id}`)}
      className="bg-white rounded-2xl beautiful-shadow p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 truncate">{cardapio.nome}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{cardapio.escola?.nome}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-2" />
      </div>

      <div className="flex items-center justify-between">
        <Badge color={STATUS_COLORS[cardapio.status]}>{STATUS_LABELS[cardapio.status]}</Badge>
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-600">Semana {cardapio.semana}</p>
          <p className="text-xs text-zinc-400">{cardapio.ano}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between text-xs text-zinc-400">
        <span>{cardapio.itens?.length ?? 0} itens</span>
        <span>{cardapio.dataCadastro ? new Date(cardapio.dataCadastro).toLocaleDateString('pt-BR') : ''}</span>
      </div>
    </motion.div>
  )
}

export function Cardapios() {
  const [modalOpen, setModalOpen] = useState(false)
  const [escolaFilter, setEscolaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: escolas = [] } = useQuery({ queryKey: ['escolas', 'ativas'], queryFn: escolasApi.listarAtivas })

  const { data: cardapios = [], isLoading } = useQuery({
    queryKey: ['cardapios', escolaFilter],
    queryFn: () => escolaFilter ? cardapiosApi.listarPorEscola(Number(escolaFilter)) : Promise.resolve([] as Cardapio[]),
    enabled: !!escolaFilter,
  })

  const filtered = statusFilter
    ? cardapios.filter((c) => c.status === statusFilter)
    : cardapios

  const stats = {
    total: cardapios.length,
    aprovados: cardapios.filter((c) => c.status === 'APROVADO').length,
    validados: cardapios.filter((c) => c.status === 'VALIDADO').length,
    rascunhos: cardapios.filter((c) => c.status === 'RASCUNHO').length,
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Cardápios"
        description="Planejamento semanal de alimentação escolar"
        actions={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow">
            <Plus className="w-4 h-4" /> Novo Cardápio
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarDays} title="Total" value={stats.total} color="blue" delay={0} />
        <StatCard icon={CalendarDays} title="Aprovados" value={stats.aprovados} color="emerald" delay={0.05} />
        <StatCard icon={CalendarDays} title="Validados" value={stats.validados} color="cyan" delay={0.1} />
        <StatCard icon={CalendarDays} title="Rascunhos" value={stats.rascunhos} color="amber" delay={0.15} />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={escolaFilter}
          onChange={(e) => setEscolaFilter(e.target.value)}
          className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 min-w-48"
        >
          <option value="">Selecione uma escola...</option>
          {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Cards grid */}
      {!escolaFilter && (
        <div className="text-center py-16 text-zinc-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione uma escola para ver os cardápios</p>
        </div>
      )}

      {escolaFilter && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl beautiful-shadow p-5 h-36 animate-pulse">
              <div className="h-4 bg-zinc-100 rounded mb-2 w-3/4" />
              <div className="h-3 bg-zinc-100 rounded mb-4 w-1/2" />
              <div className="h-6 bg-zinc-100 rounded w-24" />
            </div>
          ))}
        </div>
      )}

      {escolaFilter && !isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c, i) => <CardapioCard key={c.id} cardapio={c} index={i} />)}
        </div>
      )}

      {escolaFilter && !isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum cardápio encontrado para esta escola</p>
          <button onClick={() => setModalOpen(true)} className="mt-4 px-4 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
            Criar primeiro cardápio
          </button>
        </div>
      )}

      <NovoCardapioModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
