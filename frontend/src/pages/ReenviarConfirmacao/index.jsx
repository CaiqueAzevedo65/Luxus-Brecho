import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useToastContext } from '../../contexts/ToastContext';
import { FiArrowLeft, FiMail, FiSend } from 'react-icons/fi';
import './index.css';

const ReenviarConfirmacao = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      const result = await authService.resendConfirmationEmail(email.trim().toLowerCase());

      if (result.success) {
        showSuccess('Email de confirmação enviado! Verifique sua caixa de entrada.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showError(result.error || 'Não foi possível reenviar o email');
      }
    } catch (error) {
      showError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  return (
    <div className="reenviar-page">
      {/* Header */}
      <div className="reenviar-header">
        <button onClick={() => navigate(-1)} className="back-button-reenviar">
          <FiArrowLeft />
        </button>
        <h1>Reenviar Confirmação</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="reenviar-content">
        {/* Icon */}
        <div className="reenviar-icon-container">
          <FiMail className="reenviar-icon" />
        </div>

        {/* Title */}
        <h2 className="reenviar-title">Confirme seu email</h2>

        {/* Description */}
        <p className="reenviar-description">
          Digite seu email para receber um novo link de confirmação
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="reenviar-form">
          <div className="form-group-reenviar">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Digite seu email"
                className={emailError ? 'input-error' : ''}
                autoComplete="email"
                autoFocus
              />
            </div>
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          <button
            type="submit"
            className={`reenviar-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-reenviar"></span>
            ) : (
              <>
                <FiSend />
                <span>Reenviar Email</span>
              </>
            )}
          </button>
        </form>

        {/* Back to login */}
        <button
          className="back-to-login"
          onClick={() => navigate('/login')}
        >
          Voltar para o Login
        </button>
      </div>
    </div>
  );
};

export default ReenviarConfirmacao;
