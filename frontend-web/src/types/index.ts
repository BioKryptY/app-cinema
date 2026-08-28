// Tipos do sistema CineWeb
//
// Os identificadores sao string porque o json-server gera ids alfanumericos
// (ex: "277f") ao criar um registro. Converter isso para numero perde o valor
// e quebra o cruzamento entre sessao, filme, sala, ingresso e pedido.

export interface Filme {
  id?: string;
  titulo: string;
  sinopse: string;
  classificacao: string;
  duracao: number;
  genero: string;
  dataInicio: string;
  dataFim: string;
}

export interface Sala {
  id?: string;
  numero: number;
  capacidade: number;
}

export interface Sessao {
  id?: string;
  filmeId: string;
  salaId: string;
  dataHora: string;
  precoBase: number;
}

export type TipoIngresso = 'inteira' | 'meia';

export interface Ingresso {
  id?: string;
  pedidoId?: string;
  sessaoId: string;
  tipo: TipoIngresso;
  valorInteira: number;
  valorMeia: number;
  valorFinal: number;
  dataCompra: string;
}

// Catalogo de lanches e combos da bomboniere
export interface LancheCombo {
  id?: string;
  nome: string;
  descricao: string;
  valorUnitario: number;
}

// Lanche/combo dentro de um pedido: guarda quantidade e subtotal do momento
// da venda, para que reajuste de preco no catalogo nao altere o historico
export interface ItemLancheCombo {
  lancheComboId: string;
  nome: string;
  valorUnitario: number;
  qtUnidade: number;
  subtotal: number;
}

export interface Pedido {
  id?: string;
  sessaoId: string;
  dataPedido: string;
  qtInteira: number;
  qtMeia: number;
  lanches: ItemLancheCombo[];
  valorIngressos: number;
  valorLanches: number;
  valorTotal: number;
}

// Tipos auxiliares para visualização
export interface SessaoComDetalhes extends Sessao {
  filme?: Filme;
  sala?: Sala;
  ingressosVendidos?: number;
}

export interface PedidoComDetalhes extends Pedido {
  sessao?: SessaoComDetalhes;
  ingressos?: Ingresso[];
}
