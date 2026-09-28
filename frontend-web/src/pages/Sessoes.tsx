import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Filme, Sala, SessaoComDetalhes } from '../types';
import {
  buscarSessoes,
  buscarFilmes,
  buscarSalas,
  excluirSessao,
  buscarIngressosPorSessao,
  excluirIngressosPorSessao,
  excluirPedidosPorSessao,
} from '../services/api';
import { estaLogado } from '../services/auth';
import { mesmoId } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';
import VendaIngressoModal from '../components/VendaIngressoModal';

export default function Sessoes() {
  const logado = estaLogado();
  const [sessoes, setSessoes] = useState<SessaoComDetalhes[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; sessao: SessaoComDetalhes | null }>({
    show: false,
    sessao: null,
  });
  const [vendaModal, setVendaModal] = useState<{ show: boolean; sessao: SessaoComDetalhes | null }>({
    show: false,
    sessao: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sessoesData, filmesData, salasData] = await Promise.all([
        buscarSessoes(),
        buscarFilmes(),
        buscarSalas(),
      ]);

      setFilmes(filmesData);
      setSalas(salasData);

      // Cruzar dados e adicionar contagem de ingressos
      const sessoesComDetalhes: SessaoComDetalhes[] = await Promise.all(
        sessoesData.map(async (sessao) => {
          // Ingressos só com login (sem login o backend responde 401)
          const ingressos = estaLogado() ? await buscarIngressosPorSessao(sessao.id!) : [];
          return {
            ...sessao,
            filme: filmesData.find(f => mesmoId(f.id, sessao.filmeId)),
            sala: salasData.find(s => mesmoId(s.id, sessao.salaId)),
            ingressosVendidos: ingressos.length,
          };
        })
      );

      setSessoes(sessoesComDetalhes);
      setError(null);
    } catch {
      setError('Erro ao carregar sessoes. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.sessao?.id) return;

    try {
      // Primeiro os pedidos e ingressos da sessão, senão sobrariam vendas
      // apontando para uma sessão que não existe mais
      await excluirPedidosPorSessao(deleteModal.sessao.id);
      await excluirIngressosPorSessao(deleteModal.sessao.id);
      // Depois exclui a sessão
      await excluirSessao(deleteModal.sessao.id);
      setSessoes(sessoes.filter(s => s.id !== deleteModal.sessao?.id));
      setSuccess('Sessão, pedidos e ingressos excluídos com sucesso!');
      setDeleteModal({ show: false, sessao: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Erro ao excluir sessão.');
    }
  }

  function handleVendaSuccess(mensagem: string) {
    setVendaModal({ show: false, sessao: null });
    setSuccess(mensagem);
    loadData(); // Recarregar para atualizar contagem
    setTimeout(() => setSuccess(null), 5000);
  }

  function formatDateTime(dataHora: string) {
    const date = new Date(dataHora);
    return {
      data: date.toLocaleDateString('pt-BR'),
      hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  function isSessaoPassada(dataHora: string) {
    return new Date(dataHora) < new Date();
  }

  if (loading) {
    return <LoadingSpinner message="Carregando sessoes..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-calendar-event me-3" style={{ color: '#d4af37' }}></i>
              Sessões
            </h1>
            <p className="mb-0 opacity-75">Gerencie as sessões de exibição</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/sessoes/nova" className="btn btn-warning">
              <i className="bi bi-plus-lg me-1"></i>
              Nova Sessão
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Info Cards */}
      {(filmes.length === 0 || salas.length === 0) && (
        <div className="alert alert-info d-flex align-items-center mb-4">
          <i className="bi bi-info-circle-fill me-2 fs-5"></i>
          <div>
            <strong>Atencao:</strong> Para criar sessoes, e necessario ter filmes e salas cadastrados.
            {filmes.length === 0 && (
              <span> <Link to="/filmes/novo">Cadastre um filme</Link>.</span>
            )}
            {salas.length === 0 && (
              <span> <Link to="/salas/nova">Cadastre uma sala</Link>.</span>
            )}
          </div>
        </div>
      )}

      {/* Empty State - Estilo Premium */}
      {sessoes.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-calendar-x"></i>
          <h5>Nenhuma sessão agendada</h5>
          <p>Comece agendando a primeira sessão.</p>
          {filmes.length > 0 && salas.length > 0 && (
            <Link to="/sessoes/nova" className="btn btn-warning">
              <i className="bi bi-plus-lg me-1"></i>
              Agendar Sessão
            </Link>
          )}
        </div>
      )}

      {/* Sessoes Table */}
      {sessoes.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Filme</th>
                  <th className="text-center">Sala</th>
                  <th className="text-center">Data</th>
                  <th className="text-center">Horario</th>
                  <th className="text-center">Preco Base</th>
                  <th className="text-center">Ingressos</th>
                  <th className="text-center">Status</th>
                  <th className="text-center" style={{ width: '180px' }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sessoes.map(sessao => {
                  const { data, hora } = formatDateTime(sessao.dataHora);
                  const passada = isSessaoPassada(sessao.dataHora);
                  const lotacao = sessao.sala ?
                    Math.round((sessao.ingressosVendidos! / sessao.sala.capacidade) * 100) : 0;

                  return (
                    <tr key={sessao.id} className={passada ? 'table-secondary' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-film me-2" style={{ color: '#e50914' }}></i>
                          <div>
                            <span className="fw-semibold">{sessao.filme?.titulo || 'Filme removido'}</span>
                            {sessao.filme && (
                              <small className="d-block text-muted">{sessao.filme.duracao} min</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success fs-6">
                          <i className="bi bi-door-open me-1"></i>
                          Sala {sessao.sala?.numero || '?'}
                        </span>
                      </td>
                      <td className="text-center">{data}</td>
                      <td className="text-center">
                        <span className="badge bg-dark">{hora}</span>
                      </td>
                      <td className="text-center">
                        R$ {sessao.precoBase.toFixed(2)}
                      </td>
                      <td className="text-center">
                        {logado ? (
                          <div className="d-flex flex-column align-items-center">
                            <span className="fw-semibold">
                              {sessao.ingressosVendidos} / {sessao.sala?.capacidade || '?'}
                            </span>
                            <div className="progress mt-1" style={{ width: '60px', height: '6px' }}>
                              <div
                                className={`progress-bar ${lotacao >= 90 ? 'bg-danger' : lotacao >= 70 ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${lotacao}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        {passada ? (
                          <span className="badge bg-secondary">
                            <i className="bi bi-clock-history me-1"></i>
                            Encerrada
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Ativa
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {logado && !passada && sessao.ingressosVendidos! < (sessao.sala?.capacidade || 0) && (
                            <button
                              className="btn btn-success"
                              onClick={() => setVendaModal({ show: true, sessao })}
                              title="Vender ingressos e lanches"
                            >
                              <i className="bi bi-ticket-perforated"></i>
                            </button>
                          )}
                          <Link
                            to={`/sessoes/editar/${sessao.id}`}
                            className="btn btn-outline-warning"
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => setDeleteModal({ show: true, sessao })}
                            title="Excluir"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Excluir Sessao"
        message={`Tem certeza que deseja excluir a sessao de "${deleteModal.sessao?.filme?.titulo}"? Esta acao nao pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, sessao: null })}
      />

      {/* Venda de Ingresso Modal */}
      {vendaModal.sessao && (
        <VendaIngressoModal
          show={vendaModal.show}
          sessao={vendaModal.sessao}
          onClose={() => setVendaModal({ show: false, sessao: null })}
          onSuccess={handleVendaSuccess}
        />
      )}
    </div>
  );
}
