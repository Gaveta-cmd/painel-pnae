import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Flame, Dumbbell } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cardapiosApi, type ItemCardapioRequest } from '../api/cardapiosApi'
import { alimentosApi } from '../api/alimentosApi'
import type { DiaSemana, TipoRefeicao, ItemCardapio, Alimento, StatusCardapio } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

const DIAS: DiaSemana[] = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA']
const DIA_LABELS: Record<DiaSemana, string> = {
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
}
const REFEICOES: TipoRefeicao[] = ['DESJEJUM', 'COLACAO', 'ALMOCO', 'LANCHE_TARDE', 'JANTAR']
const REFEICAO_LABELS: Record<TipoRefeicao, string> = {
  DESJEJUM: 'Desjejum',
  COLACAO: 'Colação',
  ALMOCO: 'Almoço',
  LANCHE_TARDE: 'Lanche',
  JANTAR: 'Jantar',
}
const STATUS_COLORS: Record<StatusCardapio, 'gray' | 'blue' | 'emerald' | 'red'> = {
  RASCUNHO: 'gray',
  VALIDADO: 'blue',
  APROVADO: 'emerald',
  REJEITADO: 'red',
}
const STATUS_LABELS: Record<StatusCardapio, string> = {
  RASCUNHO: 'Rascunho',
  VALIDADO: 'Validado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
}

const itemSchema = z.object({
  alimentoId: z.coerce.number().min(1, 'Selecione um alimento'),
  quantidadeGramas: z.coerce.number().min(1, 'Quantidade obrigatória'),
  diaSemana: z.string().min(1),
  tipoRefeicao: z.string().min(1),
})
type ItemForm = z.infer<typeof itemSchema>

