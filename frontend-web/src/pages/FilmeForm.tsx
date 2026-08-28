import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Filme } from '../types';
import { filmeSchema } from '../schemas';
import { buscarFilme, criarFilme, atualizarFilme } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

interface FormData {
  titulo: string;
  sinopse: string;
  classificacao: string;
  duracao: number;
  genero: string;
  dataInicio: string;
  dataFim: string;
}

export default function FilmeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    sinopse: '',
    classificacao: '',
    duracao: 0,
    genero: '',
    dataInicio: '',
    dataFim: '',
  });

  const classificacoes = [
    { value: 'L', label: 'Livre' },
    { value: '10', label: '10 anos' },
    { value: '12', label: '12 anos' },
    { value: '14', label: '14 anos' },
    { value: '16', label: '16 anos' },
    { value: '18', label: '18 anos' },
  ];

  const generos = [
    'Acao',
    'Aventura',
    'Animacao',
    'Comedia',
    'Drama',
    'Documentario',
    'Fantasia',
    'Ficcao Cientifica',
    'Musical',
    'Romance',
    'Suspense',
    'Terror',
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadFilme(id);
    }
  }, [id, isEditing]);

  async function loadFilme(filmeId: string) {
    try {
      setLoading(true);
      const filme = await buscarFilme(filmeId);
      setFormData({
        titulo: filme.titulo,
        sinopse: filme.sinopse,
        classificacao: filme.classificacao,
        duracao: filme.duracao,
        genero: filme.genero,
        dataInicio: filme.dataInicio,
        dataFim: filme.dataFim,
      });
    } catch {
      setError('Erro ao carregar filme.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: name === 'duracao' ? (value === '' ? 0 : parseInt(value)) : value,
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

    const result = filmeSchema.safeParse(formData);

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
        await atualizarFilme(id, result.data as Filme);
      } else {
        await criarFilme(result.data as Filme);
      }

      navigate('/filmes');
    } catch {
      setError('Erro ao salvar filme. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando filme..." />;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/filmes')}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="mb-0">
                <i className="bi bi-camera-reels me-2" style={{ color: '#e50914' }}></i>
                {isEditing ? 'Editar Filme' : 'Novo Filme'}
              </h1>
              <p className="text-muted mb-0 small">
                {isEditing ? 'Atualize as informações do filme' : 'Preencha os dados para cadastrar um novo filme'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          {/* Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Título */}
                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label fw-semibold">
                    <i className="bi bi-type me-1" style={{ color: '#d4af37' }}></i>
                    Título *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Digite o título do filme"
                  />
                  {errors.titulo && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.titulo}
                    </div>
                  )}
                </div>

                {/* Sinopse */}
                <div className="mb-3">
                  <label htmlFor="sinopse" className="form-label fw-semibold">
                    <i className="bi bi-text-paragraph me-1" style={{ color: '#d4af37' }}></i>
                    Sinopse *
                  </label>
                  <textarea
                    className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`}
                    id="sinopse"
                    name="sinopse"
                    rows={4}
                    value={formData.sinopse}
                    onChange={handleChange}
                    placeholder="Digite a sinopse do filme (mínimo 10 caracteres)"
                  />
                  {errors.sinopse && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.sinopse}
                    </div>
                  )}
                </div>

                <div className="row">
                  {/* Gênero */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="genero" className="form-label fw-semibold">
                      <i className="bi bi-tag me-1" style={{ color: '#d4af37' }}></i>
                      Gênero *
                    </label>
                    <select
                      className={`form-select ${errors.genero ? 'is-invalid' : ''}`}
                      id="genero"
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                    >
                      <option value="">Selecione o gênero</option>
                      {generos.map(genero => (
                        <option key={genero} value={genero}>{genero}</option>
                      ))}
                    </select>
                    {errors.genero && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.genero}
                      </div>
                    )}
                  </div>

                  {/* Classificação */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="classificacao" className="form-label fw-semibold">
                      <i className="bi bi-person-check me-1" style={{ color: '#d4af37' }}></i>
                      Classificação Indicativa *
                    </label>
                    <select
                      className={`form-select ${errors.classificacao ? 'is-invalid' : ''}`}
                      id="classificacao"
                      name="classificacao"
                      value={formData.classificacao}
                      onChange={handleChange}
                    >
                      <option value="">Selecione a classificação</option>
                      {classificacoes.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    {errors.classificacao && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.classificacao}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duração */}
                <div className="mb-3">
                  <label htmlFor="duracao" className="form-label fw-semibold">
                    <i className="bi bi-clock me-1" style={{ color: '#d4af37' }}></i>
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.duracao ? 'is-invalid' : ''}`}
                    id="duracao"
                    name="duracao"
                    value={formData.duracao || ''}
                    onChange={handleChange}
                    placeholder="Ex: 120"
                    min="1"
                  />
                  {errors.duracao && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.duracao}
                    </div>
                  )}
                </div>

                <div className="row">
                  {/* Data Início */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dataInicio" className="form-label fw-semibold">
                      <i className="bi bi-calendar-event me-1" style={{ color: '#d4af37' }}></i>
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.dataInicio ? 'is-invalid' : ''}`}
                      id="dataInicio"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                    />
                    {errors.dataInicio && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.dataInicio}
                      </div>
                    )}
                  </div>

                  {/* Data Fim */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dataFim" className="form-label fw-semibold">
                      <i className="bi bi-calendar-check me-1" style={{ color: '#d4af37' }}></i>
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.dataFim ? 'is-invalid' : ''}`}
                      id="dataFim"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                    />
                    {errors.dataFim && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.dataFim}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/filmes')}
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
