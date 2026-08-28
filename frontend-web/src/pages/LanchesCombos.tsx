import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LancheCombo } from '../types';
import { buscarLanchesCombos, excluirLancheCombo } from '../services/api';
import { formatarMoeda } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';

export default function LanchesCombos() {
  const [itens, setItens] = useState<LancheCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; item: LancheCombo | null }>({
    show: false,
    item: null,
  });

  useEffect(() => {
    loadItens();
  }, []);

  async function loadItens() {
    try {
      setLoading(true);
      const data = await buscarLanchesCombos();
      setItens(data);
      setError(null);
    } catch {
      setError('Erro ao carregar lanches e combos. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.item?.id) return;

    try {
      await excluirLancheCombo(deleteModal.item.id);
      setItens(itens.filter(i => i.id !== deleteModal.item?.id));
      setSuccess('Item removido do cardapio com sucesso!');
      setDeleteModal({ show: false, item: null });
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Erro ao remover o item do cardapio.');
    }
  }

  const valorMedio = itens.length > 0
    ? itens.reduce((acumulado, item) => acumulado + item.valorUnitario, 0) / itens.length
    : 0;

  if (loading) {
    return <LoadingSpinner message="Carregando lanches e combos..." />;
  }

  return (
    <div className="container py-4">
      {/* Header com estilo Premium */}
      <div className="page-header mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 className="mb-1 d-flex align-items-center">
              <i className="bi bi-cup-straw me-3" style={{ color: '#d4af37' }}></i>
              Lanches e Combos
            </h1>
            <p className="mb-0 opacity-75">Gerencie o cardapio da bomboniere</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/lanches-combos/novo" className="btn btn-warning">
              <i className="bi bi-plus-lg me-1"></i>
              Novo Item
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Empty State - Estilo Premium */}
      {itens.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-cup"></i>
          <h5>Nenhum lanche ou combo cadastrado</h5>
          <p>Cadastre os itens da bomboniere para vende-los junto com os ingressos.</p>
          <Link to="/lanches-combos/novo" className="btn btn-warning">
            <i className="bi bi-plus-lg me-1"></i>
            Cadastrar Item
          </Link>
        </div>
      )}

      {/* Cardapio */}
      {itens.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {itens.map(item => (
            <div key={item.id} className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div
                      className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '56px', height: '56px' }}
                    >
                      <i className="bi bi-cup-straw text-warning" style={{ fontSize: '1.75rem' }}></i>
                    </div>
                    <span className="ticket-badge">{formatarMoeda(item.valorUnitario)}</span>
                  </div>
                  <h5 className="card-title mb-2">{item.nome}</h5>
                  <p className="card-text text-muted small mb-0">{item.descricao}</p>
                </div>
                <div className="card-footer bg-transparent border-0 pb-3">
                  <div className="d-flex gap-2 justify-content-end">
                    <Link
                      to={`/lanches-combos/editar/${item.id}`}
                      className="btn btn-outline-warning btn-sm"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setDeleteModal({ show: true, item })}
                      title="Remover do cardapio"
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

      {/* Stats Cards - Estilo Premium */}
      {itens.length > 0 && (
        <div className="row g-4 mt-2">
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-list-ul mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{itens.length}</div>
              <div className="stat-label">Itens no Cardapio</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-tag mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">{formatarMoeda(valorMedio)}</div>
              <div className="stat-label">Valor Medio</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <i className="bi bi-cash-coin mb-2" style={{ fontSize: '2rem', color: '#d4af37' }}></i>
              <div className="stat-number">
                {formatarMoeda(Math.max(...itens.map(item => item.valorUnitario)))}
              </div>
              <div className="stat-label">Item Mais Caro</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Remover do Cardapio"
        message={`Tem certeza que deseja remover "${deleteModal.item?.nome}" do cardapio? Pedidos ja registrados mantem o item e o valor cobrado na epoca.`}
        confirmText="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, item: null })}
      />
    </div>
  );
}
