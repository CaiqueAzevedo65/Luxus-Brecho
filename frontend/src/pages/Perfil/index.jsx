import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FiUser, FiMail, FiCalendar, FiShield, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import './index.css';

const Perfil = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (!user) {
    return (
      <div className="perfil-loading">
        <div className="spinner-perfil"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      {/* Header */}
      <div className="perfil-header">
        <button onClick={() => navigate('/')} className="back-button-perfil">
          <FiArrowLeft />
        </button>
        <h1>Meu Perfil</h1>
      </div>

      <div className="perfil-content">
        {/* Avatar */}
        <div className="perfil-avatar-section">
          <div className="avatar-circle">
            <span className="avatar-initials">
              {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <h2 className="perfil-name">{user.nome}</h2>
          <p className="perfil-status">
            {user.email_confirmado ? (
              <span className="status-confirmed">✓ Email confirmado</span>
            ) : (
              <span className="status-pending">⚠ Email não confirmado</span>
            )}
          </p>
        </div>

        {/* Informações */}
        <div className="perfil-info-section">
          <h3>Informações da Conta</h3>

          <div className="info-card">
            <div className="info-item">
              <div className="info-icon">
                <FiUser />
              </div>
              <div className="info-details">
                <label>Nome</label>
                <p>{user.nome}</p>
              </div>
            </div>

            <div className="info-divider"></div>

            <div className="info-item">
              <div className="info-icon">
                <FiMail />
              </div>
              <div className="info-details">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="info-divider"></div>

            <div className="info-item">
              <div className="info-icon">
                <FiShield />
              </div>
              <div className="info-details">
                <label>Tipo de Conta</label>
                <p>{user.tipo}</p>
              </div>
            </div>

            <div className="info-divider"></div>

            <div className="info-item">
              <div className="info-icon">
                <FiCalendar />
              </div>
              <div className="info-details">
                <label>Membro desde</label>
                <p>{formatDate(user.data_criacao)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="perfil-actions">
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut />
            Sair da Conta
          </button>
        </div>

        {!user.email_confirmado && (
          <div className="perfil-warning">
            <p>
              <strong>Atenção:</strong> Seu email ainda não foi confirmado. 
              Verifique sua caixa de entrada para ativar sua conta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
