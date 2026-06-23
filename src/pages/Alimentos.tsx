import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, Apple, Pencil, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { alimentosApi, type AlimentoRequest } from '../api/alimentosApi'
import type { Alimento, CategoriaAlimento } from '../types'
import { StatCard } from '../components/StatCard'
import { DataTable, type Column } from '../components/DataTable'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'

const CATEGORIA_LABELS: Record<CategoriaAlimento, string> = {
  CEREAL: 'Cereal',
  LEGUMINOSA: 'Leguminosa',
  FRUTA: 'Fruta',
  HORTALICA: 'Hortaliça',
  LEITE_DERIVADO: 'Leite/Derivado',
  CARNE: 'Carne',
  OVOS: 'Ovos',
  GORDURA: 'Gordura',
  ACUCAR: 'Açúcar',
  OUTROS: 'Outros',
}

const CATEGORIA_COLORS: Record<CategoriaAlimento, string> = {
  CEREAL: '#f59e0b',
  LEGUMINOSA: '#84cc16',
  FRUTA: '#f97316',
  HORTALICA: '#10b981',
  LEITE_DERIVADO: '#06b6d4',
  CARNE: '#ef4444',
  OVOS: '#eab308',
  GORDURA: '#8b5cf6',
  ACUCAR: '#ec4899',
  OUTROS: '#6b7280',
}

const CATEGORIA_BADGE: Record<CategoriaAlimento, 'amber' | 'emerald' | 'orange' | 'cyan' | 'red' | 'gray' | 'purple'> = {
  CEREAL: 'amber',
  LEGUMINOSA: 'emerald',
  FRUTA: 'orange',
  HORTALICA: 'emerald',
  LEITE_DERIVADO: 'cyan',
  CARNE: 'red',
  OVOS: 'amber',
  GORDURA: 'purple',
  ACUCAR: 'orange',
  OUTROS: 'gray',
}

const alimentoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  caloriasPor100g: z.coerce.number().min(0),
  proteinasPor100g: z.coerce.number().min(0),
  carboidratosPor100g: z.coerce.number().min(0),
  gordurasPor100g: z.coerce.number().min(0),
  fibrasPor100g: z.coerce.number().min(0).optional(),
  calcioPor100g: z.coerce.number().min(0).optional(),
  ferroPor100g: z.coerce.number().min(0).optional(),
  custoPorKg: z.coerce.number().min(0).optional(),
})

type AlimentoFormData = z.infer<typeof alimentoSchema>

function AlimentoFormModal({ open, onClose, alimento }: { open: boolean; onClose: () => void; alimento: Alimento | null }) {
  const qc = useQueryClient()
  const isEdit = !!alimento

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlimentoFormData>({
    resolver: zodResolver(alimentoSchema) as never,
    defaultValues: alimento ?? {},
  })

  const mutation = useMutation({
    mutationFn: (data: AlimentoRequest) =>
      isEdit ? alimentosApi.atualizar(alimento!.id, data) : alimentosApi.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alimentos'] }); reset(); onClose() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as AlimentoRequest)

  const inputClass = (err: boolean) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${err ? 'border-red-300' : 'border-zinc-200 focus:border-emerald-400'}`

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Alimento' : 'Novo Alimento'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Nome do Alimento</label>
            <input {...register('nome')} className={inputClass(!!errors.nome)} placeholder="Ex: Arroz integral" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Categoria</label>
            <select {...register('categoria')} className={inputClass(!!errors.categoria)}>
              <option value="">Selecione...</option>
              {Object.entries(CATEGORIA_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Custo/kg (R$)</label>
            <input {...register('custoPorKg')} type="number" step="0.01" className={inputClass(false)} placeholder="0.00" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
            Informação Nutricional (por 100g)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'caloriasPor100g', label: 'Calorias (kcal)', err: !!errors.caloriasPor100g },
              { name: 'proteinasPor100g', label: 'Proteínas (g)', err: !!errors.proteinasPor100g },
              { name: 'carboidratosPor100g', label: 'Carboidratos (g)', err: !!errors.carboidratosPor100g },
              { name: 'gordurasPor100g', label: 'Gorduras (g)', err: !!errors.gordurasPor100g },
              { name: 'fibrasPor100g', label: 'Fibras (g)', err: false },
              { name: 'calcioPor100g', label: 'Cálcio (mg)', err: false },
              { name: 'ferroPor100g', label: 'Ferro (mg)', err: false },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">{field.label}</label>
                <input
                  {...register(field.name as keyof AlimentoFormData)}
                  type="number"
                  step="0.01"
                  className={inputClass(field.err)}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function Alimentos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editAlimento, setEditAlimento] = useState<Alimento | null>(null)
  const [catFilter, setCatFilter] = useState('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: alimentos = [], isLoading } = useQuery({ queryKey: ['alimentos'], queryFn: alimentosApi.listar })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => alimentosApi.desativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alimentos'] }),
  })

  const filtered = alimentos.filter((a) => {
    const matchNome = !search || a.nome.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || a.categoria === catFilter
    return matchNome && matchCat
  })

  // Donut chart por categoria
  const chartData = Object.entries(CATEGORIA_LABELS).map(([key, name]) => ({
    name,
    key,
    value: alimentos.filter((a) => a.categoria === key).length,
    color: CATEGORIA_COLORS[key as CategoriaAlimento],
  })).filter((d) => d.value > 0)

  const columns: Column<Alimento>[] = [
    {
      key: 'nome',
      header: 'Alimento',
      render: (row) => <span className="font-medium text-zinc-900">{row.nome}</span>,
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (row) => <Badge color={CATEGORIA_BADGE[row.categoria] ?? 'gray'}>{CATEGORIA_LABELS[row.categoria]}</Badge>,
    },
    {
      key: 'calorias',
      header: 'Calorias',
      render: (row) => <span>{row.caloriasPor100g?.toFixed(0)} kcal</span>,
    },
    {
      key: 'proteinas',
      header: 'Proteínas',
      render: (row) => <span>{row.proteinasPor100g?.toFixed(1)} g</span>,
    },
    {
      key: 'custo',
      header: 'Custo/kg',
      render: (row) => <span>{row.custoPorKg ? `R$ ${row.custoPorKg.toFixed(2)}` : '—'}</span>,
    },
    {
      key: 'acoes',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => { setEditAlimento(row); setModalOpen(true) }} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => { if (confirm(`Desativar "${row.nome}"?`)) desativarMutation.mutate(row.id) }} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
        title="Alimentos"
        description="Cadastro e informações nutricionais"
        actions={
          <button onClick={() => { setEditAlimento(null); setModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow">
            <Plus className="w-4 h-4" /> Novo Alimento
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Apple} title="Total de Alimentos" value={alimentos.length} color="emerald" />
        {chartData.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-2xl beautiful-shadow p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Distribuição por Categoria</p>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} dataKey="value" paddingAngle={2}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [v, p.payload.name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
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
          filters={
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400">
              <option value="">Todas as categorias</option>
              {Object.entries(CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          }
        />
      </motion.div>

      <AlimentoFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditAlimento(null) }} alimento={editAlimento} />
    </div>
  )
}
