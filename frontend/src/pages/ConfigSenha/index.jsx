import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ChangePasswordSchema } from '../../schemas/user.schema';
import api from '../../services/api';
import { 
  FiArrowLeft, 
  FiLock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import './index.css';

const ConfigSenha = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmarNovaSenha: false
  });
  
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    try {
      ChangePasswordSchema.parse(formData);
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

    // Validação adicional: senha atual não pode ser igual à nova senha
    if (formData.senhaAtual === formData.novaSenha) {
      setErrors({ novaSenha: 'A nova senha deve ser diferente da senha atual' });
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const payload = {
        senha_atual: formData.senhaAtual,
        senha_nova: formData.novaSenha  // Backend espera 'senha_nova', não 'nova_senha'
      };

      console.log('Enviando payload:', payload);

      const response = await api.put(`/users/${user.id}/change-password`, payload);

      setSuccessMessage('Senha alterada com sucesso!');
      
      // Limpa formulário
      setFormData({
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
      });

      setTimeout(() => {
        navigate('/configuracoes');
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      console.error('Resposta do servidor:', error.response?.data);
      
      if (error.response?.status === 401) {
        setErrors({ senhaAtual: 'Senha atual incorreta' });
      } else {
        setErrors({ 
          submit: error.response?.data?.message || error.response?.data?.error || 'Erro ao alterar senha. Tente novamente.' 
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
    <div className="config-senha-page">
      {/* Header */}
      <div className="config-senha-header">
        <button onClick={() => navigate('/configuracoes')} className="back-button-senha">
          <FiArrowLeft />
        </button>
        <h1>Alterar Senha</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="config-senha-content">
        <div className="senha-card">
          <div className="senha-card-header">
            <FiLock className="senha-icon" />
            <div>
              <h2>Modificar Senha de Acesso</h2>
              <p>Crie uma senha forte para proteger sua conta</p>
            </div>
          </div>

          {successMessage && (
            <div className="success-message-senha">
              <p>{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="error-message-senha">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="senha-form">
            {/* Senha Atual */}
            <div className="form-group-senha">
              <label htmlFor="senhaAtual">Senha Atual *</label>
              <div className={`input-container-senha ${errors.senhaAtual ? 'input-error' : ''}`}>
                <FiLock className="input-icon-senha" />
                <input
                  type={showPasswords.senhaAtual ? 'text' : 'password'}
                  id="senhaAtual"
                  value={formData.senhaAtual}
                  onChange={(e) => handleChange('senhaAtual', e.target.value)}
                  placeholder="Digite sua senha atual"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-senha"
                  onClick={() => togglePasswordVisibility('senhaAtual')}
                  disabled={loading}
                >
                  {showPasswords.senhaAtual ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.senhaAtual && <span className="error-text-senha">{errors.senhaAtual}</span>}
            </div>

            {/* Nova Senha */}
            <div className="form-group-senha">
              <label htmlFor="novaSenha">Nova Senha *</label>
              <div className={`input-container-senha ${errors.novaSenha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-senha" />
                <input
                  type={showPasswords.novaSenha ? 'text' : 'password'}
                  id="novaSenha"
                  value={formData.novaSenha}
                  onChange={(e) => handleChange('novaSenha', e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-senha"
                  onClick={() => togglePasswordVisibility('novaSenha')}
                  disabled={loading}
                >
                  {showPasswords.novaSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.novaSenha && <span className="error-text-senha">{errors.novaSenha}</span>}
            </div>

            {/* Confirmar Nova Senha */}
            <div className="form-group-senha">
              <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha *</label>
              <div className={`input-container-senha ${errors.confirmarNovaSenha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-senha" />
                <input
                  type={showPasswords.confirmarNovaSenha ? 'text' : 'password'}
                  id="confirmarNovaSenha"
                  value={formData.confirmarNovaSenha}
                  onChange={(e) => handleChange('confirmarNovaSenha', e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-senha"
                  onClick={() => togglePasswordVisibility('confirmarNovaSenha')}
                  disabled={loading}
                >
                  {showPasswords.confirmarNovaSenha ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmarNovaSenha && <span className="error-text-senha">{errors.confirmarNovaSenha}</span>}
            </div>

            {/* Info Box */}
            <div className="info-box-senha">
              <FiLock />
              <p>Por segurança, você será desconectado após alterar a senha e precisará fazer login novamente.</p>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              className="submit-button-senha"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>

            {/* Link Esqueci Senha */}
            <div className="forgot-password-container-senha">
              <button
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="forgot-password-link-senha"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigSenha;
