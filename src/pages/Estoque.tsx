import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Package, AlertTriangle, TrendingDown, History, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { estoqueApi, type EntradaRequest, type MovimentacaoRequest } from '../api/estoqueApi'
import { escolasApi } from '../api/escolasApi'
import { alimentosApi } from '../api/alimentosApi'
import { fornecedoresApi } from '../api/fornecedoresApi'
import type { EstoqueItem, MovimentacaoEstoque } from '../types'
import { StatCard } from '../components/StatCard'
import { DataTable, type Column } from '../components/DataTable'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'

const entradaSchema = z.object({
  alimentoId: z.coerce.number().min(1, 'Alimento obrigatório'),
  escolaId: z.coerce.number().min(1, 'Escola obrigatória'),
  fornecedorId: z.coerce.number().optional(),
  quantidadeKg: z.coerce.number().min(0.001, 'Quantidade obrigatória'),
  lote: z.string().optional(),
  dataValidade: z.string().min(1, 'Data de validade obrigatória'),
  custoPorKg: z.coerce.number().optional(),
})
type EntradaForm = z.infer<typeof entradaSchema>

const movSchema = z.object({
  quantidadeKg: z.coerce.number().min(0.001, 'Quantidade obrigatória'),
  motivo: z.string().optional(),
})
type MovForm = z.infer<typeof movSchema>

