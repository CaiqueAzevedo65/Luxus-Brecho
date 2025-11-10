import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../contexts/ToastContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiUser } from 'react-icons/fi';
import './index.css';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, isLoading } = useAuthStore();
  const { success, error: showError } = useToastContext();
  const { validate } = useZodValidation(RegisterSchema);

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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await register({
      nome: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      senha: formData.senha,
      confirmarSenha: formData.confirmarSenha,
    });

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        success(`Conta criada com sucesso! 🎉\n\nEnviamos um email de confirmação para ${formData.email}. Verifique sua caixa de entrada!`);
        navigate('/login');
      } else {
        success('Conta criada com sucesso! 🎉');
        navigate('/login');
      }
    } else {
      showError(result.error || 'Erro ao criar conta. Tente novamente.');
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
    <div className="registro-page">
      {/* Header */}
      <div className="registro-header">
        <button onClick={() => navigate('/login')} className="back-button-registro">
          <FiArrowLeft />
        </button>
        <h1>Criar Conta</h1>
      </div>

      <div className="registro-content">
        {/* Logo */}
        <div className="registro-logo">
          <h2 className="logo-text-registro">LUXUS</h2>
          <p className="logo-subtext-registro">BRECHÓ</p>
          <p className="welcome-text-registro">Crie sua conta</p>
        </div>

        {/* Formulário */}
        <form className="registro-form" onSubmit={handleRegister}>
          <div className="form-group-registro">
            <label htmlFor="nome">Nome *</label>
            <div className={`input-container-registro ${errors.nome ? 'input-error' : ''}`}>
              <FiUser className="input-icon-registro" />
              <input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite seu nome completo"
                autoComplete="name"
              />
            </div>
            {errors.nome && <p className="error-text-registro">{errors.nome}</p>}
          </div>

          <div className="form-group-registro">
            <label htmlFor="email">Email *</label>
            <div className={`input-container-registro ${errors.email ? 'input-error' : ''}`}>
              <FiMail className="input-icon-registro" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite seu email"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="error-text-registro">{errors.email}</p>}
          </div>

          <div className="form-group-registro">
            <label htmlFor="senha">Senha *</label>
            <div className={`input-container-registro ${errors.senha ? 'input-error' : ''}`}>
              <FiLock className="input-icon-registro" />
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-registro"
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.senha && <p className="error-text-registro">{errors.senha}</p>}
          </div>

          <div className="form-group-registro">
            <label htmlFor="confirmarSenha">Confirmar Senha *</label>
            <div className={`input-container-registro ${errors.confirmarSenha ? 'input-error' : ''}`}>
              <FiLock className="input-icon-registro" />
              <input
                id="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-registro"
                aria-label="Mostrar/ocultar confirmação de senha"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmarSenha && <p className="error-text-registro">{errors.confirmarSenha}</p>}
          </div>

          <button
            type="submit"
            className="registro-button"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div className="login-link-container">
            <p>Já tem uma conta? </p>
            <Link to="/login" className="login-link-registro">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
