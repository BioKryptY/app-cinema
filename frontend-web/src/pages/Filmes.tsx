import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Filme } from '../types';
import { buscarFilmes, excluirFilme } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';

export default function Filmes() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; filme: Filme | null }>({
    show: false,
    filme: null,
  });

  useEffect(() => {
    loadFilmes();
  }, []);

  async function loadFilmes() {
    try {
      setLoading(true);
      const data = await buscarFilmes();
      setFilmes(data);
      setError(null);
    } catch {
      setError('Erro ao carregar filmes. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.filme?.id) return;

    try {
      await excluirFilme(deleteModal.filme.id);
      setFilmes(filmes.filter(f => f.id !== deleteModal.filme?.id));
      setSuccess('Filme excluído com sucesso!');
      setDeleteModal({ show: false, filme: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Erro ao excluir filme.');
    }
  }

  function getClassificacaoBadge(classificacao: string) {
    const colors: { [key: string]: string } = {
      'L': 'success',
      '10': 'info',
      '12': 'primary',
      '14': 'warning',
      '16': 'orange',
      '18': 'danger',
    };
    return colors[classificacao] || 'secondary';
  }

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  if (loading) {
    return <LoadingSpinner message="Carregando filmes..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-camera-reels me-3" style={{ color: '#d4af37' }}></i>
              Filmes
            </h1>
            <p className="mb-0 opacity-75">Gerencie o catálogo de filmes do cinema</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'cards' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setViewMode('cards')}
                title="Visualização em Cards"
              >
                <i className="bi bi-grid-3x2-gap"></i>
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'table' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setViewMode('table')}
                title="Visualização em Tabela"
              >
                <i className="bi bi-table"></i>
              </button>
            </div>
            <Link to="/filmes/novo" className="btn btn-warning">
              <i className="bi bi-plus-lg me-1"></i>
              Novo Filme
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Empty State - Estilo Premium */}
      {filmes.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-film"></i>
          <h5>Nenhum filme cadastrado</h5>
          <p>Comece adicionando o primeiro filme ao catálogo.</p>
          <Link to="/filmes/novo" className="btn btn-warning">
            <i className="bi bi-plus-lg me-1"></i>
            Cadastrar Filme
          </Link>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && filmes.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filmes.map(filme => (
            <div key={filme.id} className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                  <span className="fw-bold text-truncate" title={filme.titulo}>
                    <i className="bi bi-camera-reels me-2" style={{ color: '#d4af37' }}></i>
                    {filme.titulo}
                  </span>
                  <span
                    className={`badge bg-${getClassificacaoBadge(filme.classificacao)}`}
                    style={filme.classificacao === '16' ? { backgroundColor: '#fd7e14' } : {}}
                  >
                    {filme.classificacao === 'L' ? 'Livre' : `${filme.classificacao}+`}
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-text text-muted small" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {filme.sinopse}
                  </p>
                  <hr />
                  <div className="row text-center small">
                    <div className="col-4">
                      <i className="bi bi-tag" style={{ color: '#e50914' }}></i>
                      <div className="text-muted">{filme.genero}</div>
                    </div>
                    <div className="col-4">
                      <i className="bi bi-clock" style={{ color: '#e50914' }}></i>
                      <div className="text-muted">{filme.duracao} min</div>
                    </div>
                    <div className="col-4">
                      <i className="bi bi-calendar" style={{ color: '#e50914' }}></i>
                      <div className="text-muted">{formatDate(filme.dataInicio)}</div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 pb-3">
                  <div className="d-flex gap-2">
                    <Link
                      to={`/filmes/editar/${filme.id}`}
                      className="btn btn-outline-warning btn-sm flex-grow-1"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setDeleteModal({ show: true, filme })}
                      title="Excluir filme"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filmes.length > 0 && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Título</th>
                  <th>Gênero</th>
                  <th className="text-center">Classificação</th>
                  <th className="text-center">Duração</th>
                  <th className="text-center">Período</th>
                  <th className="text-center" style={{ width: '120px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filmes.map(filme => (
                  <tr key={filme.id}>
                    <td className="fw-semibold">{filme.titulo}</td>
                    <td>{filme.genero}</td>
                    <td className="text-center">
                      <span
                        className={`badge bg-${getClassificacaoBadge(filme.classificacao)}`}
                        style={filme.classificacao === '16' ? { backgroundColor: '#fd7e14' } : {}}
                      >
                        {filme.classificacao === 'L' ? 'Livre' : `${filme.classificacao}+`}
                      </span>
                    </td>
                    <td className="text-center">{filme.duracao} min</td>
                    <td className="text-center small">
                      {formatDate(filme.dataInicio)} - {formatDate(filme.dataFim)}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/filmes/editar/${filme.id}`}
                          className="btn btn-outline-warning"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setDeleteModal({ show: true, filme })}
                          title="Excluir"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
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
        title="Excluir Filme"
        message={`Tem certeza que deseja excluir o filme "${deleteModal.filme?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, filme: null })}
      />
    </div>
  );
}
