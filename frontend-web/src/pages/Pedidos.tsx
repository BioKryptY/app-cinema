import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import type { PedidoComDetalhes, SessaoComDetalhes, Ingresso } from '../types';
import {
  buscarPedidos,
  buscarSessoes,
  buscarFilmes,
  buscarSalas,
  buscarIngressos,
  excluirPedido,
} from '../services/api';
import { mesmoId, formatarMoeda } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; pedido: PedidoComDetalhes | null }>({
    show: false,
    pedido: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pedidosData, sessoesData, filmesData, salasData, ingressosData] = await Promise.all([
        buscarPedidos(),
        buscarSessoes(),
        buscarFilmes(),
        buscarSalas(),
        buscarIngressos(),
      ]);

      const sessoesComDetalhes: SessaoComDetalhes[] = sessoesData.map(sessao => ({
        ...sessao,
        filme: filmesData.find(f => mesmoId(f.id, sessao.filmeId)),
        sala: salasData.find(s => mesmoId(s.id, sessao.salaId)),
      }));

      const pedidosComDetalhes: PedidoComDetalhes[] = pedidosData
        .map(pedido => ({
          ...pedido,
          // pedido escrito à mão no db.json pode vir sem a lista de lanches;
          // sem isso a tela inteira quebraria ao contar os itens
          lanches: pedido.lanches ?? [],
          sessao: sessoesComDetalhes.find(s => mesmoId(s.id, pedido.sessaoId)),
          ingressos: ingressosData.filter((i: Ingresso) => mesmoId(i.pedidoId, pedido.id)),
        }))
        .sort((a, b) => b.dataPedido.localeCompare(a.dataPedido));

      setPedidos(pedidosComDetalhes);
      setError(null);
    } catch {
      setError('Erro ao carregar pedidos. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.pedido?.id) return;

    try {
      await excluirPedido(deleteModal.pedido.id);
      setPedidos(pedidos.filter(p => p.id !== deleteModal.pedido?.id));
      setSuccess('Pedido cancelado e ingressos estornados com sucesso!');
      setDeleteModal({ show: false, pedido: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Erro ao cancelar o pedido.');
    }
  }

  function formatDateTime(data: string) {
    return new Date(data).toLocaleString('pt-BR');
  }

  const receitaTotal = pedidos.reduce((acumulado, p) => acumulado + p.valorTotal, 0);
  const receitaIngressos = pedidos.reduce((acumulado, p) => acumulado + p.valorIngressos, 0);
  const receitaLanches = pedidos.reduce((acumulado, p) => acumulado + p.valorLanches, 0);

  if (loading) {
    return <LoadingSpinner message="Carregando pedidos..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-receipt me-3" style={{ color: '#d4af37' }}></i>
              Pedidos
            </h1>
            <p className="mb-0 opacity-75">Vendas fechadas: ingressos e bomboniere</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/sessoes" className="btn btn-warning">
              <i className="bi bi-ticket-perforated me-1"></i>
              Nova Venda
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Stats Cards - Estilo Premium */}
      {pedidos.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <i className="bi bi-receipt mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{pedidos.length}</div>
              <div className="stat-label">Pedidos</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <i className="bi bi-cash-stack mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{formatarMoeda(receitaTotal)}</div>
              <div className="stat-label">Receita Total</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <i className="bi bi-ticket mb-2" style={{ fontSize: '2rem', color: '#28a745' }}></i>
              <div className="stat-number" style={{ color: '#28a745' }}>{formatarMoeda(receitaIngressos)}</div>
              <div className="stat-label">Em Ingressos</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <i className="bi bi-cup-straw mb-2" style={{ fontSize: '2rem', color: '#ffc107' }}></i>
              <div className="stat-number" style={{ color: '#ffc107' }}>{formatarMoeda(receitaLanches)}</div>
              <div className="stat-label">Em Bomboniere</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Estilo Premium */}
      {pedidos.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-receipt-cutoff"></i>
          <h5>Nenhum pedido registrado</h5>
          <p>Os pedidos aparecem aqui assim que a primeira venda for fechada.</p>
          <Link to="/sessoes" className="btn btn-warning">
            <i className="bi bi-ticket-perforated me-1"></i>
            Vender Ingresso
          </Link>
        </div>
      )}

      {/* Pedidos Table */}
      {pedidos.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Filme / Sessao</th>
                  <th className="text-center">Sala</th>
                  <th className="text-center">Ingressos</th>
                  <th className="text-center">Bomboniere</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Data</th>
                  <th className="text-center" style={{ width: '140px' }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <Fragment key={pedido.id}>
                    <tr>
                      <td className="fw-semibold">#{pedido.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-film me-2" style={{ color: '#e50914' }}></i>
                          <div>
                            <span className="fw-semibold">
                              {pedido.sessao?.filme?.titulo || 'Filme removido'}
                            </span>
                            <small className="d-block text-muted">
                              {pedido.sessao ? formatDateTime(pedido.sessao.dataHora) : 'Sessao removida'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success">
                          Sala {pedido.sessao?.sala?.numero || '?'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-dark me-1">{pedido.qtInteira} inteira</span>
                        <span className="badge bg-warning text-dark">{pedido.qtMeia} meia</span>
                        <small className="d-block text-muted mt-1">
                          {formatarMoeda(pedido.valorIngressos)}
                        </small>
                      </td>
                      <td className="text-center">
                        {pedido.lanches.length === 0 ? (
                          <span className="text-muted small">—</span>
                        ) : (
                          <>
                            <span className="badge bg-secondary">
                              <i className="bi bi-cup-straw me-1"></i>
                              {pedido.lanches.reduce((acumulado, l) => acumulado + l.qtUnidade, 0)} un.
                            </span>
                            <small className="d-block text-muted mt-1">
                              {formatarMoeda(pedido.valorLanches)}
                            </small>
                          </>
                        )}
                      </td>
                      <td className="text-center fw-semibold text-success">
                        {formatarMoeda(pedido.valorTotal)}
                      </td>
                      <td className="text-center small">{formatDateTime(pedido.dataPedido)}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id!)}
                            title="Ver detalhes"
                          >
                            <i className={`bi ${expandido === pedido.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => setDeleteModal({ show: true, pedido })}
                            title="Cancelar pedido"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandido === pedido.id && (
                      <tr className="table-light">
                        <td colSpan={8}>
                          <div className="row g-4 py-2">
                            <div className="col-md-6">
                              <h6 className="fw-semibold mb-3">
                                <i className="bi bi-ticket-perforated me-1"></i>
                                Ingressos emitidos ({pedido.ingressos?.length || 0})
                              </h6>
                              {(pedido.ingressos?.length || 0) === 0 ? (
                                <p className="text-muted small mb-0">Nenhum ingresso vinculado a este pedido.</p>
                              ) : (
                                <ul className="list-group list-group-flush">
                                  {pedido.ingressos!.map(ingresso => (
                                    <li
                                      key={ingresso.id}
                                      className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0"
                                    >
                                      <span>
                                        <span
                                          className={`badge me-2 ${ingresso.tipo === 'inteira' ? 'bg-dark' : 'bg-warning text-dark'}`}
                                        >
                                          {ingresso.tipo === 'inteira' ? 'Inteira' : 'Meia'}
                                        </span>
                                        <small className="text-muted">#{ingresso.id}</small>
                                      </span>
                                      <span className="fw-semibold text-success">
                                        {formatarMoeda(ingresso.valorFinal)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="col-md-6">
                              <h6 className="fw-semibold mb-3">
                                <i className="bi bi-cup-straw me-1"></i>
                                Lanches e combos ({pedido.lanches.length})
                              </h6>
                              {pedido.lanches.length === 0 ? (
                                <p className="text-muted small mb-0">Pedido sem itens da bomboniere.</p>
                              ) : (
                                <ul className="list-group list-group-flush">
                                  {pedido.lanches.map(item => (
                                    <li
                                      key={item.lancheComboId}
                                      className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0"
                                    >
                                      <span>
                                        <span className="badge bg-secondary me-2">{item.qtUnidade}x</span>
                                        {item.nome}
                                        <small className="text-muted ms-2">
                                          ({formatarMoeda(item.valorUnitario)} un.)
                                        </small>
                                      </span>
                                      <span className="fw-semibold text-success">
                                        {formatarMoeda(item.subtotal)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Cancelar Pedido"
        message={`Cancelar o pedido #${deleteModal.pedido?.id}? Os ${deleteModal.pedido?.ingressos?.length || 0} ingresso(s) emitidos serao estornados e os lugares voltam a ficar disponiveis.`}
        confirmText="Cancelar Pedido"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, pedido: null })}
      />
    </div>
  );
}
