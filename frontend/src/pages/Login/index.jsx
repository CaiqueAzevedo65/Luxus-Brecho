import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoginSchema, useZodValidation } from '../../schemas/auth.schema';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isLoading, error, clearError } = useAuthStore();
  const { validate } = useZodValidation(LoginSchema);

  const validateForm = () => {
    const result = validate(formData);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors || {});
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await login(formData);

    if (result.success) {
      alert('Login realizado com sucesso!');
      navigate('/');
    } else if (result.emailNotConfirmed) {
      if (window.confirm('Sua conta ainda não foi ativada. Deseja receber um novo email de confirmação?')) {
        navigate('/resend-confirmation', { state: { email: formData.email } });
      }
    } else {
      alert(error || 'Erro ao fazer login');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <div className="login-header">
        <button onClick={() => navigate('/')} className="back-button-login">
          <FiArrowLeft />
        </button>
        <h1>Entrar</h1>
      </div>

      <div className="login-content">
        {/* Logo */}
        <div className="login-logo">
          <h2 className="logo-text-login">LUXUS</h2>
          <p className="logo-subtext-login">BRECHÓ</p>
          <p className="welcome-text-login">Bem-vindo de volta!</p>
        </div>

        {/* Formulário */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group-login">
            <label htmlFor="email">Email *</label>
            <div className={`input-container-login ${errors.email ? 'input-error' : ''}`}>
              <FiMail className="input-icon-login" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite seu email"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="error-text-login">{errors.email}</p>}
          </div>

          <div className="form-group-login">
            <label htmlFor="senha">Senha *</label>
            <div className={`input-container-login ${errors.senha ? 'input-error' : ''}`}>
              <FiLock className="input-icon-login" />
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-login"
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.senha && <p className="error-text-login">{errors.senha}</p>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="register-link-container">
            <p>Não tem uma conta? </p>
            <Link to="/registro" className="register-link-login">
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
