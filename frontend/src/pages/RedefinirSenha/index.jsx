import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { z } from 'zod';
import api from '../../services/api';
import './index.css';

const RedefinirSenha = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    novaSenha: false,
    confirmarSenha: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
    }
  }, [token]);

  const ResetPasswordSchema = z.object({
    novaSenha: z
      .string()
      .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres'),
    confirmarSenha: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  }).refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha'],
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    try {
      ResetPasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const errorList = error.issues || error.errors;
      
      if (errorList && Array.isArray(errorList)) {
        const newErrors = {};
        errorList.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.post('/users/reset-password', {
        token: token,
        nova_senha: formData.novaSenha
      });

      setSuccess(true);

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Token inválido ou expirado';
        if (message.includes('Token') || message.includes('expirado')) {
          setTokenInvalid(true);
        } else {
          setErrors({ submit: message });
        }
      } else {
        setErrors({ submit: 'Erro ao redefinir senha. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenInvalid) {
    return (
      <div className="redefinir-senha-page">
        <div className="redefinir-senha-content">
          <div className="redefinir-senha-card">
            <div className="error-icon-redefinir">
              <FiLock />
            </div>
            
            <h2>Link Inválido ou Expirado</h2>
            
            <p className="error-description-redefinir">
              O link de recuperação de senha é inválido ou já expirou.
            </p>

            <p className="error-hint-redefinir">
              Links de recuperação são válidos por apenas 1 hora por motivos de segurança.
            </p>

            <button
              onClick={() => navigate('/esqueci-senha')}
              className="back-button-redefinir"
            >
              Solicitar Novo Link
            </button>

            <button
              onClick={() => navigate('/login')}
              className="login-button-redefinir"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="redefinir-senha-page">
        <div className="redefinir-senha-content">
          <div className="redefinir-senha-card">
            <div className="success-icon-redefinir">
              <FiCheckCircle />
            </div>
            
            <h2>Senha Redefinida!</h2>
            
            <p className="success-description-redefinir">
              Sua senha foi alterada com sucesso!
            </p>

            <p className="success-hint-redefinir">
              Você será redirecionado para a página de login em instantes...
            </p>

            <button
              onClick={() => navigate('/login')}
              className="login-now-button-redefinir"
            >
              Ir para Login Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="redefinir-senha-page">
      <div className="redefinir-senha-content">
        <div className="redefinir-senha-card">
          <div className="redefinir-senha-icon">
            <FiLock />
          </div>

          <h2>Redefinir Senha</h2>
          <p className="redefinir-senha-description">
            Digite sua nova senha abaixo
          </p>

          {errors.submit && (
            <div className="error-message-redefinir">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="redefinir-senha-form">
            {/* Nova Senha */}
            <div className="form-group-redefinir">
              <label htmlFor="novaSenha">Nova Senha *</label>
              <div className={`input-container-redefinir ${errors.novaSenha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-redefinir" />
                <input
                  type={showPasswords.novaSenha ? 'text' : 'password'}
                  id="novaSenha"
                  value={formData.novaSenha}
                  onChange={(e) => handleChange('novaSenha', e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle-redefinir"
                  onClick={() => togglePasswordVisibility('novaSenha')}
                  disabled={loading}
                >
                  {showPasswords.novaSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.novaSenha && <span className="error-text-redefinir">{errors.novaSenha}</span>}
            </div>

            {/* Confirmar Senha */}
            <div className="form-group-redefinir">
              <label htmlFor="confirmarSenha">Confirmar Nova Senha *</label>
              <div className={`input-container-redefinir ${errors.confirmarSenha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-redefinir" />
                <input
                  type={showPasswords.confirmarSenha ? 'text' : 'password'}
                  id="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-redefinir"
                  onClick={() => togglePasswordVisibility('confirmarSenha')}
                  disabled={loading}
                >
                  {showPasswords.confirmarSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmarSenha && <span className="error-text-redefinir">{errors.confirmarSenha}</span>}
            </div>

            <button
              type="submit"
              className="submit-button-redefinir"
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
