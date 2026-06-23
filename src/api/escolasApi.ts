import api from './axios'
import type { Escola } from '../types'

export interface EscolaRequest {
  nome: string
  tipo: string
  capacidadeAlunos: number
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
}

export const escolasApi = {
  listar: () => api.get<Escola[]>('/api/escolas').then((r) => r.data),
  listarAtivas: () => api.get<Escola[]>('/api/escolas/ativas').then((r) => r.data),
  buscarPorId: (id: number) => api.get<Escola>(`/api/escolas/${id}`).then((r) => r.data),
  buscarPorNome: (nome: string) => api.get<Escola[]>(`/api/escolas/busca?nome=${nome}`).then((r) => r.data),
  criar: (data: EscolaRequest) => api.post<Escola>('/api/escolas', data).then((r) => r.data),
  atualizar: (id: number, data: EscolaRequest) => api.put<Escola>(`/api/escolas/${id}`, data).then((r) => r.data),
  desativar: (id: number) => api.delete(`/api/escolas/${id}`),
}
