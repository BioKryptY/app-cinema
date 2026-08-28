import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Ingresso, SessaoComDetalhes } from '../types';
import {
  buscarIngressos,
  buscarSessoes,
  buscarFilmes,
  buscarSalas,
  excluirIngresso,
  excluirPedido,
} from '../services/api';
import { mesmoId, formatarMoeda } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';

interface IngressoComDetalhes extends Ingresso {
  sessao?: SessaoComDetalhes;
}

export default function Ingressos() {
  const [ingressos, setIngressos] = useState<IngressoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; ingresso: IngressoComDetalhes | null }>({
    show: false,
    ingresso: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ingressosData, sessoesData, filmesData, salasData] = await Promise.all([
        buscarIngressos(),
        buscarSessoes(),
        buscarFilmes(),
        buscarSalas(),
      ]);

      const sessoesComDetalhes: SessaoComDetalhes[] = sessoesData.map(sessao => ({
        ...sessao,
        filme: filmesData.find(f => mesmoId(f.id, sessao.filmeId)),
        sala: salasData.find(s => mesmoId(s.id, sessao.salaId)),
      }));

      const ingressosComDetalhes: IngressoComDetalhes[] = ingressosData.map(ingresso => ({
        ...ingresso,
        sessao: sessoesComDetalhes.find(s => mesmoId(s.id, ingresso.sessaoId)),
      }));

      setIngressos(ingressosComDetalhes);
      setError(null);
    } catch {
      setError('Erro ao carregar ingressos. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  }

  // O ingresso nasce dentro de um pedido; estornar so uma parte deixaria o
  // valor total do pedido mentindo. Por isso o cancelamento leva o pedido inteiro
  async function handleDelete() {
    const ingresso = deleteModal.ingresso;
    if (!ingresso?.id) return;

    try {
      if (ingresso.pedidoId) {
        await excluirPedido(ingresso.pedidoId);
        setSuccess(`Pedido #${ingresso.pedidoId} cancelado e ingressos estornados!`);
      } else {
        await excluirIngresso(ingresso.id);
        setSuccess('Ingresso cancelado com sucesso!');
      }

      setDeleteModal({ show: false, ingresso: null });
      await loadData();
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError('Erro ao cancelar ingresso.');
    }
  }

  function formatDateTime(dataHora: string) {
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  // Calcular estatisticas
  const totalVendas = ingressos.reduce((acc, i) => acc + i.valorFinal, 0);
  const totalInteira = ingressos.filter(i => i.tipo === 'inteira').length;
  const totalMeia = ingressos.filter(i => i.tipo === 'meia').length;

  if (loading) {
    return <LoadingSpinner message="Carregando ingressos..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-ticket-perforated me-3" style={{ color: '#d4af37' }}></i>
              Ingressos
            </h1>
            <p className="mb-0 opacity-75">Histórico de vendas de ingressos</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/pedidos" className="btn btn-warning">
              <i className="bi bi-receipt me-1"></i>
              Ver Pedidos
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Stats Cards - Estilo Premium */}
      {ingressos.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-cash-stack mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{formatarMoeda(totalVendas)}</div>
              <div className="stat-label">Total em Ingressos</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-ticket mb-2" style={{ fontSize: '2rem', color: '#28a745' }}></i>
              <div className="stat-number" style={{ color: '#28a745' }}>{totalInteira}</div>
              <div className="stat-label">Ingressos Inteira</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-ticket-detailed mb-2" style={{ fontSize: '2rem', color: '#ffc107' }}></i>
              <div className="stat-number" style={{ color: '#ffc107' }}>{totalMeia}</div>
              <div className="stat-label">Ingressos Meia</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Estilo Premium */}
      {ingressos.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-ticket"></i>
          <h5>Nenhum ingresso vendido</h5>
          <p>Os ingressos vendidos aparecerão aqui.</p>
          <Link to="/sessoes" className="btn btn-warning">
            <i className="bi bi-ticket-perforated me-1"></i>
            Vender Ingresso
          </Link>
        </div>
      )}

      {/* Ingressos Table */}
      {ingressos.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th className="text-center">Pedido</th>
                  <th>Filme</th>
                  <th className="text-center">Sala</th>
                  <th className="text-center">Sessao</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Valor</th>
                  <th className="text-center">Data Compra</th>
                  <th className="text-center">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {ingressos.map(ingresso => (
                  <tr key={ingresso.id}>
                    <td className="fw-semibold">#{ingresso.id}</td>
                    <td className="text-center">
                      {ingresso.pedidoId ? (
                        <Link to="/pedidos" className="badge bg-secondary text-decoration-none">
                          #{ingresso.pedidoId}
                        </Link>
                      ) : (
                        <span className="text-muted small">avulso</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-film me-2" style={{ color: '#e50914' }}></i>
                        {ingresso.sessao?.filme?.titulo || 'Filme removido'}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-success">
                        Sala {ingresso.sessao?.sala?.numero || '?'}
                      </span>
                    </td>
                    <td className="text-center small">
                      {ingresso.sessao ? formatDateTime(ingresso.sessao.dataHora) : '-'}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${ingresso.tipo === 'inteira' ? 'bg-dark' : 'bg-warning text-dark'}`}>
                        <i className={`bi ${ingresso.tipo === 'inteira' ? 'bi-ticket' : 'bi-ticket-detailed'} me-1`}></i>
                        {ingresso.tipo === 'inteira' ? 'Inteira' : 'Meia'}
                      </span>
                    </td>
                    <td className="text-center fw-semibold text-success">
                      {formatarMoeda(ingresso.valorFinal)}
                    </td>
                    <td className="text-center small">
                      {formatDateTime(ingresso.dataCompra)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setDeleteModal({ show: true, ingresso })}
                        title="Cancelar"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Cancelar Ingresso"
        message={
          deleteModal.ingresso?.pedidoId
            ? `O ingresso #${deleteModal.ingresso.id} faz parte do pedido #${deleteModal.ingresso.pedidoId}. Cancelar estorna o pedido inteiro, com todos os ingressos e lanches dele.`
            : `Tem certeza que deseja cancelar o ingresso #${deleteModal.ingresso?.id}? Esta acao realizara o estorno.`
        }
        confirmText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, ingresso: null })}
      />
    </div>
  );
}