function EntradaModal({ open, onClose, escolaIdInicial }: { open: boolean; onClose: () => void; escolaIdInicial: string }) {
  const qc = useQueryClient()
  const { data: escolas = [] } = useQuery({ queryKey: ['escolas', 'ativas'], queryFn: escolasApi.listarAtivas })
  const { data: alimentos = [] } = useQuery({ queryKey: ['alimentos', 'ativos'], queryFn: alimentosApi.listarAtivos })
  const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: fornecedoresApi.listar })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EntradaForm>({
    resolver: zodResolver(entradaSchema) as never,
    defaultValues: { escolaId: Number(escolaIdInicial) || undefined },
  })

  const mutation = useMutation({
    mutationFn: (data: EntradaRequest) => estoqueApi.entrada(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['estoque'] }); reset(); onClose() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as EntradaRequest)
  const ic = (err: boolean) => `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${err ? 'border-red-300' : 'border-zinc-200 focus:border-emerald-400'}`

  return (
    <Modal open={open} onClose={onClose} title="Registrar Entrada" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Escola</label>
            <select {...register('escolaId')} className={ic(!!errors.escolaId)}>
              <option value="">Selecione...</option>
              {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
            {errors.escolaId && <p className="text-red-500 text-xs mt-1">{errors.escolaId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Alimento</label>
            <select {...register('alimentoId')} className={ic(!!errors.alimentoId)}>
              <option value="">Selecione...</option>
              {alimentos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
            {errors.alimentoId && <p className="text-red-500 text-xs mt-1">{errors.alimentoId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Quantidade (kg)</label>
            <input {...register('quantidadeKg')} type="number" step="0.001" className={ic(!!errors.quantidadeKg)} placeholder="10.000" />
            {errors.quantidadeKg && <p className="text-red-500 text-xs mt-1">{errors.quantidadeKg.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Data de Validade</label>
            <input {...register('dataValidade')} type="date" className={ic(!!errors.dataValidade)} />
            {errors.dataValidade && <p className="text-red-500 text-xs mt-1">{errors.dataValidade.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Fornecedor (opcional)</label>
            <select {...register('fornecedorId')} className={ic(false)}>
              <option value="">Sem fornecedor</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Lote (opcional)</label>
            <input {...register('lote')} className={ic(false)} placeholder="LOT-2024-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Custo/kg (R$)</label>
            <input {...register('custoPorKg')} type="number" step="0.01" className={ic(false)} placeholder="0.00" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <ArrowUpCircle className="w-4 h-4" /> Registrar Entrada
          </button>
        </div>
      </form>
    </Modal>
  )
}

function MovModal({ open, onClose, item, tipo }: { open: boolean; onClose: () => void; item: EstoqueItem; tipo: 'saida' | 'perda' }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovForm>({
    resolver: zodResolver(movSchema) as never,
  })

  const mutation = useMutation({
    mutationFn: (data: MovimentacaoRequest) =>
      tipo === 'saida' ? estoqueApi.saida(item.id, data) : estoqueApi.perda(item.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['estoque'] }); reset(); onClose() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as MovimentacaoRequest)

  return (
    <Modal open={open} onClose={onClose} title={tipo === 'saida' ? 'Registrar Saída' : 'Registrar Perda'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
        <div className="p-3 bg-zinc-50 rounded-xl">
          <p className="text-sm font-medium text-zinc-700">{item.alimento?.nome}</p>
          <p className="text-xs text-zinc-400">Disponível: {item.quantidadeKg?.toFixed(3)} kg</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Quantidade (kg)</label>
          <input {...register('quantidadeKg')} type="number" step="0.001" className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400" placeholder="0.000" />
          {errors.quantidadeKg && <p className="text-red-500 text-xs mt-1">{errors.quantidadeKg.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Motivo {tipo === 'perda' ? '' : '(opcional)'}</label>
          <input {...register('motivo')} className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400" placeholder={tipo === 'perda' ? 'Ex: Vencimento, dano...' : 'Ex: Preparo do almoço'} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2 ${tipo === 'saida' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {tipo === 'saida' ? <><ArrowDownCircle className="w-4 h-4" /> Saída</> : <><AlertTriangle className="w-4 h-4" /> Perda</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function HistoricoDrawer({ item, onClose }: { item: EstoqueItem | null; onClose: () => void }) {
  const { data: movs = [], isLoading } = useQuery({
    queryKey: ['movimentacoes', item?.id],
    queryFn: () => estoqueApi.movimentacoes(item!.id),
    enabled: !!item,
  })

  const TIPO_CONFIG = {
    ENTRADA: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ArrowUpCircle },
    SAIDA: { color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowDownCircle },
    PERDA: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
  }

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h3 className="font-semibold text-zinc-900">Histórico</h3>
                <p className="text-xs text-zinc-400">{item.alimento?.nome}</p>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : movs.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma movimentação</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movs.map((m: MovimentacaoEstoque) => {
                    const cfg = TIPO_CONFIG[m.tipo]
                    const Icon = cfg.icon
                    return (
                      <div key={m.id} className={`flex items-start gap-3 p-3 rounded-xl ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className={`text-xs font-semibold ${cfg.color}`}>{m.tipo}</span>
                            <span className="text-xs text-zinc-500">{m.quantidadeKg?.toFixed(3)} kg</span>
                          </div>
                          {m.motivo && <p className="text-xs text-zinc-500 mt-0.5 truncate">{m.motivo}</p>}
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {m.dataMovimentacao ? new Date(m.dataMovimentacao).toLocaleDateString('pt-BR') : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function Estoque() {
  const [escolaFilter, setEscolaFilter] = useState('')
  const [entradaOpen, setEntradaOpen] = useState(false)
  const [movModal, setMovModal] = useState<{ item: EstoqueItem; tipo: 'saida' | 'perda' } | null>(null)
  const [historicoItem, setHistoricoItem] = useState<EstoqueItem | null>(null)
  const qc = useQueryClient()

  const { data: escolas = [] } = useQuery({ queryKey: ['escolas', 'ativas'], queryFn: escolasApi.listarAtivas })

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ['estoque', escolaFilter],
    queryFn: () => escolaFilter ? estoqueApi.listarPorEscola(Number(escolaFilter)) : Promise.resolve([] as EstoqueItem[]),
    enabled: !!escolaFilter,
  })

  const { data: alertas = [] } = useQuery({
    queryKey: ['estoque', escolaFilter, 'alertas'],
    queryFn: () => estoqueApi.alertasVencimento(Number(escolaFilter), 7),
    enabled: !!escolaFilter,
  })

  const today = new Date()
  const vencidos = itens.filter((i) => new Date(i.dataValidade) < today)
  const aVencer = alertas.length

  const rowClass = (row: EstoqueItem) => {
    const validade = new Date(row.dataValidade)
    if (validade < today) return 'bg-red-50'
    const diff = (validade.getTime() - today.getTime()) / 86400000
    if (diff <= 7) return 'bg-amber-50'
    return ''
  }

  const columns: Column<EstoqueItem>[] = [
    {
      key: 'alimento',
      header: 'Alimento',
      render: (row) => <span className="font-medium text-zinc-900">{row.alimento?.nome}</span>,
    },
    {
      key: 'quantidade',
      header: 'Quantidade',
      render: (row) => <span className="font-mono">{row.quantidadeKg?.toFixed(3)} kg</span>,
    },
    {
      key: 'validade',
      header: 'Validade',
      render: (row) => {
        const validade = new Date(row.dataValidade)
        const vencido = validade < today
        const diff = (validade.getTime() - today.getTime()) / 86400000
        return (
          <div className="flex items-center gap-2">
            <span className={vencido ? 'text-red-600 font-medium' : diff <= 7 ? 'text-amber-600 font-medium' : 'text-zinc-600'}>
              {validade.toLocaleDateString('pt-BR')}
            </span>
            {vencido && <Badge color="red">Vencido</Badge>}
            {!vencido && diff <= 7 && <Badge color="amber">A vencer</Badge>}
          </div>
        )
      },
    },
    {
      key: 'lote',
      header: 'Lote',
      render: (row) => <span className="text-zinc-500 font-mono text-xs">{row.lote ?? '—'}</span>,
    },
    {
      key: 'fornecedor',
      header: 'Fornecedor',
      render: (row) => <span className="text-zinc-500 text-xs">{row.fornecedor?.razaoSocial ?? '—'}</span>,
    },
    {
      key: 'acoes',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => setMovModal({ item: row, tipo: 'saida' })} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Saída">
            <ArrowDownCircle className="w-4 h-4" />
          </button>
          <button onClick={() => setMovModal({ item: row, tipo: 'perda' })} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Perda">
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button onClick={() => setHistoricoItem(row)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all" title="Histórico">
            <History className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-28',
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Estoque"
        description="Controle de itens alimentícios"
        actions={
          <button onClick={() => setEntradaOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow">
            <Plus className="w-4 h-4" /> Nova Entrada
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} title="Total no Estoque" value={itens.length} color="blue" delay={0} />
        <StatCard icon={AlertTriangle} title="Vencidos" value={vencidos.length} color="red" delay={0.05} />
        <StatCard icon={AlertTriangle} title="A Vencer (7d)" value={aVencer} color="amber" delay={0.1} />
        <StatCard icon={TrendingDown} title="Alertas" value={vencidos.length + aVencer} color="purple" delay={0.15} />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable
          columns={columns}
          data={itens}
          isLoading={isLoading}
          emptyMessage="Nenhum item no estoque"
          getRowClassName={rowClass}
          filters={
            <select value={escolaFilter} onChange={(e) => { setEscolaFilter(e.target.value); qc.invalidateQueries({ queryKey: ['estoque'] }) }}
              className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 min-w-48">
              <option value="">Selecione uma escola...</option>
              {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          }
        />
      </motion.div>

      {!escolaFilter && (
        <div className="text-center py-16 text-zinc-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione uma escola para ver o estoque</p>
        </div>
      )}

      <EntradaModal open={entradaOpen} onClose={() => setEntradaOpen(false)} escolaIdInicial={escolaFilter} />
      {movModal && (
        <MovModal open item={movModal.item} tipo={movModal.tipo} onClose={() => setMovModal(null)} />
      )}
      <HistoricoDrawer item={historicoItem} onClose={() => setHistoricoItem(null)} />
    </div>
  )
}
