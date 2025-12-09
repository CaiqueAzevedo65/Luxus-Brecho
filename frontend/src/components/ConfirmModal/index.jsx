import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './index.css';

const ConfirmModal = ({ 
  isOpen, 
  title = 'Confirmar', 
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="confirm-modal-close" onClick={onCancel}>
          <FiX />
        </button>

        {/* Icon */}
        {isDestructive && (
          <div className="confirm-modal-icon destructive">
            <FiAlertTriangle />
          </div>
        )}

        {/* Title */}
        <h3 className="confirm-modal-title">{title}</h3>
        
        {/* Message */}
        <p className="confirm-modal-message">{message}</p>
        
        {/* Buttons */}
        <div className="confirm-modal-buttons">
          <button 
            className="confirm-modal-btn confirm-modal-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-modal-btn-confirm ${isDestructive ? 'destructive' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
