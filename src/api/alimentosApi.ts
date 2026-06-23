import api from './axios'
import type { Alimento, CategoriaAlimento } from '../types'

export interface AlimentoRequest {
  nome: string
  categoria: CategoriaAlimento
  caloriasPor100g: number
  proteinasPor100g: number
  carboidratosPor100g: number
  gordurasPor100g: number
  fibrasPor100g?: number
  calcioPor100g?: number
  ferroPor100g?: number
  custoPorKg?: number
}

export const alimentosApi = {
  listar: () => api.get<Alimento[]>('/api/alimentos').then((r) => r.data),
  listarAtivos: () => api.get<Alimento[]>('/api/alimentos/ativos').then((r) => r.data),
  buscarPorId: (id: number) => api.get<Alimento>(`/api/alimentos/${id}`).then((r) => r.data),
  listarPorCategoria: (cat: CategoriaAlimento) => api.get<Alimento[]>(`/api/alimentos/categoria/${cat}`).then((r) => r.data),
  buscarPorNome: (nome: string) => api.get<Alimento[]>(`/api/alimentos/busca?nome=${nome}`).then((r) => r.data),
  criar: (data: AlimentoRequest) => api.post<Alimento>('/api/alimentos', data).then((r) => r.data),
  atualizar: (id: number, data: AlimentoRequest) => api.put<Alimento>(`/api/alimentos/${id}`, data).then((r) => r.data),
  desativar: (id: number) => api.delete(`/api/alimentos/${id}`),
}
