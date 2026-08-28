import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Sala } from '../types';
import { salaSchema } from '../schemas';
import { buscarSala, criarSala, atualizarSala } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

interface FormData {
  numero: number;
  capacidade: number;
}

export default function SalaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    numero: 0,
    capacidade: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      loadSala(id);
    }
  }, [id, isEditing]);

  async function loadSala(salaId: string) {
    try {
      setLoading(true);
      const sala = await buscarSala(salaId);
      setFormData({
        numero: sala.numero,
        capacidade: sala.capacidade,
      });
    } catch {
      setError('Erro ao carregar sala.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value),
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

    const result = salaSchema.safeParse(formData);

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
        await atualizarSala(id, result.data as Sala);
      } else {
        await criarSala(result.data as Sala);
      }

      navigate('/salas');
    } catch {
      setError('Erro ao salvar sala. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando sala..." />;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/salas')}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="mb-0">
                <i className="bi bi-door-open me-2 text-success"></i>
                {isEditing ? 'Editar Sala' : 'Nova Sala'}
              </h1>
              <p className="text-muted mb-0 small">
                {isEditing ? 'Atualize as informacoes da sala' : 'Preencha os dados para cadastrar uma nova sala'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          {/* Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Numero */}
                <div className="mb-4">
                  <label htmlFor="numero" className="form-label fw-semibold">
                    <i className="bi bi-hash me-1 text-success"></i>
                    Numero da Sala *
                  </label>
                  <input
                    type="number"
                    className={`form-control form-control-lg ${errors.numero ? 'is-invalid' : ''}`}
                    id="numero"
                    name="numero"
                    value={formData.numero || ''}
                    onChange={handleChange}
                    placeholder="Ex: 1"
                    min="1"
                  />
                  {errors.numero && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.numero}
                    </div>
                  )}
                </div>

                {/* Capacidade */}
                <div className="mb-4">
                  <label htmlFor="capacidade" className="form-label fw-semibold">
                    <i className="bi bi-people me-1 text-success"></i>
                    Capacidade Maxima *
                  </label>
                  <input
                    type="number"
                    className={`form-control form-control-lg ${errors.capacidade ? 'is-invalid' : ''}`}
                    id="capacidade"
                    name="capacidade"
                    value={formData.capacidade || ''}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="1"
                  />
                  {errors.capacidade && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.capacidade}
                    </div>
                  )}
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Informe a quantidade maxima de pessoas que a sala comporta.
                  </div>
                </div>

                {/* Preview */}
                {(formData.numero > 0 || formData.capacidade > 0) && (
                  <div className="alert alert-success mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-eye me-2 fs-5"></i>
                      <div>
                        <strong>Pre-visualizacao:</strong>
                        <div className="mt-1">
                          Sala {formData.numero || '?'} com capacidade para {formData.capacidade || '?'} pessoas
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
                    onClick={() => navigate('/salas')}
                    disabled={saving}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
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
