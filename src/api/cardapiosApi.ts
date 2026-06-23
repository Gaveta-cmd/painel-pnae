import api from './axios'
import type { Cardapio, DiaSemana, TipoRefeicao } from '../types'

export interface CardapioRequest {
  nome: string
  escolaId: number
  semana: number
  ano: number
}

export interface ItemCardapioRequest {
  alimentoId: number
  diaSemana: DiaSemana
  tipoRefeicao: TipoRefeicao
  quantidadeGramas: number
}

export const cardapiosApi = {
  criar: (data: CardapioRequest) => api.post<Cardapio>('/api/cardapios', data).then((r) => r.data),
  buscarPorId: (id: number) => api.get<Cardapio>(`/api/cardapios/${id}`).then((r) => r.data),
  listarPorEscola: (escolaId: number) => api.get<Cardapio[]>(`/api/cardapios/escola/${escolaId}`).then((r) => r.data),
  adicionarItem: (id: number, data: ItemCardapioRequest) => api.post(`/api/cardapios/${id}/itens`, data).then((r) => r.data),
  removerItem: (cardapioId: number, itemId: number) => api.delete(`/api/cardapios/${cardapioId}/itens/${itemId}`),
  resumoNutricional: (id: number) => api.get(`/api/cardapios/${id}/nutricional`).then((r) => r.data),
  validar: (id: number, faixa: string) =>
    api.post(`/api/cardapios/${id}/validar?faixa=${faixa}`).then((r) => r.data),
  validarEscola: (id: number) => api.post(`/api/cardapios/${id}/validar-escola`).then((r) => r.data),
  aprovar: (id: number) => api.patch(`/api/cardapios/${id}/aprovar`).then((r) => r.data),
  rejeitar: (id: number, motivo: string) => api.patch(`/api/cardapios/${id}/rejeitar`, { motivo }).then((r) => r.data),
}
