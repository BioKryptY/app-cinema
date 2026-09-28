import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fazerLogin } from '../services/auth';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // não deixa a página recarregar
    setError(null);

    try {
      setLoading(true);
      await fazerLogin(email, senha);
      navigate('/'); // deu certo: volta para o início
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="h4 mb-4 d-flex align-items-center">
            <i className="bi bi-person-lock me-2" style={{ color: '#d4af37' }}></i>
            Entrar
          </h1>

          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label">Senha</label>
              <input
                id="senha"
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-warning w-100" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
