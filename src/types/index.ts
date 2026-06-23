export interface Endereco {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface Escola {
  id: number
  nome: string
  endereco: Endereco
  tipo: 'MUNICIPAL' | 'ESTADUAL' | 'FEDERAL' | 'CRECHE'
  capacidadeAlunos: number
  ativa: boolean
  dataCadastro: string
}

export interface Aluno {
  id: number
  nome: string
  dataNascimento: string
  cpf?: string
  matricula: string
  escola: { id: number; nome: string }
  faixaEtaria: string
  ativo: boolean
  dataCadastro: string
}

export type CategoriaAlimento =
  | 'CEREAL'
  | 'LEGUMINOSA'
  | 'FRUTA'
  | 'HORTALICA'
  | 'LEITE_DERIVADO'
  | 'CARNE'
  | 'OVOS'
  | 'GORDURA'
  | 'ACUCAR'
  | 'OUTROS'

export interface Alimento {
  id: number
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
  ativo: boolean
}

export type StatusCardapio = 'RASCUNHO' | 'VALIDADO' | 'APROVADO' | 'REJEITADO'
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA'
export type TipoRefeicao = 'DESJEJUM' | 'COLACAO' | 'ALMOCO' | 'LANCHE_TARDE' | 'JANTAR'

export interface ItemCardapio {
  id: number
  alimento: { id: number; nome: string; caloriasPor100g: number }
  diaSemana: DiaSemana
  tipoRefeicao: TipoRefeicao
  quantidadeGramas: number
}

export interface Cardapio {
  id: number
  nome: string
  escola: { id: number; nome: string }
  semana: number
  ano: number
  status: StatusCardapio
  itens: ItemCardapio[]
  dataCadastro: string
}

export interface Fornecedor {
  id: number
  razaoSocial: string
  cnpj?: string
  email?: string
  telefone?: string
  endereco?: Endereco
  ativo: boolean
}

export interface EstoqueItem {
  id: number
  alimento: { id: number; nome: string }
  escola: { id: number; nome: string }
  fornecedor?: { id: number; razaoSocial: string }
  quantidadeKg: number
  lote?: string
  dataValidade: string
  dataCadastro: string
}

export interface MovimentacaoEstoque {
  id: number
  tipo: 'ENTRADA' | 'SAIDA' | 'PERDA'
  quantidadeKg: number
  motivo?: string
  dataMovimentacao: string
  responsavel?: string
}
