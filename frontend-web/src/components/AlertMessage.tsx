interface AlertMessageProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  const iconMap = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill',
  };

  return (
    <div className={`alert alert-${type} alert-dismissible fade show d-flex align-items-center`} role="alert">
      <i className={`bi ${iconMap[type]} me-2`}></i>
      <div>{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Fechar"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
}
