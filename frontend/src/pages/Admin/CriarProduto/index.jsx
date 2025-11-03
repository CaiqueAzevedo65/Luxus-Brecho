import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiChevronDown, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../../store/authStore';
import { CreateProductFormSchema, useZodValidation, categoryOptions } from '../../../schemas/product.schema';
import api from '../../../services/api';
import './index.css';

export default function CriarProduto() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoria: '',
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const { validate } = useZodValidation(CreateProductFormSchema);

  // Verificar se é administrador
  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      alert('Acesso negado. Apenas administradores podem criar produtos.');
      navigate('/perfil');
    }
  }, [isAuthenticated, user, navigate]);

  // Validar formulário
  const validateForm = () => {
    const result = validate(formData);
    
    const newErrors = {};
    
    // Adicionar erros do Zod
    if (!result.success) {
      Object.assign(newErrors, result.errors || {});
    }
    
    // Validar imagem separadamente
    if (!selectedImage) {
      newErrors.imagem = 'Selecione uma imagem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular mudanças nos inputs
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

  // Manipular mudança de preço (permitir apenas números e vírgula/ponto)
  const handlePriceChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    handleInputChange('preco', cleanValue);
  };

  // Selecionar categoria
  const selectCategory = (category) => {
    handleInputChange('categoria', category.value);
    setShowCategoryModal(false);
  };

  // Selecionar imagem
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tamanho (5MB)
      if (file.size > 5000000) {
        setErrors(prev => ({ ...prev, imagem: 'A imagem deve ter no máximo 5MB' }));
        return;
      }
      
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, imagem: 'Formato inválido. Use JPEG, PNG ou WebP' }));
        return;
      }
      
      setSelectedImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Limpar erro de imagem
      if (errors.imagem) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imagem;
          return newErrors;
        });
      }
    }
  };

  // Remover imagem
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descricao', formData.descricao);
      
      // Converter preço para formato correto
      const precoNum = parseFloat(formData.preco.replace(',', '.'));
      formDataToSend.append('preco', precoNum.toString());
      formDataToSend.append('categoria', formData.categoria);
      
      // Adicionar imagem
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await api.post('/products/with-image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        alert('Produto criado com sucesso!');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar tela de acesso negado se não for admin
  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return (
      <div className="criar-produto-restricted">
        <div className="restricted-content">
          <div className="restricted-icon">🔒</div>
          <h2>Acesso Restrito</h2>
          <p>Apenas administradores podem acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="criar-produto-container">
      {/* Header */}
      <div className="criar-produto-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          type="button"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1>Criar Produto</h1>
      </div>

      {/* Formulário */}
      <div className="criar-produto-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-card">
            {/* Título */}
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                className={errors.titulo ? 'input-error' : ''}
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Digite o título do produto"
              />
              {errors.titulo && (
                <span className="error-text">{errors.titulo}</span>
              )}
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label htmlFor="descricao">Descrição *</label>
              <textarea
                id="descricao"
                className={errors.descricao ? 'input-error' : ''}
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Digite a descrição do produto"
                rows="4"
              />
              {errors.descricao && (
                <span className="error-text">{errors.descricao}</span>
              )}
            </div>

            {/* Preço */}
            <div className="form-group">
              <label htmlFor="preco">Preço *</label>
              <input
                type="text"
                id="preco"
                className={errors.preco ? 'input-error' : ''}
                value={formData.preco}
                onChange={handlePriceChange}
                placeholder="0,00"
              />
              {errors.preco && (
                <span className="error-text">{errors.preco}</span>
              )}
            </div>

            {/* Categoria */}
            <div className="form-group">
              <label htmlFor="categoria">Categoria *</label>
              <button
                type="button"
                className={`category-selector ${errors.categoria ? 'input-error' : ''}`}
                onClick={() => setShowCategoryModal(true)}
              >
                <span className={!formData.categoria ? 'placeholder' : ''}>
                  {formData.categoria || 'Selecione uma categoria'}
                </span>
                <FiChevronDown size={20} />
              </button>
              {errors.categoria && (
                <span className="error-text">{errors.categoria}</span>
              )}
            </div>

            {/* Imagem */}
            <div className="form-group">
              <label>Imagem *</label>
              <div className={`image-selector ${errors.imagem ? 'input-error' : ''}`}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-input" className="image-placeholder">
                    <FiCamera size={40} />
                    <span>Toque para selecionar imagem</span>
                    <input
                      type="file"
                      id="image-input"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              {errors.imagem && (
                <span className="error-text">{errors.imagem}</span>
              )}
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando produto...' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Selecionar Categoria</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCategoryModal(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  className="category-item"
                  onClick={() => selectCategory(category)}
                >
                  <span className="category-name">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
