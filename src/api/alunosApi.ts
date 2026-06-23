import api from './axios'
import type { Aluno } from '../types'

export interface AlunoRequest {
  nome: string
  dataNascimento: string
  cpf?: string
  matricula: string
  escolaId: number
}

export const alunosApi = {
  listar: () => api.get<Aluno[]>('/api/alunos').then((r) => r.data),
  buscarPorId: (id: number) => api.get<Aluno>(`/api/alunos/${id}`).then((r) => r.data),
  listarPorEscola: (escolaId: number) => api.get<Aluno[]>(`/api/alunos/escola/${escolaId}`).then((r) => r.data),
  buscarPorNome: (nome: string) => api.get<Aluno[]>(`/api/alunos/busca?nome=${nome}`).then((r) => r.data),
  criar: (data: AlunoRequest) => api.post<Aluno>('/api/alunos', data).then((r) => r.data),
  atualizar: (id: number, data: AlunoRequest) => api.put<Aluno>(`/api/alunos/${id}`, data).then((r) => r.data),
  desativar: (id: number) => api.delete(`/api/alunos/${id}`),
}