function AdicionarItemModal({
  open, onClose, dia, refeicao, cardapioId,
}: {
  open: boolean; onClose: () => void; dia: DiaSemana; refeicao: TipoRefeicao; cardapioId: number
}) {
  const qc = useQueryClient()
  const { data: alimentos = [] } = useQuery({ queryKey: ['alimentos', 'ativos'], queryFn: alimentosApi.listarAtivos })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema) as never,
    defaultValues: { diaSemana: dia, tipoRefeicao: refeicao },
  })

  const mutation = useMutation({
    mutationFn: (data: ItemCardapioRequest) => cardapiosApi.adicionarItem(cardapioId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cardapio', cardapioId] }); reset(); onClose() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as ItemCardapioRequest)

  return (
    <Modal open={open} onClose={onClose} title={`Adicionar — ${DIA_LABELS[dia]}, ${REFEICAO_LABELS[refeicao]}`} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
        <input type="hidden" {...register('diaSemana')} />
        <input type="hidden" {...register('tipoRefeicao')} />
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Alimento</label>
          <select {...register('alimentoId')} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400">
            <option value="">Selecione...</option>
            {alimentos.map((a: Alimento) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          {errors.alimentoId && <p className="text-red-500 text-xs mt-1">{errors.alimentoId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Quantidade (gramas)</label>
          <input {...register('quantidadeGramas')} type="number" className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400" placeholder="200" />
          {errors.quantidadeGramas && <p className="text-red-500 text-xs mt-1">{errors.quantidadeGramas.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60">Adicionar</button>
        </div>
      </form>
    </Modal>
  )
}

function ValidarModal({ open, onClose, cardapioId }: { open: boolean; onClose: () => void; cardapioId: number }) {
  const qc = useQueryClient()
  const [faixa, setFaixa] = useState('FUNDAMENTAL_1')
  const [result, setResult] = useState<null | { valido: boolean; alertas: string[] }>(null)

  const mutation = useMutation({
    mutationFn: () => cardapiosApi.validar(cardapioId, faixa),
    onSuccess: (data) => setResult(data),
  })
  const aprovarMutation = useMutation({
    mutationFn: () => cardapiosApi.aprovar(cardapioId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cardapio', cardapioId] }); onClose() },
  })

  const FAIXAS = ['CRECHE_1', 'CRECHE_2', 'PRE_ESCOLA', 'FUNDAMENTAL_1', 'FUNDAMENTAL_2', 'MEDIO', 'EJA']

  return (
    <Modal open={open} onClose={() => { setResult(null); onClose() }} title="Validar Cardápio" size="md">
      <div className="px-6 py-5 space-y-4">
        {!result ? (
          <>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Faixa Etária</label>
              <select value={faixa} onChange={(e) => setFaixa(e.target.value)} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400">
                {FAIXAS.map((f) => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
              <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Validar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`p-4 rounded-xl flex items-center gap-3 ${result.valido ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {result.valido
                ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              }
              <p className={`text-sm font-medium ${result.valido ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.valido ? 'Cardápio válido para a faixa selecionada' : 'Cardápio não atende os requisitos'}
              </p>
            </div>
            {result.alertas?.length > 0 && (
              <ul className="space-y-1.5">
                {result.alertas.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
              <button onClick={() => setResult(null)} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Revisar</button>
              {result.valido && (
                <button onClick={() => aprovarMutation.mutate()} disabled={aprovarMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                  {aprovarMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <ThumbsUp className="w-4 h-4" /> Aprovar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function RejeitarModal({ open, onClose, cardapioId }: { open: boolean; onClose: () => void; cardapioId: number }) {
  const qc = useQueryClient()
  const [motivo, setMotivo] = useState('')

  const mutation = useMutation({
    mutationFn: () => cardapiosApi.rejeitar(cardapioId, motivo),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cardapio', cardapioId] }); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title="Rejeitar Cardápio" size="sm">
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Motivo da rejeição</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-red-400 resize-none" placeholder="Descreva o motivo..." />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button onClick={() => mutation.mutate()} disabled={!motivo || mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <ThumbsDown className="w-4 h-4" /> Rejeitar
          </button>
        </div>
      </div>
    </Modal>
  )
}

function NutritionBar({ label, value, meta, unit }: { label: string; value: number; meta: number; unit: string }) {
  const pct = Math.min(Math.round((value / meta) * 100), 100)
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs font-medium text-zinc-700">{value.toFixed(0)} / {meta} {unit} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

export function CardapioDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const cardapioId = Number(id)

  const [addModal, setAddModal] = useState<{ open: boolean; dia: DiaSemana; refeicao: TipoRefeicao }>({
    open: false, dia: 'SEGUNDA', refeicao: 'ALMOCO',
  })
  const [validarOpen, setValidarOpen] = useState(false)
  const [rejeitarOpen, setRejeitarOpen] = useState(false)

  const { data: cardapio, isLoading } = useQuery({
    queryKey: ['cardapio', cardapioId],
    queryFn: () => cardapiosApi.buscarPorId(cardapioId),
  })

  const { data: nutricional } = useQuery({
    queryKey: ['cardapio', cardapioId, 'nutricional'],
    queryFn: () => cardapiosApi.resumoNutricional(cardapioId),
    enabled: !!cardapio,
  })

  const removerMutation = useMutation({
    mutationFn: (itemId: number) => cardapiosApi.removerItem(cardapioId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cardapio', cardapioId] }),
  })

  const isEditable = cardapio?.status === 'RASCUNHO'
  const isValidado = cardapio?.status === 'VALIDADO'

  const getItens = (dia: DiaSemana, refeicao: TipoRefeicao): ItemCardapio[] =>
    (cardapio?.itens ?? []).filter((i) => i.diaSemana === dia && i.tipoRefeicao === refeicao)

  const chartData = DIAS.map((dia) => {
    const itens = (cardapio?.itens ?? []).filter((i) => i.diaSemana === dia)
    const calorias = itens.reduce((sum, item) =>
      sum + (item.alimento?.caloriasPor100g ?? 0) * item.quantidadeGramas / 100, 0)
    return { dia: DIA_LABELS[dia], calorias: Math.round(calorias) }
  })

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-zinc-100 rounded w-64" />
        <div className="h-4 bg-zinc-100 rounded w-48" />
        <div className="h-96 bg-zinc-100 rounded-2xl" />
      </div>
    )
  }

  if (!cardapio) {
    return (
      <div className="p-6 text-center text-zinc-400">
        <p>Cardápio não encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-emerald-600">Voltar</button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 transition-colors self-start">
          <ArrowLeft className="w-4 h-4" /> Cardápios
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900">{cardapio.nome}</h1>
            <Badge color={STATUS_COLORS[cardapio.status]}>{STATUS_LABELS[cardapio.status]}</Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">{cardapio.escola?.nome} — Semana {cardapio.semana}/{cardapio.ano}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditable && (
            <button onClick={() => setValidarOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
              <CheckCircle className="w-4 h-4" /> Validar
            </button>
          )}
          {isValidado && (
            <>
              <button onClick={() => setValidarOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
                <ThumbsUp className="w-4 h-4" /> Aprovar
              </button>
              <button onClick={() => setRejeitarOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                <ThumbsDown className="w-4 h-4" /> Rejeitar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grade semanal */}
      <div className="bg-white rounded-2xl beautiful-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-28">Refeição</th>
                {DIAS.map((dia) => (
                  <th key={dia} className="text-left p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {DIA_LABELS[dia]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REFEICOES.map((refeicao, ri) => (
                <tr key={refeicao} className={ri % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'}>
                  <td className="p-4">
                    <span className="text-xs font-semibold text-zinc-500">{REFEICAO_LABELS[refeicao]}</span>
                  </td>
                  {DIAS.map((dia) => {
                    const itens = getItens(dia, refeicao)
                    return (
                      <td key={dia} className="p-2 align-top">
                        <div className={`min-h-[64px] rounded-xl p-2 transition-colors ${
                          itens.length === 0 && isEditable
                            ? 'border-2 border-dashed border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                            : itens.length === 0
                            ? 'border border-zinc-100 bg-zinc-50/30'
                            : 'bg-white border border-zinc-100'
                        }`}>
                          <AnimatePresence>
                            {itens.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-start justify-between gap-1 mb-1 last:mb-0 group/item"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-zinc-800 leading-snug">{item.alimento?.nome}</p>
                                  <p className="text-xs text-zinc-400">{item.quantidadeGramas}g</p>
                                </div>
                                {isEditable && (
                                  <button
                                    onClick={() => removerMutation.mutate(item.id)}
                                    className="opacity-0 group-hover/item:opacity-100 p-0.5 text-zinc-300 hover:text-red-500 transition-all flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {isEditable && (
                            <button
                              onClick={() => setAddModal({ open: true, dia, refeicao })}
                              className={`flex items-center justify-center gap-1 w-full rounded-lg text-xs text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all ${
                                itens.length === 0 ? 'h-10' : 'mt-1 py-1 border-t border-zinc-50'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              {itens.length === 0 && <span>Adicionar</span>}
                            </button>
                          )}
                          {!isEditable && itens.length === 0 && (
                            <span className="text-xs text-zinc-300 flex items-center justify-center h-10">—</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel nutricional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl beautiful-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-zinc-700">Calorias por Dia</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="calorias" name="Calorias (kcal)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl beautiful-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-zinc-700">Cobertura Nutricional (Semanal)</h3>
          </div>
          {nutricional ? (
            <div className="space-y-4">
              <NutritionBar label="Calorias" value={nutricional.caloriasTotais ?? 0} meta={2000} unit="kcal" />
              <NutritionBar label="Proteínas" value={nutricional.proteinasTotais ?? 0} meta={60} unit="g" />
              <NutritionBar label="Carboidratos" value={nutricional.carboidratosTotais ?? 0} meta={250} unit="g" />
              <NutritionBar label="Gorduras" value={nutricional.gordurasTotais ?? 0} meta={65} unit="g" />
            </div>
          ) : (
            <div className="space-y-4">
              {['Calorias', 'Proteínas', 'Carboidratos', 'Gorduras'].map((n) => (
                <div key={n}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-400">{n}</span>
                    <span className="text-xs text-zinc-300">—</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full" />
                </div>
              ))}
              <p className="text-xs text-zinc-400 text-center mt-2">Adicione itens para ver o resumo nutricional</p>
            </div>
          )}
        </div>
      </div>

      <AdicionarItemModal
        open={addModal.open}
        onClose={() => setAddModal((p) => ({ ...p, open: false }))}
        dia={addModal.dia}
        refeicao={addModal.refeicao}
        cardapioId={cardapioId}
      />
      <ValidarModal open={validarOpen} onClose={() => setValidarOpen(false)} cardapioId={cardapioId} />
      <RejeitarModal open={rejeitarOpen} onClose={() => setRejeitarOpen(false)} cardapioId={cardapioId} />
    </div>
  )
}
