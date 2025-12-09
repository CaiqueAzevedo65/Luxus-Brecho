import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FiCheckCircle, FiHome } from 'react-icons/fi';
import './index.css';

const ContaExcluida = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Garante que o usuário está deslogado
  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="conta-excluida-page">
      <div className="conta-excluida-content">
        {/* Success Icon */}
        <div className="excluida-icon-container">
          <FiCheckCircle className="excluida-check-icon" />
        </div>

        {/* Title */}
        <h1 className="excluida-title">Conta Excluída</h1>

        {/* Description */}
        <p className="excluida-description">
          Sua conta foi excluída com sucesso. Todos os seus dados foram removidos permanentemente.
        </p>

        {/* Additional Info */}
        <p className="excluida-info">
          Sentiremos sua falta! Se mudar de ideia, você sempre pode criar uma nova conta.
        </p>

        {/* Home Button */}
        <button
          className="excluida-home-button"
          onClick={() => navigate('/')}
        >
          <FiHome />
          <span>Voltar para a Home</span>
        </button>

        {/* Register Link */}
        <button
          className="excluida-register-button"
          onClick={() => navigate('/registro')}
        >
          Criar nova conta
        </button>
      </div>
    </div>
  );
};

export default ContaExcluida;
