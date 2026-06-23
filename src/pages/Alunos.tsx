import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'
import { alunosApi, type AlunoRequest } from '../api/alunosApi'
import { escolasApi } from '../api/escolasApi'
import type { Aluno } from '../types'
import { StatCard } from '../components/StatCard'
import { DataTable, type Column } from '../components/DataTable'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const FAIXA_LABELS: Record<string, string> = {
  CRECHE_1: 'Creche 0-1',
  CRECHE_2: 'Creche 1-3',
  PRE_ESCOLA: 'Pré-escola',
  FUNDAMENTAL_1: 'Fundamental I',
  FUNDAMENTAL_2: 'Fundamental II',
  MEDIO: 'Ensino Médio',
  EJA: 'EJA',
}

const FAIXA_COLORS: Record<string, 'purple' | 'blue' | 'emerald' | 'cyan' | 'amber' | 'orange'> = {
  CRECHE_1: 'purple',
  CRECHE_2: 'purple',
  PRE_ESCOLA: 'blue',
  FUNDAMENTAL_1: 'emerald',
  FUNDAMENTAL_2: 'cyan',
  MEDIO: 'amber',
  EJA: 'orange',
}

const CHART_COLORS: Record<string, string> = {
  CRECHE_1: '#9333ea',
  CRECHE_2: '#a855f7',
  PRE_ESCOLA: '#3b82f6',
  FUNDAMENTAL_1: '#10b981',
  FUNDAMENTAL_2: '#06b6d4',
  MEDIO: '#f59e0b',
  EJA: '#f97316',
}

const alunoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  dataNascimento: z.string().min(1, 'Data obrigatória'),
  matricula: z.string().min(1, 'Matrícula obrigatória'),
  cpf: z.string().optional(),
  escolaId: z.coerce.number().min(1, 'Escola obrigatória'),
})

type AlunoFormData = z.infer<typeof alunoSchema>

function AlunoFormModal({
  open,
  onClose,
  aluno,
}: {
  open: boolean
  onClose: () => void
  aluno: Aluno | null
}) {
  const qc = useQueryClient()
  const isEdit = !!aluno

  const { data: escolas = [] } = useQuery({
    queryKey: ['escolas', 'ativas'],
    queryFn: escolasApi.listarAtivas,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema) as never,
    defaultValues: aluno
      ? {
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento?.slice(0, 10),
          matricula: aluno.matricula,
          cpf: aluno.cpf,
          escolaId: aluno.escola.id,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: AlunoRequest) =>
      isEdit ? alunosApi.atualizar(aluno!.id, data) : alunosApi.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alunos'] })
      reset()
      onClose()
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as AlunoRequest)

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-emerald-400'
    }`

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Aluno' : 'Novo Aluno'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Nome completo</label>
          <input {...register('nome')} className={inputClass(!!errors.nome)} placeholder="Maria da Silva" />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Data de Nascimento</label>
            <input {...register('dataNascimento')} type="date" className={inputClass(!!errors.dataNascimento)} />
            {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Matrícula</label>
            <input {...register('matricula')} className={inputClass(!!errors.matricula)} placeholder="2024001" />
            {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Escola</label>
          <select {...register('escolaId')} className={inputClass(!!errors.escolaId)}>
            <option value="">Selecione a escola...</option>
            {escolas.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
          {errors.escolaId && <p className="text-red-500 text-xs mt-1">{errors.escolaId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">CPF (opcional)</label>
          <input {...register('cpf')} className={inputClass(false)} placeholder="000.000.000-00" />
        </div>

        {mutation.error && <p className="text-red-500 text-sm">{String(mutation.error)}</p>}

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
            {isEdit ? 'Salvar' : 'Matricular'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function Alunos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editAluno, setEditAluno] = useState<Aluno | null>(null)
  const [escolaFilter, setEscolaFilter] = useState('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: alunosApi.listar,
  })

  const { data: escolas = [] } = useQuery({
    queryKey: ['escolas', 'ativas'],
    queryFn: escolasApi.listarAtivas,
  })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => alunosApi.desativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alunos'] }),
  })

  const filtered = alunos.filter((a) => {
    const matchNome = !search || a.nome.toLowerCase().includes(search.toLowerCase())
    const matchEscola = !escolaFilter || String(a.escola?.id) === escolaFilter
    return matchNome && matchEscola
  })

  // Chart data por faixa etária
  const faixaData = Object.entries(FAIXA_LABELS).map(([key, label]) => ({
    faixa: label.split(' ').slice(0, 1).join(''),
    key,
    total: alunos.filter((a) => a.faixaEtaria === key).length,
  })).filter((d) => d.total > 0)

  const columns: Column<Aluno>[] = [
    {
      key: 'nome',
      header: 'Aluno',
      render: (row) => <span className="font-medium text-zinc-900">{row.nome}</span>,
    },
    {
      key: 'matricula',
      header: 'Matrícula',
      render: (row) => <span className="font-mono text-zinc-600">{row.matricula}</span>,
    },
    {
      key: 'nascimento',
      header: 'Nascimento',
      render: (row) => (
        <span>{row.dataNascimento ? new Date(row.dataNascimento).toLocaleDateString('pt-BR') : '-'}</span>
      ),
    },
    {
      key: 'faixa',
      header: 'Faixa Etária',
      render: (row) => (
        <Badge color={FAIXA_COLORS[row.faixaEtaria] ?? 'gray'}>
          {FAIXA_LABELS[row.faixaEtaria] ?? row.faixaEtaria}
        </Badge>
      ),
    },
    {
      key: 'escola',
      header: 'Escola',
      render: (row) => <span className="text-zinc-500">{row.escola?.nome ?? '-'}</span>,
    },
    {
      key: 'acoes',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => { setEditAluno(row); setModalOpen(true) }}
            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => { if (confirm(`Desativar "${row.nome}"?`)) desativarMutation.mutate(row.id) }}
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
        title="Alunos"
        description="Gerencie os alunos matriculados"
        actions={
          <button
            onClick={() => { setEditAluno(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow"
          >
            <Plus className="w-4 h-4" /> Novo Aluno
          </button>
        }
      />

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} title="Total de Alunos" value={alunos.length} color="emerald" />
        {faixaData.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-2xl beautiful-shadow p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Distribuição por Faixa Etária</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={faixaData} barSize={20}>
                <XAxis dataKey="faixa" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value, _name, props) => [value, FAIXA_LABELS[props.payload.key]]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {faixaData.map((entry) => (
                    <Cell key={entry.key} fill={CHART_COLORS[entry.key] ?? '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por nome..."
          onSearch={setSearch}
          pageSize={10}
          emptyMessage="Nenhum aluno encontrado"
          filters={
            <select
              value={escolaFilter}
              onChange={(e) => setEscolaFilter(e.target.value)}
              className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400"
            >
              <option value="">Todas as escolas</option>
              {escolas.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          }
        />
      </motion.div>

      <AlunoFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditAluno(null) }}
        aluno={editAluno}
      />
    </div>
  )
}
