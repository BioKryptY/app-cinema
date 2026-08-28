import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container py-5">
      <div className="row align-items-center mb-5">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="text-center text-lg-start">
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#1a1a2e' }}>
              <i className="bi bi-film me-3" style={{ color: '#e50914' }}></i>
              CineWeb
            </h1>
            <p className="lead text-muted mb-4">
              Sistema de Gestão de Cinema completo para gerenciar filmes, salas,
              sessões, bomboniere e a venda de ingressos.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
              <Link to="/filmes" className="btn btn-dark btn-lg">
                <i className="bi bi-camera-reels me-2"></i>
                Ver Filmes
              </Link>
              <Link to="/sessoes" className="btn btn-warning btn-lg">
                <i className="bi bi-calendar-event me-2"></i>
                Ver Sessões
              </Link>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="text-center">
            <div className="hero-cinema-card p-5 rounded-4 shadow-lg position-relative overflow-hidden"
                 style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
              <div className="position-absolute top-0 start-0 w-100 h-100"
                   style={{ background: 'radial-gradient(circle at 30% 20%, rgba(229, 9, 20, 0.15) 0%, transparent 50%)' }}></div>
              <div className="position-relative">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <i className="bi bi-film text-danger me-2" style={{ fontSize: '3rem' }}></i>
                  <i className="bi bi-camera-reels text-warning" style={{ fontSize: '5rem' }}></i>
                  <i className="bi bi-film text-danger ms-2" style={{ fontSize: '3rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #e50914 0%, #b8070f 100%)' }}>
                <i className="bi bi-camera-reels fs-4"></i>
              </div>
              <h5 className="card-title">Filmes</h5>
              <p className="card-text text-muted small">
                Cadastre e gerencie o catálogo de filmes em cartaz com todas as informações.
              </p>
              <Link to="/filmes" className="btn btn-sm btn-outline-danger">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-success bg-gradient text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem' }}>
                <i className="bi bi-door-open fs-4"></i>
              </div>
              <h5 className="card-title">Salas</h5>
              <p className="card-text text-muted small">
                Configure as salas de exibição com capacidade máxima de público.
              </p>
              <Link to="/salas" className="btn btn-sm btn-outline-success">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-warning bg-gradient text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem' }}>
                <i className="bi bi-calendar-event fs-4"></i>
              </div>
              <h5 className="card-title">Sessões</h5>
              <p className="card-text text-muted small">
                Agende sessões combinando filmes, salas, datas e horários.
              </p>
              <Link to="/sessoes" className="btn btn-sm btn-outline-warning">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <i className="bi bi-ticket-perforated fs-4"></i>
              </div>
              <h5 className="card-title">Ingressos</h5>
              <p className="card-text text-muted small">
                Realize vendas de ingressos com opções de meia-entrada.
              </p>
              <Link to="/ingressos" className="btn btn-sm btn-dark">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)' }}>
                <i className="bi bi-cup-straw fs-4"></i>
              </div>
              <h5 className="card-title">Lanches e Combos</h5>
              <p className="card-text text-muted small">
                Monte o cardápio da bomboniere vendido junto com os ingressos.
              </p>
              <Link to="/lanches-combos" className="btn btn-sm btn-outline-warning">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body text-center p-4">
              <div className="feature-icon text-white rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                   style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)' }}>
                <i className="bi bi-receipt fs-4"></i>
              </div>
              <h5 className="card-title">Pedidos</h5>
              <p className="card-text text-muted small">
                Acompanhe cada venda fechada com ingressos, lanches e valor total.
              </p>
              <Link to="/pedidos" className="btn btn-sm btn-dark">
                Acessar <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
