import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  FiArrowLeft, 
  FiMail, 
  FiClock,
  FiAlertTriangle,
  FiTrash2 
} from 'react-icons/fi';
import './index.css';

const ExcluirContaCodigo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const { error: showError, success: showSuccess } = useToastContext();

  // Redireciona se não tiver os dados necessários
  useEffect(() => {
    if (!userId || !email) {
      navigate('/configuracoes/excluir');
    }
  }, [userId, email, navigate]);

  // Focus no primeiro input ao montar
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleCodeChange = (value, index) => {
    // Apenas números
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Move para próximo input se digitou um número
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length === 6) {
      // Cole do clipboard
      const digits = numericValue.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleConfirmDeletion = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      showError('Digite o código completo de 6 dígitos');
      return;
    }

    if (!userId) {
      showError('Erro: ID do usuário não encontrado');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmAccountDeletion(userId, fullCode);

      if (result.success) {
        navigate('/conta-excluida');
      } else {
        showError(result.error || 'Código inválido');
        // Limpa o código em caso de erro
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      showError('Erro ao confirmar exclusão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) return;

    setResending(true);

    try {
      const result = await authService.requestAccountDeletion(userId);

      if (result.success) {
        showSuccess('Novo código enviado para seu email');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showError(result.error || 'Erro ao reenviar código');
      }
    } catch (err) {
      showError('Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
    'seu email';

  const isCodeComplete = code.join('').length === 6;

  if (!userId || !email) {
    return null;
  }

  return (
    <div className="excluir-codigo-page">
      {/* Header */}
      <div className="excluir-codigo-header">
        <button onClick={() => navigate('/configuracoes/excluir')} className="back-button-codigo">
          <FiArrowLeft />
        </button>
        <h1>Confirmar Exclusão</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="excluir-codigo-content">
        {/* Ícone */}
        <div className="codigo-icon-container">
          <FiMail className="codigo-mail-icon" />
        </div>

        {/* Título */}
        <h2 className="codigo-title">Verifique seu Email</h2>

        {/* Descrição */}
        <p className="codigo-description">
          Enviamos um código de 6 dígitos para<br />
          <strong>{maskedEmail}</strong>
        </p>

        {/* Aviso de tempo */}
        <div className="codigo-warning">
          <FiClock className="warning-clock-icon" />
          <span>O código é válido por 30 minutos</span>
        </div>

        {/* Inputs do código */}
        <div className="codigo-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`codigo-input ${digit ? 'filled' : ''}`}
            />
          ))}
        </div>

        {/* Botão de confirmar */}
        <button
          className={`codigo-confirm-button ${loading || !isCodeComplete ? 'disabled' : ''}`}
          onClick={handleConfirmDeletion}
          disabled={loading || !isCodeComplete}
        >
          {loading ? (
            <span className="spinner-codigo"></span>
          ) : (
            <>
              <FiTrash2 />
              <span>Excluir Minha Conta</span>
            </>
          )}
        </button>

        {/* Reenviar código */}
        <button
          className="codigo-resend-button"
          onClick={handleResendCode}
          disabled={resending}
        >
          {resending ? (
            <span className="spinner-codigo-small"></span>
          ) : (
            'Não recebeu? Reenviar código'
          )}
        </button>

        {/* Aviso de perigo */}
        <div className="codigo-danger-box">
          <FiAlertTriangle className="danger-icon" />
          <p>
            Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcluirContaCodigo;
