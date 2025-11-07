import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import './index.css';

const EsqueciSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/users/forgot-password', {
        email: email.toLowerCase().trim()
      });

      setSuccess(true);
      setEmail('');

    } catch (err) {
      console.error('Erro ao solicitar recuperação de senha:', err);
      
      // Mesmo que o email não exista, mostramos mensagem genérica por segurança
      setSuccess(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-senha-page">
      {/* Header */}
      <div className="esqueci-senha-header">
        <button onClick={() => navigate(-1)} className="back-button-esqueci">
          <FiArrowLeft />
        </button>
        <h1>Recuperar Senha</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="esqueci-senha-content">
        <div className="esqueci-senha-card">
          {!success ? (
            <>
              <div className="esqueci-senha-icon">
                <FiMail />
              </div>

              <h2>Esqueceu sua senha?</h2>
              <p className="esqueci-senha-description">
                Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <div className="error-message-esqueci">
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="esqueci-senha-form">
                <div className="form-group-esqueci">
                  <label htmlFor="email">Email *</label>
                  <div className={`input-container-esqueci ${error ? 'input-error' : ''}`}>
                    <FiMail className="input-icon-esqueci" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Digite seu email"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button-esqueci"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>

              <div className="esqueci-senha-footer">
                <p>Lembrou sua senha?</p>
                <button onClick={() => navigate('/login')} className="link-button-esqueci">
                  Voltar para Login
                </button>
              </div>
            </>
          ) : (
            <div className="success-container-esqueci">
              <div className="success-icon-esqueci">
                <FiMail />
              </div>
              
              <h2>Email Enviado!</h2>
              
              <p className="success-description-esqueci">
                Se o email informado estiver cadastrado em nossa base, você receberá um link para redefinir sua senha.
              </p>

              <div className="info-box-esqueci">
                <FiAlertCircle />
                <div>
                  <strong>Não recebeu o email?</strong>
                  <ul>
                    <li>Verifique sua caixa de spam</li>
                    <li>Aguarde alguns minutos</li>
                    <li>Certifique-se de que digitou o email correto</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="back-login-button-esqueci"
              >
                Voltar para Login
              </button>

              <button
                onClick={() => setSuccess(false)}
                className="resend-button-esqueci"
              >
                Enviar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
