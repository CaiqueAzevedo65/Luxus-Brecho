import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChangeEmailSchema } from '../../schemas/user.schema';
import api from '../../services/api';
import { 
  FiArrowLeft, 
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle
} from 'react-icons/fi';
import './index.css';

const ConfigEmail = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const [formData, setFormData] = useState({
    novoEmail: '',
    senha: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      ChangeEmailSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      // ZodError tem a propriedade 'issues' ao invés de 'errors'
      const errorList = error.issues || error.errors;
      
      if (errorList && Array.isArray(errorList)) {
        const newErrors = {};
        errorList.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Erro de validação:', error);
        setErrors({ submit: 'Erro ao validar formulário' });
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Verifica se o novo email é diferente do atual
    if (formData.novoEmail.toLowerCase() === user.email.toLowerCase()) {
      setErrors({ novoEmail: 'O novo email deve ser diferente do atual' });
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await api.put(`/users/${user.id}/change-email`, {
        novo_email: formData.novoEmail,
        senha: formData.senha
      });

      setSuccessMessage('Email alterado com sucesso! Você será desconectado em 3 segundos...');
      
      // Desloga após 3 segundos
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Erro ao alterar email:', error);
      console.error('Resposta do servidor:', error.response?.data);
      
      if (error.response?.status === 401) {
        setErrors({ senha: 'Senha incorreta' });
      } else if (error.response?.status === 409) {
        setErrors({ novoEmail: 'Este email já está em uso' });
      } else {
        setErrors({ 
          submit: error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar email. Tente novamente.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="config-email-page">
      {/* Header */}
      <div className="config-email-header">
        <button onClick={() => navigate('/configuracoes')} className="back-button-email">
          <FiArrowLeft />
        </button>
        <h1>Alterar Email</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="config-email-content">
        <div className="email-card">
          <div className="email-card-header">
            <FiMail className="email-icon" />
            <div>
              <h2>Modificar Email de Cadastro</h2>
              <p>Atualize o email associado à sua conta</p>
            </div>
          </div>

          {/* Email Atual */}
          <div className="current-email-box">
            <label>Email Atual</label>
            <p>{user.email}</p>
          </div>

          {successMessage && (
            <div className="success-message-email">
              <p>{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="error-message-email">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="email-form">
            {/* Novo Email */}
            <div className="form-group-email">
              <label htmlFor="novoEmail">Novo Email *</label>
              <div className={`input-container-email ${errors.novoEmail ? 'input-error' : ''}`}>
                <FiMail className="input-icon-email" />
                <input
                  type="email"
                  id="novoEmail"
                  value={formData.novoEmail}
                  onChange={(e) => handleChange('novoEmail', e.target.value)}
                  placeholder="Digite o novo email"
                  disabled={loading}
                />
              </div>
              {errors.novoEmail && <span className="error-text-email">{errors.novoEmail}</span>}
            </div>

            {/* Senha para Confirmação */}
            <div className="form-group-email">
              <label htmlFor="senha">Senha Atual *</label>
              <div className={`input-container-email ${errors.senha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-email" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  value={formData.senha}
                  onChange={(e) => handleChange('senha', e.target.value)}
                  placeholder="Digite sua senha para confirmar"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-email"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.senha && <span className="error-text-email">{errors.senha}</span>}
              <small className="field-hint">Digite sua senha atual para confirmar a alteração</small>
            </div>

            {/* Warning Box */}
            <div className="warning-box-email">
              <FiAlertCircle />
              <div>
                <strong>Atenção!</strong>
                <p>Após alterar o email, você será desconectado e precisará fazer login novamente com o novo email.</p>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              className="submit-button-email"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigEmail;
