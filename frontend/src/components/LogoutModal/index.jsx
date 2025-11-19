import React from 'react';
import './index.css';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="logout-modal-title">Tem certeza que deseja sair?</h3>
        
        <div className="logout-modal-buttons">
          <button 
            className="logout-modal-btn logout-modal-btn-confirm"
            onClick={onConfirm}
          >
            OK
          </button>
          <button 
            className="logout-modal-btn logout-modal-btn-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
