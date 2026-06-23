import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, School, Pencil, Trash2, Building2 } from 'lucide-react'
import { escolasApi, type EscolaRequest } from '../api/escolasApi'
import type { Escola } from '../types'
import { StatCard } from '../components/StatCard'
import { DataTable, type Column } from '../components/DataTable'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'

const TIPO_LABELS: Record<string, string> = {
  MUNICIPAL: 'Municipal',
  ESTADUAL: 'Estadual',
  FEDERAL: 'Federal',
  CRECHE: 'Creche',
}

const TIPO_COLORS: Record<string, 'emerald' | 'cyan' | 'amber' | 'blue'> = {
  MUNICIPAL: 'emerald',
  ESTADUAL: 'cyan',
  FEDERAL: 'blue',
  CRECHE: 'amber',
}

const UF_LIST = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const escolaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  tipo: z.enum(['MUNICIPAL', 'ESTADUAL', 'FEDERAL', 'CRECHE']),
  capacidadeAlunos: z.coerce.number().min(1, 'Capacidade deve ser maior que 0'),
  endereco: z.object({
    logradouro: z.string().min(1, 'Logradouro obrigatório'),
    numero: z.string().min(1, 'Número obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
    estado: z.string().length(2, 'UF inválida'),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  }),
})

type EscolaForm = z.infer<typeof escolaSchema>

function EscolaFormModal({
  open,
  onClose,
  escola,
}: {
  open: boolean
  onClose: () => void
  escola: Escola | null
}) {
  const qc = useQueryClient()
  const isEdit = !!escola

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EscolaForm>({
    resolver: zodResolver(escolaSchema) as never,
    defaultValues: escola
      ? {
          nome: escola.nome,
          tipo: escola.tipo,
          capacidadeAlunos: escola.capacidadeAlunos,
          endereco: escola.endereco,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: EscolaRequest) =>
      isEdit ? escolasApi.atualizar(escola!.id, data) : escolasApi.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['escolas'] })
      reset()
      onClose()
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as EscolaRequest)

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-emerald-400'
    }`

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Escola' : 'Nova Escola'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
        {/* Dados básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Nome da Escola</label>
            <input {...register('nome')} className={inputClass(!!errors.nome)} placeholder="Ex: EMEF João da Silva" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Tipo</label>
            <select {...register('tipo')} className={inputClass(!!errors.tipo)}>
              <option value="">Selecione...</option>
              {Object.entries(TIPO_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Capacidade de Alunos</label>
            <input {...register('capacidadeAlunos')} type="number" className={inputClass(!!errors.capacidadeAlunos)} placeholder="500" />
            {errors.capacidadeAlunos && <p className="text-red-500 text-xs mt-1">{errors.capacidadeAlunos.message}</p>}
          </div>
        </div>

        {/* Endereço */}
        <div>
          <p className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
            Endereço
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Logradouro</label>
              <input {...register('endereco.logradouro')} className={inputClass(!!errors.endereco?.logradouro)} placeholder="Rua, Avenida..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Número</label>
              <input {...register('endereco.numero')} className={inputClass(!!errors.endereco?.numero)} placeholder="123" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Complemento</label>
              <input {...register('endereco.complemento')} className={inputClass(false)} placeholder="Apto, Sala..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Bairro</label>
              <input {...register('endereco.bairro')} className={inputClass(!!errors.endereco?.bairro)} placeholder="Centro" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">CEP</label>
              <input {...register('endereco.cep')} className={inputClass(!!errors.endereco?.cep)} placeholder="00000-000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Cidade</label>
              <input {...register('endereco.cidade')} className={inputClass(!!errors.endereco?.cidade)} placeholder="São Paulo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Estado (UF)</label>
              <select {...register('endereco.estado')} className={inputClass(!!errors.endereco?.estado)}>
                <option value="">UF</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        {mutation.error && (
          <p className="text-red-500 text-sm">{String(mutation.error)}</p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Escola'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function Escolas() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editEscola, setEditEscola] = useState<Escola | null>(null)
  const [tipoFilter, setTipoFilter] = useState('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: escolas = [], isLoading } = useQuery({
    queryKey: ['escolas'],
    queryFn: escolasApi.listar,
  })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => escolasApi.desativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escolas'] }),
  })

  const filtered = escolas.filter((e) => {
    const matchNome = !search || e.nome.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipoFilter || e.tipo === tipoFilter
    return matchNome && matchTipo
  })

  const stats = {
    total: escolas.length,
    municipais: escolas.filter((e) => e.tipo === 'MUNICIPAL').length,
    estaduais: escolas.filter((e) => e.tipo === 'ESTADUAL').length,
    creches: escolas.filter((e) => e.tipo === 'CRECHE').length,
  }

  const handleEdit = useCallback((escola: Escola) => {
    setEditEscola(escola)
    setModalOpen(true)
  }, [])

  const handleNew = useCallback(() => {
    setEditEscola(null)
    setModalOpen(true)
  }, [])

  const columns: Column<Escola>[] = [
    {
      key: 'nome',
      header: 'Escola',
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.nome}</p>
          <p className="text-zinc-400 text-xs">{row.endereco?.cidade}/{row.endereco?.estado}</p>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => (
        <Badge color={TIPO_COLORS[row.tipo] ?? 'gray'}>{TIPO_LABELS[row.tipo] ?? row.tipo}</Badge>
      ),
    },
    {
      key: 'capacidade',
      header: 'Capacidade',
      render: (row) => <span>{row.capacidadeAlunos} alunos</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge color={row.ativa ? 'emerald' : 'gray'}>{row.ativa ? 'Ativa' : 'Inativa'}</Badge>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Desativar "${row.nome}"?`)) desativarMutation.mutate(row.id)
            }}
            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-24',
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Escolas"
        description="Gerencie as escolas cadastradas no sistema"
        actions={
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow"
          >
            <Plus className="w-4 h-4" />
            Nova Escola
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Building2, title: 'Total', value: stats.total, color: 'blue' as const, delay: 0 },
          { icon: School, title: 'Municipais', value: stats.municipais, color: 'emerald' as const, delay: 0.05 },
          { icon: School, title: 'Estaduais', value: stats.estaduais, color: 'cyan' as const, delay: 0.1 },
          { icon: School, title: 'Creches', value: stats.creches, color: 'amber' as const, delay: 0.15 },
        ].map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por nome..."
          onSearch={setSearch}
          pageSize={10}
          emptyMessage="Nenhuma escola encontrada"
          filters={
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(TIPO_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          }
        />
      </motion.div>

      {!isLoading && escolas.length === 0 && (
        <EmptyState
          icon={School}
          title="Nenhuma escola cadastrada"
          description="Clique em Nova Escola para começar"
          action={
            <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              <Plus className="w-4 h-4" /> Nova Escola
            </button>
          }
        />
      )}

      <EscolaFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEscola(null) }}
        escola={editEscola}
      />
    </div>
  )
}
