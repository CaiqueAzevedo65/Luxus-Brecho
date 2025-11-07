import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AddressSchema } from '../../schemas/user.schema';
import { buscarCep, formatarCep } from '../../services/cep';
import api from '../../services/api';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiHome,
  FiHash,
  FiMap,
  FiNavigation
} from 'react-icons/fi';
import './index.css';

const ConfigEndereco = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Carregar endereço existente se houver
    if (user.endereco) {
      setFormData({
        cep: user.endereco.cep || '',
        rua: user.endereco.rua || '',
        numero: user.endereco.numero || '',
        complemento: user.endereco.complemento || '',
        bairro: user.endereco.bairro || '',
        cidade: user.endereco.cidade || '',
        estado: user.endereco.estado || ''
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleCepChange = async (value) => {
    // Remove caracteres não numéricos
    const cepNumerico = value.replace(/\D/g, '');
    
    // Formata CEP enquanto digita
    let cepFormatado = cepNumerico;
    if (cepNumerico.length > 5) {
      cepFormatado = `${cepNumerico.substring(0, 5)}-${cepNumerico.substring(5, 8)}`;
    }
    
    setFormData(prev => ({ ...prev, cep: cepFormatado }));
    
    // Limpa erro do CEP
    if (errors.cep) {
      setErrors(prev => ({ ...prev, cep: '' }));
    }

    // Busca endereço quando CEP estiver completo
    if (cepNumerico.length === 8) {
      setLoadingCep(true);
      const result = await buscarCep(cepFormatado);
      setLoadingCep(false);

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          rua: result.data.rua,
          bairro: result.data.bairro,
          cidade: result.data.cidade,
          estado: result.data.estado
        }));
        
        // Limpa erros dos campos preenchidos
        setErrors(prev => ({
          ...prev,
          rua: '',
          bairro: '',
          cidade: '',
          estado: ''
        }));
      } else {
        setErrors(prev => ({ ...prev, cep: result.error }));
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      AddressSchema.parse(formData);
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

    setLoading(true);
    setSuccessMessage('');

    try {
      // Prepara payload
      const payload = {
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento || null,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado.toUpperCase()
        }
      };

      console.log('Enviando payload:', payload);

      // Envia dados completos do usuário com endereço atualizado
      const response = await api.put(`/users/${user.id}`, payload);

      if (response.data.user) {
        updateUser(response.data.user);
        setSuccessMessage('Endereço salvo com sucesso!');
        
        setTimeout(() => {
          navigate('/configuracoes');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      console.error('Resposta do servidor:', error.response?.data);
      setErrors({ 
        submit: error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar endereço. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="config-endereco-page">
      {/* Header */}
      <div className="config-endereco-header">
        <button onClick={() => navigate('/configuracoes')} className="back-button-endereco">
          <FiArrowLeft />
        </button>
        <h1>Endereço de Entrega</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div className="config-endereco-content">
        <div className="endereco-card">
          <div className="endereco-card-header">
            <FiMapPin className="endereco-icon" />
            <div>
              <h2>Cadastrar Endereço</h2>
              <p>Preencha os dados para entrega dos produtos</p>
            </div>
          </div>

          {successMessage && (
            <div className="success-message-endereco">
              <p>{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="error-message-endereco">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="endereco-form">
            {/* CEP */}
            <div className="form-group-endereco">
              <label htmlFor="cep">CEP *</label>
              <div className={`input-container-endereco ${errors.cep ? 'input-error' : ''}`}>
                <FiMapPin className="input-icon-endereco" />
                <input
                  type="text"
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength="9"
                  disabled={loading}
                />
                {loadingCep && <span className="loading-cep">Buscando...</span>}
              </div>
              {errors.cep && <span className="error-text-endereco">{errors.cep}</span>}
              <small className="field-hint">Digite o CEP para preencher automaticamente</small>
            </div>

            {/* Rua */}
            <div className="form-group-endereco">
              <label htmlFor="rua">Rua *</label>
              <div className={`input-container-endereco ${errors.rua ? 'input-error' : ''}`}>
                <FiHome className="input-icon-endereco" />
                <input
                  type="text"
                  id="rua"
                  value={formData.rua}
                  onChange={(e) => handleChange('rua', e.target.value)}
                  placeholder="Nome da rua"
                  disabled={loading}
                />
              </div>
              {errors.rua && <span className="error-text-endereco">{errors.rua}</span>}
            </div>

            {/* Número e Complemento */}
            <div className="form-row-endereco">
              <div className="form-group-endereco">
                <label htmlFor="numero">Número *</label>
                <div className={`input-container-endereco ${errors.numero ? 'input-error' : ''}`}>
                  <FiHash className="input-icon-endereco" />
                  <input
                    type="text"
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    placeholder="123"
                    disabled={loading}
                  />
                </div>
                {errors.numero && <span className="error-text-endereco">{errors.numero}</span>}
              </div>

              <div className="form-group-endereco">
                <label htmlFor="complemento">Complemento</label>
                <div className="input-container-endereco">
                  <FiHome className="input-icon-endereco" />
                  <input
                    type="text"
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Apto, bloco..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Bairro */}
            <div className="form-group-endereco">
              <label htmlFor="bairro">Bairro *</label>
              <div className={`input-container-endereco ${errors.bairro ? 'input-error' : ''}`}>
                <FiMap className="input-icon-endereco" />
                <input
                  type="text"
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  disabled={loading}
                />
              </div>
              {errors.bairro && <span className="error-text-endereco">{errors.bairro}</span>}
            </div>

            {/* Cidade e Estado */}
            <div className="form-row-endereco">
              <div className="form-group-endereco form-group-large">
                <label htmlFor="cidade">Cidade *</label>
                <div className={`input-container-endereco ${errors.cidade ? 'input-error' : ''}`}>
                  <FiNavigation className="input-icon-endereco" />
                  <input
                    type="text"
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                    disabled={loading}
                  />
                </div>
                {errors.cidade && <span className="error-text-endereco">{errors.cidade}</span>}
              </div>

              <div className="form-group-endereco form-group-small">
                <label htmlFor="estado">UF *</label>
                <div className={`input-container-endereco ${errors.estado ? 'input-error' : ''}`}>
                  <input
                    type="text"
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength="2"
                    disabled={loading}
                    style={{ textAlign: 'center', paddingLeft: '1rem' }}
                  />
                </div>
                {errors.estado && <span className="error-text-endereco">{errors.estado}</span>}
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              className="submit-button-endereco"
              disabled={loading || loadingCep}
            >
              {loading ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigEndereco;
