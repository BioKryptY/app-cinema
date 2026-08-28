import { useState, useEffect, useCallback } from 'react';
import type { SessaoComDetalhes, LancheCombo, ItemLancheCombo, Pedido, Ingresso } from '../types';
import { pedidoSchema } from '../schemas';
import { buscarLanchesCombos, criarPedido, criarIngresso, excluirPedido } from '../services/api';
import { formatarMoeda } from '../utils';

interface VendaIngressoModalProps {
  show: boolean;
  sessao: SessaoComDetalhes;
  onClose: () => void;
  onSuccess: (mensagem: string) => void;
}

export default function VendaIngressoModal({ show, sessao, onClose, onSuccess }: VendaIngressoModalProps) {
  const [qtInteira, setQtInteira] = useState(1);
  const [qtMeia, setQtMeia] = useState(0);
  const [catalogo, setCatalogo] = useState<LancheCombo[]>([]);
  // quantidade escolhida de cada lanche/combo, indexada pelo id do item
  const [quantidadeLanches, setQuantidadeLanches] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCatalogo = useCallback(async () => {
    try {
      setLoading(true);
      setCatalogo(await buscarLanchesCombos());
    } catch {
      setError('Nao foi possivel carregar os lanches e combos. A venda de ingressos continua disponivel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    setQtInteira(1);
    setQtMeia(0);
    setQuantidadeLanches({});
    setError(null);
    carregarCatalogo();
  }, [show, carregarCatalogo]);

  if (!show) return null;

  const precoInteira = sessao.precoBase;
  const precoMeia = sessao.precoBase / 2;

  const lugaresDisponiveis = (sessao.sala?.capacidade || 0) - (sessao.ingressosVendidos || 0);
  const totalIngressos = qtInteira + qtMeia;
  const lugaresRestantes = lugaresDisponiveis - totalIngressos;

  // Monta a lista de LancheCombo do pedido, com quantidade e subtotal de cada item
  const lanchesDoPedido: ItemLancheCombo[] = catalogo
    .filter(item => (quantidadeLanches[item.id!] || 0) > 0)
    .map(item => {
      const qtUnidade = quantidadeLanches[item.id!];
      return {
        lancheComboId: item.id!,
        nome: item.nome,
        valorUnitario: item.valorUnitario,
        qtUnidade,
        subtotal: item.valorUnitario * qtUnidade,
      };
    });

  const valorIngressos = qtInteira * precoInteira + qtMeia * precoMeia;
  const valorLanches = lanchesDoPedido.reduce((acumulado, item) => acumulado + item.subtotal, 0);
  const valorTotal = valorIngressos + valorLanches;

  function alterarQuantidadeLanche(id: string, delta: number) {
    setQuantidadeLanches(prev => {
      const nova = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: nova };
    });
  }

  function ajustarIngresso(tipo: 'inteira' | 'meia', delta: number) {
    // nao deixa passar da lotacao da sala
    if (delta > 0 && lugaresRestantes <= 0) return;

    if (tipo === 'inteira') {
      setQtInteira(valor => Math.max(0, valor + delta));
    } else {
      setQtMeia(valor => Math.max(0, valor + delta));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (totalIngressos > lugaresDisponiveis) {
      setError(`A sala tem apenas ${lugaresDisponiveis} lugar(es) disponivel(is) para esta sessao.`);
      return;
    }

    const pedido: Pedido = {
      sessaoId: sessao.id!,
      dataPedido: new Date().toISOString(),
      qtInteira,
      qtMeia,
      lanches: lanchesDoPedido,
      valorIngressos,
      valorLanches,
      valorTotal,
    };

    const validacao = pedidoSchema.safeParse(pedido);
    if (!validacao.success) {
      setError(validacao.error.issues[0].message);
      return;
    }

    let pedidoCriado: Pedido | null = null;

    try {
      setSaving(true);

      pedidoCriado = await criarPedido(pedido);

      // Um registro de Ingresso por lugar vendido, sempre vinculado
      // a sessao e ao pedido que o originou
      const ingressos: Ingresso[] = [
        ...Array.from({ length: qtInteira }, () => 'inteira' as const),
        ...Array.from({ length: qtMeia }, () => 'meia' as const),
      ].map(tipo => ({
        pedidoId: pedidoCriado!.id!,
        sessaoId: sessao.id!,
        tipo,
        valorInteira: precoInteira,
        valorMeia: precoMeia,
        valorFinal: tipo === 'inteira' ? precoInteira : precoMeia,
        dataCompra: pedido.dataPedido,
      }));

      for (const ingresso of ingressos) {
        await criarIngresso(ingresso);
      }

      onSuccess(
        `Pedido registrado: ${totalIngressos} ingresso(s)` +
        (lanchesDoPedido.length > 0 ? ` e ${lanchesDoPedido.length} item(ns) da bomboniere` : '') +
        ` — total de ${formatarMoeda(valorTotal)}.`
      );
    } catch {
      // desfaz o pedido pela metade para nao deixar venda inconsistente
      if (pedidoCriado?.id) {
        try {
          await excluirPedido(pedidoCriado.id);
        } catch {
          setError('A venda falhou e o pedido parcial nao pode ser desfeito. Confira a tela de Pedidos.');
          setSaving(false);
          return;
        }
      }
      setError('Erro ao processar a venda. Nenhum ingresso foi emitido. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function formatDateTime(dataHora: string) {
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center">
                <i className="bi bi-ticket-perforated me-2"></i>
                Venda de Ingressos
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Fechar"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Resumo da sessao */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Filme</h6>
                        <p className="mb-2 fw-semibold">
                          <i className="bi bi-film me-2" style={{ color: '#e50914' }}></i>
                          {sessao.filme?.titulo || 'Filme removido'}
                        </p>
                        <h6 className="text-muted mb-1">Sala</h6>
                        <p className="mb-0">
                          <span className="badge bg-success me-2">
                            Sala {sessao.sala?.numero || '?'}
                          </span>
                          <small className="text-muted">
                            {lugaresDisponiveis} lugares disponiveis
                          </small>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Data e Horario</h6>
                        <p className="mb-2">
                          <i className="bi bi-calendar-event text-warning me-2"></i>
                          {formatDateTime(sessao.dataHora)}
                        </p>
                        <h6 className="text-muted mb-1">Precos</h6>
                        <p className="mb-0">
                          <span className="badge bg-dark me-1">Inteira: {formatarMoeda(precoInteira)}</span>
                          <span className="badge bg-warning text-dark">Meia: {formatarMoeda(precoMeia)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {/* Ingressos */}
                <h6 className="fw-semibold text-uppercase text-muted mb-3">
                  <i className="bi bi-ticket me-1"></i>
                  1. Ingressos
                </h6>
                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <div className={`card h-100 ${qtInteira > 0 ? 'border-dark border-2' : 'border'}`}>
                      <div className="card-body text-center">
                        <i className="bi bi-ticket fs-2 text-dark"></i>
                        <h6 className="mt-2 mb-1">Inteira</h6>
                        <p className="text-success fw-bold mb-3">{formatarMoeda(precoInteira)}</p>
                        <div className="input-group input-group-sm justify-content-center">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => ajustarIngresso('inteira', -1)}
                            aria-label="Menos uma inteira"
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            style={{ maxWidth: '80px' }}
                            value={qtInteira}
                            onChange={(e) => setQtInteira(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            aria-label="Quantidade de inteiras"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => ajustarIngresso('inteira', 1)}
                            aria-label="Mais uma inteira"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`card h-100 ${qtMeia > 0 ? 'border-warning border-2' : 'border'}`}>
                      <div className="card-body text-center">
                        <i className="bi bi-ticket-detailed fs-2 text-warning"></i>
                        <h6 className="mt-2 mb-1">Meia-Entrada</h6>
                        <p className="text-success fw-bold mb-3">{formatarMoeda(precoMeia)}</p>
                        <div className="input-group input-group-sm justify-content-center">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => ajustarIngresso('meia', -1)}
                            aria-label="Menos uma meia"
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            style={{ maxWidth: '80px' }}
                            value={qtMeia}
                            onChange={(e) => setQtMeia(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            aria-label="Quantidade de meias"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => ajustarIngresso('meia', 1)}
                            aria-label="Mais uma meia"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`form-text mb-4 ${lugaresRestantes < 0 ? 'text-danger fw-semibold' : ''}`}>
                  <i className="bi bi-info-circle me-1"></i>
                  {lugaresRestantes < 0
                    ? `Excede a lotacao da sala em ${Math.abs(lugaresRestantes)} lugar(es).`
                    : `${totalIngressos} de ${lugaresDisponiveis} lugares selecionados.`}
                </div>

                {/* Lanches e combos */}
                <h6 className="fw-semibold text-uppercase text-muted mb-3">
                  <i className="bi bi-cup-straw me-1"></i>
                  2. Lanches e Combos <span className="text-lowercase fw-normal">(opcional)</span>
                </h6>

                {loading && (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Carregando bomboniere...
                  </div>
                )}

                {!loading && catalogo.length === 0 && (
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Nenhum lanche ou combo cadastrado.
                  </div>
                )}

                {!loading && catalogo.length > 0 && (
                  <div className="list-group mb-4" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {catalogo.map(item => {
                      const quantidade = quantidadeLanches[item.id!] || 0;
                      return (
                        <div
                          key={item.id}
                          className={`list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 ${quantidade > 0 ? 'bg-warning bg-opacity-10' : ''}`}
                        >
                          <div className="flex-grow-1">
                            <div className="fw-semibold">
                              <i className="bi bi-cup-straw me-2 text-warning"></i>
                              {item.nome}
                            </div>
                            <small className="text-muted">{item.descricao}</small>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold text-success">{formatarMoeda(item.valorUnitario)}</div>
                            {quantidade > 0 && (
                              <small className="text-muted">
                                Subtotal: {formatarMoeda(item.valorUnitario * quantidade)}
                              </small>
                            )}
                          </div>
                          <div className="input-group input-group-sm" style={{ width: '130px' }}>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => alterarQuantidadeLanche(item.id!, -1)}
                              aria-label={`Remover ${item.nome}`}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={quantidade}
                              onChange={(e) =>
                                setQuantidadeLanches(prev => ({
                                  ...prev,
                                  [item.id!]: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              min="0"
                              aria-label={`Quantidade de ${item.nome}`}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => alterarQuantidadeLanche(item.id!, 1)}
                              aria-label={`Adicionar ${item.nome}`}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Resumo do pedido */}
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">
                      <i className="bi bi-receipt me-1"></i>
                      Resumo do Pedido
                    </h6>
                    <div className="d-flex justify-content-between small">
                      <span>
                        Ingressos ({qtInteira} inteira{qtInteira === 1 ? '' : 's'}, {qtMeia} meia{qtMeia === 1 ? '' : 's'})
                      </span>
                      <span className="fw-semibold">{formatarMoeda(valorIngressos)}</span>
                    </div>
                    {lanchesDoPedido.map(item => (
                      <div key={item.lancheComboId} className="d-flex justify-content-between small text-muted mt-1">
                        <span>{item.qtUnidade}x {item.nome}</span>
                        <span>{formatarMoeda(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between small mt-1">
                      <span>Lanches e combos</span>
                      <span className="fw-semibold">{formatarMoeda(valorLanches)}</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Valor Total</h6>
                        <small className="opacity-75">
                          {totalIngressos} ingresso(s) + {lanchesDoPedido.length} item(ns) da bomboniere
                        </small>
                      </div>
                      <h2 className="mb-0">{formatarMoeda(valorTotal)}</h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={saving || totalIngressos === 0 || lugaresRestantes < 0}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
