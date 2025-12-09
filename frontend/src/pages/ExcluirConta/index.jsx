import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  FiArrowLeft, 
  FiAlertTriangle, 
  FiXCircle, 
  FiInfo, 
  FiMail,
  FiTrash2 
} from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import './index.css';

const ExcluirConta = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { error: showError } = useToastContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return null;
  }

  const handleDeleteRequest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const result = await authService.requestAccountDeletion(user.id);

      if (result.success) {
        // Navega para a tela de inserir código
        navigate('/configuracoes/excluir/codigo', { 
          state: { userId: user.id, email: user.email } 
        });
      } else {
        showError(result.error || 'Erro ao solicitar exclusão');
      }
    } catch (err) {
      showError('Erro ao solicitar exclusão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excluir-conta-page">
      {/* Header */}
      <div className="excluir-header">
        <button onClick={() => navigate('/configuracoes')} className="back-button-excluir">
          <FiArrowLeft />
        </button>
        <h1>Excluir Conta</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="excluir-content">
        {/* Warning Icon */}
        <div className="excluir-icon-container">
          <FiAlertTriangle className="excluir-warning-icon" />
        </div>

        {/* Title */}
        <h2 className="excluir-title">Tem certeza?</h2>

        {/* Description */}
        <p className="excluir-description">
          Ao excluir sua conta, você perderá permanentemente:
        </p>

        {/* List of consequences */}
        <div className="excluir-consequences">
          <div className="consequence-item">
            <FiXCircle className="consequence-icon" />
            <span>Todos os seus dados pessoais</span>
          </div>
          <div className="consequence-item">
            <FiXCircle className="consequence-icon" />
            <span>Histórico de compras e favoritos</span>
          </div>
          <div className="consequence-item">
            <FiXCircle className="consequence-icon" />
            <span>Acesso à sua conta</span>
          </div>
        </div>

        {/* Info box */}
        <div className="excluir-info-box">
          <FiInfo className="info-box-icon" />
          <p>
            Após solicitar a exclusão, você receberá um código de 6 dígitos 
            no seu email para confirmar a ação. O código será válido por 30 minutos.
          </p>
        </div>

        {/* User email */}
        <div className="excluir-email-box">
          <FiMail className="email-box-icon" />
          <p>
            O código será enviado para: <strong>{user.email}</strong>
          </p>
        </div>

        {/* Delete button */}
        <button
          className={`excluir-button ${loading ? 'loading' : ''}`}
          onClick={handleDeleteRequest}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-excluir"></span>
          ) : (
            <>
              <FiTrash2 />
              <span>Solicitar Exclusão</span>
            </>
          )}
        </button>

        {/* Cancel button */}
        <button
          className="excluir-cancel-button"
          onClick={() => navigate('/configuracoes')}
        >
          Cancelar
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Excluir Conta"
        message="Você está prestes a solicitar a exclusão da sua conta. Um código de verificação será enviado para seu email. Deseja continuar?"
        confirmText="Continuar"
        cancelText="Cancelar"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default ExcluirConta;
