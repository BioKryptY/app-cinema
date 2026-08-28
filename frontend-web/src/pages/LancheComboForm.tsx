import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LancheCombo } from '../types';
import { lancheComboSchema } from '../schemas';
import { buscarLancheCombo, criarLancheCombo, atualizarLancheCombo } from '../services/api';
import { formatarMoeda } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

interface FormData {
  nome: string;
  descricao: string;
  valorUnitario: number;
}

export default function LancheComboForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    valorUnitario: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      loadLancheCombo(id);
    }
  }, [id, isEditing]);

  async function loadLancheCombo(itemId: string) {
    try {
      setLoading(true);
      const item = await buscarLancheCombo(itemId);
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        valorUnitario: item.valorUnitario,
      });
    } catch {
      setError('Erro ao carregar o item do cardapio.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: name === 'valorUnitario' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev: { [key: string]: string }) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const result = lancheComboSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path !== undefined) {
          fieldErrors[path.toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await atualizarLancheCombo(id, result.data as LancheCombo);
      } else {
        await criarLancheCombo(result.data as LancheCombo);
      }

      navigate('/lanches-combos');
    } catch {
      setError('Erro ao salvar o item. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando item do cardapio..." />;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/lanches-combos')}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="mb-0">
                <i className="bi bi-cup-straw me-2 text-warning"></i>
                {isEditing ? 'Editar Item' : 'Novo Lanche ou Combo'}
              </h1>
              <p className="text-muted mb-0 small">
                {isEditing
                  ? 'Atualize as informacoes do item da bomboniere'
                  : 'Preencha os dados para incluir o item no cardapio'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          {/* Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Nome */}
                <div className="mb-4">
                  <label htmlFor="nome" className="form-label fw-semibold">
                    <i className="bi bi-tag me-1 text-warning"></i>
                    Nome *
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.nome ? 'is-invalid' : ''}`}
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Combo Casal"
                  />
                  {errors.nome && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.nome}
                    </div>
                  )}
                </div>

                {/* Descricao */}
                <div className="mb-4">
                  <label htmlFor="descricao" className="form-label fw-semibold">
                    <i className="bi bi-card-text me-1 text-warning"></i>
                    Descricao *
                  </label>
                  <textarea
                    className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ex: Duas pipocas grandes acompanhadas de dois refrigerantes de 500ml."
                  />
                  {errors.descricao && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.descricao}
                    </div>
                  )}
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Minimo de 10 caracteres. Descreva o que acompanha o item.
                  </div>
                </div>

                {/* Valor unitario */}
                <div className="mb-4">
                  <label htmlFor="valorUnitario" className="form-label fw-semibold">
                    <i className="bi bi-cash-coin me-1 text-warning"></i>
                    Valor Unitario *
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">R$</span>
                    <input
                      type="number"
                      className={`form-control ${errors.valorUnitario ? 'is-invalid' : ''}`}
                      id="valorUnitario"
                      name="valorUnitario"
                      value={formData.valorUnitario || ''}
                      onChange={handleChange}
                      placeholder="Ex: 26.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.valorUnitario && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.valorUnitario}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {(formData.nome !== '' || formData.valorUnitario > 0) && (
                  <div className="alert alert-warning mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-eye me-2 fs-5"></i>
                      <div>
                        <strong>Pre-visualizacao:</strong>
                        <div className="mt-1">
                          {formData.nome || 'Item sem nome'} — {formatarMoeda(formData.valorUnitario || 0)} por unidade
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/lanches-combos')}
                    disabled={saving}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        {isEditing ? 'Atualizar' : 'Cadastrar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
