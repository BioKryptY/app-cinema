import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { estaLogado, removerToken } from '../services/auth';

export default function Navbar() {
  useLocation(); // faz a barra se atualizar a cada troca de página (ex.: logo depois do login)
  const navigate = useNavigate();
  const logado = estaLogado();

  function sair() {
    removerToken();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-lg">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-film me-2 fs-3" style={{ color: '#e50914' }}></i>
          <span className="fw-bold" style={{ color: '#d4af37', letterSpacing: '1px' }}>CineWeb</span>
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/"
              >
                <i className="bi bi-house-door me-2"></i>
                Início
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/filmes"
              >
                <i className="bi bi-camera-reels me-2"></i>
                Filmes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/salas"
              >
                <i className="bi bi-door-open me-2"></i>
                Salas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/sessoes"
              >
                <i className="bi bi-calendar-event me-2"></i>
                Sessões
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/lanches-combos"
              >
                <i className="bi bi-cup-straw me-2"></i>
                Lanches
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/ingressos"
              >
                <i className="bi bi-ticket-perforated me-2"></i>
                Ingressos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 ${isActive ? 'active' : ''}`
                }
                to="/pedidos"
              >
                <i className="bi bi-receipt me-2"></i>
                Pedidos
              </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center ms-lg-2 mt-2 mt-lg-0">
              {logado ? (
                <button className="btn btn-outline-light btn-sm" onClick={sair}>
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Sair
                </button>
              ) : (
                <NavLink className="btn btn-warning btn-sm" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Entrar
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
