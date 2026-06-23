import api from './axios'
import type { Fornecedor } from '../types'

export interface FornecedorRequest {
  razaoSocial: string
  cnpj?: string
  email?: string
  telefone?: string
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
}

export const fornecedoresApi = {
  listar: () => api.get<Fornecedor[]>('/api/fornecedores').then((r) => r.data),
  buscarPorId: (id: number) => api.get<Fornecedor>(`/api/fornecedores/${id}`).then((r) => r.data),
  criar: (data: FornecedorRequest) => api.post<Fornecedor>('/api/fornecedores', data).then((r) => r.data),
  atualizar: (id: number, data: FornecedorRequest) => api.put<Fornecedor>(`/api/fornecedores/${id}`, data).then((r) => r.data),
  desativar: (id: number) => api.delete(`/api/fornecedores/${id}`),
}
