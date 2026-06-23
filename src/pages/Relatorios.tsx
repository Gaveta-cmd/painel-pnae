import { useState, type ElementType } from 'react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import { relatoriosApi } from '../api/relatoriosApi'
import { escolasApi } from '../api/escolasApi'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'

const CORES = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316']

function SectionCard({ title, icon: Icon, children }: { title: string; icon: ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl beautiful-shadow p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function Relatorios() {
  const [escolaId, setEscolaId] = useState('')
  const [mes, setMes] = useState(String(new Date().getMonth() + 1))
  const [ano, setAno] = useState(String(new Date().getFullYear()))

  const { data: escolas = [] } = useQuery({ queryKey: ['escolas', 'ativas'], queryFn: escolasApi.listarAtivas })
  const { data: resumoEscolas } = useQuery({ queryKey: ['rel-escolas'], queryFn: relatoriosApi.escolas })

  const { data: estoqueRel } = useQuery({
    queryKey: ['rel-estoque', escolaId],
    queryFn: () => relatoriosApi.estoqueEscola(Number(escolaId)),
    enabled: !!escolaId,
  })

  const { data: consumoRel } = useQuery({
    queryKey: ['rel-consumo', escolaId, mes, ano],
    queryFn: () => relatoriosApi.consumoEscola(Number(escolaId), Number(mes), Number(ano)),
    enabled: !!escolaId,
  })

  const { data: custoRel } = useQuery({
    queryKey: ['rel-custo', escolaId, mes, ano],
    queryFn: () => relatoriosApi.custoAluno(Number(escolaId), Number(mes), Number(ano)),
    enabled: !!escolaId,
  })

  // Stats resumo de escolas
  const totalAlunos = resumoEscolas?.totalAlunos ?? 0
  const totalEscolas = resumoEscolas?.totalEscolas ?? resumoEscolas?.escolas?.length ?? 0

  // Chart: consumo por alimento (se vier como array)
  const consumoData = Array.isArray(consumoRel)
    ? consumoRel.slice(0, 10).map((c: { alimento?: string; nome?: string; quantidadeKg?: number; totalKg?: number }) => ({
        name: c.alimento ?? c.nome ?? 'Item',
        kg: Number((c.quantidadeKg ?? c.totalKg ?? 0).toFixed(2)),
      }))
    : []

  // Chart: estoque por categoria
  const estoqueData = Array.isArray(estoqueRel?.itens ?? estoqueRel)
    ? (estoqueRel?.itens ?? estoqueRel ?? []).reduce((acc: Record<string, number>, item: { alimento?: { categoria?: string }; quantidadeKg?: number }) => {
        const cat = item.alimento?.categoria ?? 'Outros'
        acc[cat] = (acc[cat] ?? 0) + (item.quantidadeKg ?? 0)
        return acc
      }, {} as Record<string, number>)
    : {}

  const estoquePieData = Object.entries(estoqueData).map(([name, value]) => ({
    name,
    value: Number((value as number).toFixed(2)),
  }))

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Relatórios" description="Análises e indicadores do sistema PNAE" />

      {/* Filtros globais */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl beautiful-shadow">
        <select value={escolaId} onChange={(e) => setEscolaId(e.target.value)}
          className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 min-w-48">
          <option value="">Todas as escolas</option>
          {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select value={mes} onChange={(e) => setMes(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400">
          {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={ano} onChange={(e) => setAno(e.target.value)} className="text-sm border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stats gerais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} title="Total de Escolas" value={totalEscolas} color="blue" delay={0} />
        <StatCard icon={BarChart3} title="Total de Alunos" value={totalAlunos} color="emerald" delay={0.05} />
        <StatCard icon={DollarSign} title="Custo/Aluno" value={custoRel?.custoMedio ? `R$ ${Number(custoRel.custoMedio).toFixed(2)}` : '—'} color="amber" delay={0.1} />
        <StatCard icon={Package} title="Itens no Estoque" value={estoqueRel?.totalItens ?? (Array.isArray(estoqueRel) ? estoqueRel.length : '—')} color="cyan" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumo mensal */}
        <SectionCard title="Consumo por Alimento (kg)" icon={TrendingUp}>
          {consumoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={consumoData} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="kg" name="Consumo (kg)" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-300 text-sm">
              {escolaId ? 'Sem dados para o período' : 'Selecione uma escola'}
            </div>
          )}
        </SectionCard>

        {/* Estoque por categoria */}
        <SectionCard title="Estoque por Categoria (kg)" icon={Package}>
          {estoquePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={estoquePieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {estoquePieData.map((_entry, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kg`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-300 text-sm">
              {escolaId ? 'Sem itens em estoque' : 'Selecione uma escola'}
            </div>
          )}
        </SectionCard>

        {/* Custo por aluno — linha */}
        <SectionCard title="Custo por Aluno" icon={DollarSign}>
          {custoRel && Array.isArray(custoRel.historico) && custoRel.historico.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={custoRel.historico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, 'Custo/Aluno']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="custo" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-3">
              {custoRel && (
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-zinc-500 mb-1">Custo médio por aluno no período</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {custoRel.custoMedio ? `R$ ${Number(custoRel.custoMedio).toFixed(2)}` : '—'}
                  </p>
                  {custoRel.totalAlunos && (
                    <p className="text-xs text-zinc-400 mt-1">{custoRel.totalAlunos} alunos atendidos</p>
                  )}
                </div>
              )}
              {!custoRel && (
                <div className="h-32 flex items-center justify-center text-zinc-300 text-sm">
                  {escolaId ? 'Sem dados para o período' : 'Selecione uma escola'}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Resumo geral por escola */}
        <SectionCard title="Resumo Geral por Escola" icon={BarChart3}>
          {resumoEscolas?.escolas && resumoEscolas.escolas.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={resumoEscolas.escolas.slice(0, 6)} barSize={18}>
                <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="totalAlunos" name="Alunos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-zinc-300 text-sm">Carregando dados...</div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
