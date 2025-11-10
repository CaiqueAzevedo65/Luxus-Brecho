import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../contexts/ToastContext';
import { RegisterSchema } from '../../schemas/auth.schema';
import './index.css';

const RegistroAdmin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError, info } = useToastContext();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Verificar se o usuário logado é admin
  useEffect(() => {
    console.log('=== DEBUG AUTENTICAÇÃO ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user.tipo:', user?.tipo);
    
    if (!isAuthenticated || !user) {
      info('Você precisa estar logado como administrador para acessar esta página.');
      navigate('/login');
      return;
    }

    if (user.tipo !== 'Administrador') {
      showError('Apenas administradores podem criar novos usuários administradores.');
      navigate('/perfil');
      return;
    }
    
    console.log('✅ Usuário é administrador, acesso permitido');
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    try {
      RegisterSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await api.post('/users', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        tipo: 'Administrador' // Força o tipo como Administrador
      });

      setSuccessMessage('Administrador criado com sucesso! Um email de confirmação foi enviado.');
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 3000);

    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else if (error.response?.status === 400) {
        setErrors({ submit: 'Email já cadastrado ou dados inválidos.' });
      } else {
        setErrors({ submit: 'Erro ao criar administrador. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-admin-page">
      {/* Header */}
      <div className="registro-admin-header">
        <button onClick={() => navigate('/perfil')} className="back-button-admin">
          <FiArrowLeft />
        </button>
        <div className="header-content-admin">
          <FiShield className="admin-icon" />
          <h1>Criar Administrador</h1>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="registro-admin-content">
        <div className="registro-admin-card">
          <div className="card-header-admin">
            <FiShield className="shield-icon" />
            <h2>Novo Usuário Administrador</h2>
            <p>Preencha os dados para criar um novo administrador</p>
          </div>

          {successMessage && (
            <div className="success-message-admin">
              <p>{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="error-message-admin">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-admin-form">
            {/* Nome */}
            <div className="form-group-admin">
              <label htmlFor="nome">Nome Completo</label>
              <div className={`input-container-admin ${errors.nome ? 'input-error' : ''}`}>
                <FiUser className="input-icon-admin" />
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome completo"
                  disabled={loading}
                />
              </div>
              {errors.nome && <span className="error-text-admin">{errors.nome}</span>}
            </div>

            {/* Email */}
            <div className="form-group-admin">
              <label htmlFor="email">Email</label>
              <div className={`input-container-admin ${errors.email ? 'input-error' : ''}`}>
                <FiMail className="input-icon-admin" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Digite o email"
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="error-text-admin">{errors.email}</span>}
            </div>

            {/* Senha */}
            <div className="form-group-admin">
              <label htmlFor="senha">Senha</label>
              <div className={`input-container-admin ${errors.senha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-admin" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite a senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-admin"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.senha && <span className="error-text-admin">{errors.senha}</span>}
            </div>

            {/* Confirmar Senha */}
            <div className="form-group-admin">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <div className={`input-container-admin ${errors.confirmarSenha ? 'input-error' : ''}`}>
                <FiLock className="input-icon-admin" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Confirme a senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-admin"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmarSenha && <span className="error-text-admin">{errors.confirmarSenha}</span>}
            </div>

            {/* Info Box */}
            <div className="info-box-admin">
              <FiShield />
              <p>Este usuário terá permissões de administrador e receberá um email de confirmação específico.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button-admin"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Administrador'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroAdmin;
