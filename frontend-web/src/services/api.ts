import type { Filme, Sala, Sessao, Ingresso, LancheCombo, Pedido } from '../types';
import { configuracao } from '../config';
import { pegarToken, removerToken } from './auth';

const URL_BASE_API = configuracao.urlBaseApi;

// Faz a chamada para o backend já com o token (se tiver)
async function chamarApi(caminho: string, opcoes: RequestInit = {}): Promise<Response> {
  const token = pegarToken();

  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 401 = sem login ou token vencido (dura 1 hora): apaga o token e manda para o login
  if (resposta.status === 401) {
    removerToken();
    window.location.href = '/login';
  }

  return resposta;
}

// Funções auxiliares
async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    throw new Error(`Erro na requisição: ${resposta.status}`);
  }
  return resposta.json();
}

// ===================
// API de Filmes
// ===================

export async function buscarFilmes(): Promise<Filme[]> {
  const resposta = await chamarApi(`/filmes`);
  return tratarResposta<Filme[]>(resposta);
}

export async function buscarFilme(id: string): Promise<Filme> {
  const resposta = await chamarApi(`/filmes/${id}`);
  return tratarResposta<Filme>(resposta);
}

export async function criarFilme(filme: Filme): Promise<Filme> {
  const resposta = await chamarApi(`/filmes`, {
    method: 'POST',
    body: JSON.stringify(filme),
  });
  return tratarResposta<Filme>(resposta);
}

export async function atualizarFilme(id: string, filme: Filme): Promise<Filme> {
  const resposta = await chamarApi(`/filmes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(filme),
  });
  return tratarResposta<Filme>(resposta);
}

export async function excluirFilme(id: string): Promise<void> {
  const resposta = await chamarApi(`/filmes/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir filme: ${resposta.status}`);
  }
}

// ===================
// API de Salas
// ===================

export async function buscarSalas(): Promise<Sala[]> {
  const resposta = await chamarApi(`/salas`);
  return tratarResposta<Sala[]>(resposta);
}

export async function buscarSala(id: string): Promise<Sala> {
  const resposta = await chamarApi(`/salas/${id}`);
  return tratarResposta<Sala>(resposta);
}

export async function criarSala(sala: Sala): Promise<Sala> {
  const resposta = await chamarApi(`/salas`, {
    method: 'POST',
    body: JSON.stringify(sala),
  });
  return tratarResposta<Sala>(resposta);
}

export async function atualizarSala(id: string, sala: Sala): Promise<Sala> {
  const resposta = await chamarApi(`/salas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sala),
  });
  return tratarResposta<Sala>(resposta);
}

export async function excluirSala(id: string): Promise<void> {
  const resposta = await chamarApi(`/salas/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir sala: ${resposta.status}`);
  }
}

// ===================
// API de Sessões
// ===================

export async function buscarSessoes(): Promise<Sessao[]> {
  const resposta = await chamarApi(`/sessoes`);
  return tratarResposta<Sessao[]>(resposta);
}

export async function buscarSessao(id: string): Promise<Sessao> {
  const resposta = await chamarApi(`/sessoes/${id}`);
  return tratarResposta<Sessao>(resposta);
}

export async function criarSessao(sessao: Sessao): Promise<Sessao> {
  const resposta = await chamarApi(`/sessoes`, {
    method: 'POST',
    body: JSON.stringify(sessao),
  });
  return tratarResposta<Sessao>(resposta);
}

