export default function Footer() {
  return (
    <footer className="py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <i className="bi bi-film fs-3 me-2" style={{ color: '#e50914' }}></i>
              <span className="fw-bold fs-4" style={{ color: '#d4af37', letterSpacing: '1px' }}>CineWeb</span>
            </div>
            <small className="d-block mt-2 text-light opacity-75">
              Sistema de Gestão de Cinema
            </small>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
              <a href="#" className="text-light opacity-75">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-light opacity-75">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-light opacity-75">
                <i className="bi bi-twitter-x fs-5"></i>
              </a>
            </div>
            <small className="text-light opacity-50">
              &copy; {new Date().getFullYear()} CineWeb. Todos os direitos reservados.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
}
