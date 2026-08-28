import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Sala } from '../types';
import { buscarSalas, excluirSala } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';

export default function Salas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; sala: Sala | null }>({
    show: false,
    sala: null,
  });

  useEffect(() => {
    loadSalas();
  }, []);

  async function loadSalas() {
    try {
      setLoading(true);
      const data = await buscarSalas();
      setSalas(data);
      setError(null);
    } catch {
      setError('Erro ao carregar salas. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.sala?.id) return;

    try {
      await excluirSala(deleteModal.sala.id);
      setSalas(salas.filter(s => s.id !== deleteModal.sala?.id));
      setSuccess('Sala excluida com sucesso!');
      setDeleteModal({ show: false, sala: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Erro ao excluir sala.');
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando salas..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-door-open me-3" style={{ color: '#d4af37' }}></i>
              Salas
            </h1>
            <p className="mb-0 opacity-75">Gerencie as salas de exibição do cinema</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/salas/nova" className="btn btn-warning">
              <i className="bi bi-plus-lg me-1"></i>
              Nova Sala
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Empty State - Estilo Premium */}
      {salas.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-door-closed"></i>
          <h5>Nenhuma sala cadastrada</h5>
          <p>Comece adicionando a primeira sala.</p>
          <Link to="/salas/nova" className="btn btn-success">
            <i className="bi bi-plus-lg me-1"></i>
            Cadastrar Sala
          </Link>
        </div>
      )}

      {/* Salas Grid */}
      {salas.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {salas.map(sala => (
            <div key={sala.id} className="col">
              <div className="card h-100 shadow-sm border-0 text-center">
                <div className="card-body p-4">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-door-open text-success" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h2 className="display-4 fw-bold text-success mb-1">
                    {sala.numero}
                  </h2>
                  <p className="text-muted mb-3">Sala</p>
                  <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                    <i className="bi bi-people-fill"></i>
                    <span className="fw-semibold">{sala.capacidade}</span>
                    <span className="small">lugares</span>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 pb-3">
                  <div className="d-flex gap-2 justify-content-center">
                    <Link
                      to={`/salas/editar/${sala.id}`}
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setDeleteModal({ show: true, sala })}
                      title="Excluir sala"
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

      {/* Stats Card - Estilo Premium */}
      {salas.length > 0 && (
        <div className="row g-4 mt-2">
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-door-open mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{salas.length}</div>
              <div className="stat-label">Total de Salas</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-people mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">
                {salas.reduce((acc, sala) => acc + sala.capacidade, 0)}
              </div>
              <div className="stat-label">Capacidade Total</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-calculator mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">
                {Math.round(salas.reduce((acc, sala) => acc + sala.capacidade, 0) / salas.length)}
              </div>
              <div className="stat-label">Média por Sala</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Excluir Sala"
        message={`Tem certeza que deseja excluir a Sala ${deleteModal.sala?.numero}? Esta acao nao pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, sala: null })}
      />
    </div>
  );
}