export async function atualizarSessao(id: string, sessao: Sessao): Promise<Sessao> {
  const resposta = await chamarApi(`/sessoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessao),
  });
  return tratarResposta<Sessao>(resposta);
}

export async function excluirSessao(id: string): Promise<void> {
  const resposta = await chamarApi(`/sessoes/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir sessão: ${resposta.status}`);
  }
}

// ===================
// API de Ingressos
// ===================

export async function buscarIngressos(): Promise<Ingresso[]> {
  const resposta = await chamarApi(`/ingressos`);
  return tratarResposta<Ingresso[]>(resposta);
}

export async function buscarIngressosPorSessao(sessaoId: string): Promise<Ingresso[]> {
  const resposta = await chamarApi(`/ingressos?sessaoId=${sessaoId}`);
  return tratarResposta<Ingresso[]>(resposta);
}

export async function buscarIngressosPorPedido(pedidoId: string): Promise<Ingresso[]> {
  const resposta = await chamarApi(`/ingressos?pedidoId=${pedidoId}`);
  return tratarResposta<Ingresso[]>(resposta);
}

export async function criarIngresso(ingresso: Ingresso): Promise<Ingresso> {
  const resposta = await chamarApi(`/ingressos`, {
    method: 'POST',
    body: JSON.stringify(ingresso),
  });
  return tratarResposta<Ingresso>(resposta);
}

export async function excluirIngresso(id: string): Promise<void> {
  const resposta = await chamarApi(`/ingressos/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir ingresso: ${resposta.status}`);
  }
}

export async function excluirIngressosPorSessao(sessaoId: string): Promise<void> {
  const ingressos = await buscarIngressosPorSessao(sessaoId);
  await Promise.all(ingressos.map(ingresso => excluirIngresso(ingresso.id!)));
}

// ===================
// API de Lanches e Combos
// ===================

export async function buscarLanchesCombos(): Promise<LancheCombo[]> {
  const resposta = await chamarApi(`/lanchesCombos`);
  return tratarResposta<LancheCombo[]>(resposta);
}

export async function buscarLancheCombo(id: string): Promise<LancheCombo> {
  const resposta = await chamarApi(`/lanchesCombos/${id}`);
  return tratarResposta<LancheCombo>(resposta);
}

export async function criarLancheCombo(lancheCombo: LancheCombo): Promise<LancheCombo> {
  const resposta = await chamarApi(`/lanchesCombos`, {
    method: 'POST',
    body: JSON.stringify(lancheCombo),
  });
  return tratarResposta<LancheCombo>(resposta);
}

export async function atualizarLancheCombo(id: string, lancheCombo: LancheCombo): Promise<LancheCombo> {
  const resposta = await chamarApi(`/lanchesCombos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lancheCombo),
  });
  return tratarResposta<LancheCombo>(resposta);
}

export async function excluirLancheCombo(id: string): Promise<void> {
  const resposta = await chamarApi(`/lanchesCombos/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir lanche/combo: ${resposta.status}`);
  }
}

// ===================
// API de Pedidos
// ===================

export async function buscarPedidos(): Promise<Pedido[]> {
  const resposta = await chamarApi(`/pedidos`);
  return tratarResposta<Pedido[]>(resposta);
}

export async function buscarPedido(id: string): Promise<Pedido> {
  const resposta = await chamarApi(`/pedidos/${id}`);
  return tratarResposta<Pedido>(resposta);
}

export async function buscarPedidosPorSessao(sessaoId: string): Promise<Pedido[]> {
  const resposta = await chamarApi(`/pedidos?sessaoId=${sessaoId}`);
  return tratarResposta<Pedido[]>(resposta);
}

export async function criarPedido(pedido: Pedido): Promise<Pedido> {
  const resposta = await chamarApi(`/pedidos`, {
    method: 'POST',
    body: JSON.stringify(pedido),
  });
  return tratarResposta<Pedido>(resposta);
}

export async function atualizarPedido(id: string, pedido: Pedido): Promise<Pedido> {
  const resposta = await chamarApi(`/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pedido),
  });
  return tratarResposta<Pedido>(resposta);
}

async function removerPedido(id: string): Promise<void> {
  const resposta = await chamarApi(`/pedidos/${id}`, {
    method: 'DELETE',
  });
  if (!resposta.ok) {
    throw new Error(`Erro ao excluir pedido: ${resposta.status}`);
  }
}

// Cancelar um pedido estorna junto os ingressos emitidos nele, senao a sessao
// continuaria ocupando lugares que ja foram devolvidos
export async function excluirPedido(id: string): Promise<void> {
  const ingressos = await buscarIngressosPorPedido(id);
  await Promise.all(ingressos.map(ingresso => excluirIngresso(ingresso.id!)));
  await removerPedido(id);
}

export async function excluirPedidosPorSessao(sessaoId: string): Promise<void> {
  const pedidos = await buscarPedidosPorSessao(sessaoId);
  await Promise.all(pedidos.map(pedido => removerPedido(pedido.id!)));
}
