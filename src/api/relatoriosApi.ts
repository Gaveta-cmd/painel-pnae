import api from './axios'

export const relatoriosApi = {
  escolas: () => api.get('/api/relatorios/escolas').then((r) => r.data),
  nutricionalCardapio: (id: number) => api.get(`/api/relatorios/nutricional/cardapio/${id}`).then((r) => r.data),
  estoqueEscola: (id: number) => api.get(`/api/relatorios/estoque/escola/${id}`).then((r) => r.data),
  consumoEscola: (id: number, mes: number, ano: number) =>
    api.get(`/api/relatorios/consumo/escola/${id}?mes=${mes}&ano=${ano}`).then((r) => r.data),
  custoAluno: (id: number, mes: number, ano: number) =>
    api.get(`/api/relatorios/custo-aluno/escola/${id}?mes=${mes}&ano=${ano}`).then((r) => r.data),
}
