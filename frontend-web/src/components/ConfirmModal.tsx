interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onCancel}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                <i className="bi bi-x-lg me-1"></i>
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={onConfirm}
              >
                <i className="bi bi-check-lg me-1"></i>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
