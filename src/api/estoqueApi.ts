import api from './axios'
import type { EstoqueItem, MovimentacaoEstoque } from '../types'

export interface EntradaRequest {
  alimentoId: number
  escolaId: number
  fornecedorId?: number
  quantidadeKg: number
  lote?: string
  dataValidade: string
  custoPorKg?: number
}

export interface MovimentacaoRequest {
  quantidadeKg: number
  motivo?: string
}

export const estoqueApi = {
  entrada: (data: EntradaRequest) => api.post<EstoqueItem>('/api/estoque/entrada', data).then((r) => r.data),
  saida: (id: number, data: MovimentacaoRequest) => api.post(`/api/estoque/${id}/saida`, data).then((r) => r.data),
  perda: (id: number, data: MovimentacaoRequest) => api.post(`/api/estoque/${id}/perda`, data).then((r) => r.data),
  listarPorEscola: (escolaId: number) => api.get<EstoqueItem[]>(`/api/estoque/escola/${escolaId}`).then((r) => r.data),
  listarVencidos: (escolaId: number) => api.get<EstoqueItem[]>(`/api/estoque/escola/${escolaId}/vencidos`).then((r) => r.data),
  alertasVencimento: (escolaId: number, dias = 7) =>
    api.get<EstoqueItem[]>(`/api/estoque/escola/${escolaId}/alertas?dias=${dias}`).then((r) => r.data),
  movimentacoes: (id: number) => api.get<MovimentacaoEstoque[]>(`/api/estoque/${id}/movimentacoes`).then((r) => r.data),
}
