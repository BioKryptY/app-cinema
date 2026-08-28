import { z } from 'zod';

// Schema de validação para Filmes
export const filmeSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, 'O título é obrigatório'),
  sinopse: z.string().min(10, 'A sinopse deve ter no mínimo 10 caracteres'),
  classificacao: z.string().min(1, 'A classificação é obrigatória'),
  duracao: z.number().positive('A duração deve ser um número positivo (maior que 0)'),
  genero: z.string().min(1, 'O gênero é obrigatório'),
  dataInicio: z.string().min(1, 'A data de início é obrigatória'),
  dataFim: z.string().min(1, 'A data de fim é obrigatória'),
});

// Schema de validação para Salas
export const salaSchema = z.object({
  id: z.string().optional(),
  numero: z.number().positive('O número da sala deve ser positivo'),
  capacidade: z.number().positive('A capacidade deve ser um número positivo'),
});

// Schema de validação para Sessões
export const sessaoSchema = z.object({
  id: z.string().optional(),
  filmeId: z.string().min(1, 'Selecione um filme'),
  salaId: z.string().min(1, 'Selecione uma sala'),
  dataHora: z.string().min(1, 'A data e horário são obrigatórios').refine(
    (data) => {
      const dataHoraSessao = new Date(data);
      const agora = new Date();
      return dataHoraSessao >= agora;
    },
    { message: 'A data da sessão não pode ser retroativa (anterior à data atual)' }
  ),
  precoBase: z.number().positive('O preço base deve ser positivo'),
});

// Schema de validação para Ingressos
export const ingressoSchema = z.object({
  id: z.string().optional(),
  pedidoId: z.string().optional(),
  sessaoId: z.string().min(1, 'A sessão é obrigatória'),
  tipo: z.enum(['inteira', 'meia']),
  valorInteira: z.number().positive('O valor da inteira deve ser positivo'),
  valorMeia: z.number().positive('O valor da meia deve ser positivo'),
  valorFinal: z.number().positive('O valor deve ser positivo'),
  dataCompra: z.string().min(1, 'A data de compra é obrigatória'),
});

// Schema de validação para Lanches e Combos
export const lancheComboSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome é obrigatório'),
  descricao: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  valorUnitario: z.number().positive('O valor unitário deve ser um número positivo (maior que 0)'),
});

// Schema do lanche/combo lançado dentro de um pedido
export const itemLancheComboSchema = z.object({
  lancheComboId: z.string().min(1, 'Selecione um lanche ou combo'),
  nome: z.string().min(1, 'O nome do lanche é obrigatório'),
  valorUnitario: z.number().positive('O valor unitário deve ser positivo'),
  qtUnidade: z.number().int().positive('A quantidade deve ser maior que 0'),
  subtotal: z.number().positive('O subtotal deve ser positivo'),
});

// Schema de validação para Pedidos (ingressos + bomboniere na mesma venda)
export const pedidoSchema = z
  .object({
    id: z.string().optional(),
    sessaoId: z.string().min(1, 'A sessão é obrigatória'),
    dataPedido: z.string().min(1, 'A data do pedido é obrigatória'),
    qtInteira: z.number().int().min(0, 'A quantidade de inteiras não pode ser negativa'),
    qtMeia: z.number().int().min(0, 'A quantidade de meias não pode ser negativa'),
    lanches: z.array(itemLancheComboSchema),
    valorIngressos: z.number().nonnegative('O valor dos ingressos não pode ser negativo'),
    valorLanches: z.number().nonnegative('O valor dos lanches não pode ser negativo'),
    valorTotal: z.number().positive('O valor total deve ser maior que 0'),
  })
  .refine((pedido) => pedido.qtInteira + pedido.qtMeia > 0, {
    message: 'Selecione ao menos um ingresso, inteira ou meia',
    path: ['qtInteira'],
  });

// Tipos inferidos dos schemas
export type FilmeFormData = z.infer<typeof filmeSchema>;
export type SalaFormData = z.infer<typeof salaSchema>;
export type SessaoFormData = z.infer<typeof sessaoSchema>;
export type IngressoFormData = z.infer<typeof ingressoSchema>;
export type LancheComboFormData = z.infer<typeof lancheComboSchema>;
export type ItemLancheComboFormData = z.infer<typeof itemLancheComboSchema>;
export type PedidoFormData = z.infer<typeof pedidoSchema>;
