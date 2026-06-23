import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, Truck, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { fornecedoresApi, type FornecedorRequest } from '../api/fornecedoresApi'
import type { Fornecedor } from '../types'
import { StatCard } from '../components/StatCard'
import { DataTable, type Column } from '../components/DataTable'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'

const UF_LIST = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const fornSchema = z.object({
  razaoSocial: z.string().min(2, 'Razão social obrigatória'),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.object({
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
  }).optional(),
})
type FornForm = z.infer<typeof fornSchema>

function FornecedorModal({ open, onClose, fornecedor }: { open: boolean; onClose: () => void; fornecedor: Fornecedor | null }) {
  const qc = useQueryClient()
  const isEdit = !!fornecedor

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FornForm>({
    resolver: zodResolver(fornSchema) as never,
    defaultValues: fornecedor
      ? { razaoSocial: fornecedor.razaoSocial, cnpj: fornecedor.cnpj, email: fornecedor.email, telefone: fornecedor.telefone, endereco: fornecedor.endereco }
      : {},
  })

  const mutation = useMutation({
    mutationFn: (data: FornecedorRequest) =>
      isEdit ? fornecedoresApi.atualizar(fornecedor!.id, data) : fornecedoresApi.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fornecedores'] }); reset(); onClose() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => mutation.mutate(data as FornecedorRequest)
  const ic = (err: boolean) => `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none transition-colors ${err ? 'border-red-300' : 'border-zinc-200 focus:border-emerald-400'}`

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Razão Social</label>
            <input {...register('razaoSocial')} className={ic(!!errors.razaoSocial)} placeholder="Distribuidora..." />
            {errors.razaoSocial && <p className="text-red-500 text-xs mt-1">{errors.razaoSocial.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">CNPJ</label>
            <input {...register('cnpj')} className={ic(false)} placeholder="00.000.000/0001-00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">E-mail</label>
            <input {...register('email')} type="email" className={ic(!!errors.email)} placeholder="contato@empresa.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Telefone</label>
            <input {...register('telefone')} className={ic(false)} placeholder="(11) 99999-9999" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
            Endereço (opcional)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Logradouro</label>
              <input {...register('endereco.logradouro')} className={ic(false)} placeholder="Rua..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Número</label>
              <input {...register('endereco.numero')} className={ic(false)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">CEP</label>
              <input {...register('endereco.cep')} className={ic(false)} placeholder="00000-000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Cidade</label>
              <input {...register('endereco.cidade')} className={ic(false)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">UF</label>
              <select {...register('endereco.estado')} className={ic(false)}>
                <option value="">UF</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {mutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function Fornecedores() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editForn, setEditForn] = useState<Fornecedor | null>(null)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: fornecedores = [], isLoading } = useQuery({ queryKey: ['fornecedores'], queryFn: fornecedoresApi.listar })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => fornecedoresApi.desativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fornecedores'] }),
  })

  const filtered = fornecedores.filter((f) =>
    !search || f.razaoSocial.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<Fornecedor>[] = [
    {
      key: 'razao',
      header: 'Fornecedor',
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.razaoSocial}</p>
          {row.cnpj && <p className="text-xs text-zinc-400 font-mono">{row.cnpj}</p>}
        </div>
      ),
    },
    {
      key: 'contato',
      header: 'Contato',
      render: (row) => (
        <div className="space-y-0.5">
          {row.email && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Mail className="w-3 h-3" /> {row.email}
            </div>
          )}
          {row.telefone && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Phone className="w-3 h-3" /> {row.telefone}
            </div>
          )}
          {!row.email && !row.telefone && <span className="text-zinc-300 text-xs">—</span>}
        </div>
      ),
    },
    {
      key: 'cidade',
      header: 'Cidade/UF',
      render: (row) => (
        <span className="text-zinc-500 text-sm">
          {row.endereco ? `${row.endereco.cidade}/${row.endereco.estado}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge color={row.ativo ? 'emerald' : 'gray'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      key: 'acoes',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => { setEditForn(row); setModalOpen(true) }} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => { if (confirm(`Desativar "${row.razaoSocial}"?`)) desativarMutation.mutate(row.id) }} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
        title="Fornecedores"
        description="Cadastro de fornecedores de alimentos"
        actions={
          <button onClick={() => { setEditForn(null); setModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors beautiful-shadow">
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Truck} title="Total" value={fornecedores.length} color="blue" delay={0} />
        <StatCard icon={Truck} title="Ativos" value={fornecedores.filter((f) => f.ativo).length} color="emerald" delay={0.05} />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por razão social..."
          onSearch={setSearch}
        />
      </motion.div>

      <FornecedorModal open={modalOpen} onClose={() => { setModalOpen(false); setEditForn(null) }} fornecedor={editForn} />
    </div>
  )
}
