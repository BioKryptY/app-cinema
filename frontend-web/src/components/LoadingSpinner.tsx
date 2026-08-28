interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Carregando...' }: LoadingSpinnerProps) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p className="text-muted mb-0">{message}</p>
    </div>
  );
}
