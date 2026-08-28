import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Sessao, Filme, Sala } from '../types';
import { sessaoSchema } from '../schemas';
import { buscarSessao, criarSessao, atualizarSessao, buscarFilmes, buscarSalas } from '../services/api';
import { mesmoId } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

interface FormData {
  filmeId: string;
  salaId: string;
  dataHora: string;
  precoBase: number;
}

export default function SessaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);

  const [formData, setFormData] = useState<FormData>({
    filmeId: '',
    salaId: '',
    dataHora: '',
    precoBase: 30,
  });

  const loadDependencies = useCallback(async () => {
    try {
      setLoading(true);
      const [filmesData, salasData] = await Promise.all([
        buscarFilmes(),
        buscarSalas(),
      ]);
      setFilmes(filmesData);
      setSalas(salasData);

      if (isEditing && id) {
        const sessao = await buscarSessao(id);
        setFormData({
          filmeId: sessao.filmeId,
          salaId: sessao.salaId,
          dataHora: sessao.dataHora,
          precoBase: sessao.precoBase,
        });
      }
    } catch {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [isEditing, id]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: name === 'precoBase' ? (value === '' ? 0 : parseFloat(value)) : value,
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

    const result = sessaoSchema.safeParse(formData);

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
        await atualizarSessao(id, result.data as Sessao);
      } else {
        await criarSessao(result.data as Sessao);
      }

      navigate('/sessoes');
    } catch {
      setError('Erro ao salvar sessao. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const selectedFilme = filmes.find(f => mesmoId(f.id, formData.filmeId));
  const selectedSala = salas.find(s => mesmoId(s.id, formData.salaId));

  if (loading) {
    return <LoadingSpinner message="Carregando dados..." />;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/sessoes')}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="mb-0">
                <i className="bi bi-calendar-event me-2 text-warning"></i>
                {isEditing ? 'Editar Sessao' : 'Nova Sessao'}
              </h1>
              <p className="text-muted mb-0 small">
                {isEditing ? 'Atualize as informacoes da sessao' : 'Agende uma nova sessao de exibicao'}
              </p>
            </div>
          </div>

          {/* Warnings */}
          {filmes.length === 0 && (
            <AlertMessage
              type="warning"
              message="Nenhum filme cadastrado. Cadastre um filme primeiro para criar sessoes."
            />
          )}
          {salas.length === 0 && (
            <AlertMessage
              type="warning"
              message="Nenhuma sala cadastrada. Cadastre uma sala primeiro para criar sessoes."
            />
          )}

          {/* Error Alert */}
          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          {/* Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Filme Select */}
                <div className="mb-4">
                  <label htmlFor="filmeId" className="form-label fw-semibold">
                    <i className="bi bi-film me-1" style={{ color: '#e50914' }}></i>
                    Filme *
                  </label>
                  <select
                    className={`form-select ${errors.filmeId ? 'is-invalid' : ''}`}
                    id="filmeId"
                    name="filmeId"
                    value={formData.filmeId || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecione um filme</option>
                    {filmes.map(filme => (
                      <option key={filme.id} value={filme.id}>
                        {filme.titulo} ({filme.duracao} min) - {filme.genero}
                      </option>
                    ))}
                  </select>
                  {errors.filmeId && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.filmeId}
                    </div>
                  )}
                  {selectedFilme && (
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      {selectedFilme.sinopse.substring(0, 100)}...
                    </div>
                  )}
                </div>

                {/* Sala Select */}
                <div className="mb-4">
                  <label htmlFor="salaId" className="form-label fw-semibold">
                    <i className="bi bi-door-open me-1 text-success"></i>
                    Sala *
                  </label>
                  <select
                    className={`form-select ${errors.salaId ? 'is-invalid' : ''}`}
                    id="salaId"
                    name="salaId"
                    value={formData.salaId || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecione uma sala</option>
                    {salas.map(sala => (
                      <option key={sala.id} value={sala.id}>
                        Sala {sala.numero} - Capacidade: {sala.capacidade} lugares
                      </option>
                    ))}
                  </select>
                  {errors.salaId && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.salaId}
                    </div>
                  )}
                </div>

                <div className="row">
                  {/* Data e Hora */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="dataHora" className="form-label fw-semibold">
                      <i className="bi bi-calendar-clock me-1 text-warning"></i>
                      Data e Horario *
                    </label>
                    <input
                      type="datetime-local"
                      className={`form-control ${errors.dataHora ? 'is-invalid' : ''}`}
                      id="dataHora"
                      name="dataHora"
                      value={formData.dataHora}
                      onChange={handleChange}
                    />
                    {errors.dataHora && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.dataHora}
                      </div>
                    )}
                  </div>

                  {/* Preco Base */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="precoBase" className="form-label fw-semibold">
                      <i className="bi bi-currency-dollar me-1 text-success"></i>
                      Preco Base (R$) *
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.precoBase ? 'is-invalid' : ''}`}
                      id="precoBase"
                      name="precoBase"
                      value={formData.precoBase || ''}
                      onChange={handleChange}
                      placeholder="Ex: 30.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.precoBase && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.precoBase}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Meia-entrada: R$ {(formData.precoBase / 2).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                {selectedFilme && selectedSala && formData.dataHora && (
                  <div className="alert alert-warning mb-4">
                    <h6 className="alert-heading">
                      <i className="bi bi-eye me-2"></i>
                      Pre-visualizacao da Sessao
                    </h6>
                    <hr />
                    <div className="row">
                      <div className="col-sm-6">
                        <strong>Filme:</strong> {selectedFilme.titulo}
                        <br />
                        <strong>Sala:</strong> {selectedSala.numero} ({selectedSala.capacidade} lugares)
                      </div>
                      <div className="col-sm-6">
                        <strong>Data/Hora:</strong> {new Date(formData.dataHora).toLocaleString('pt-BR')}
                        <br />
                        <strong>Preco:</strong> R$ {formData.precoBase.toFixed(2)} (Meia: R$ {(formData.precoBase / 2).toFixed(2)})
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/sessoes')}
                    disabled={saving}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={saving || filmes.length === 0 || salas.length === 0}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        {isEditing ? 'Atualizar' : 'Agendar'}
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
