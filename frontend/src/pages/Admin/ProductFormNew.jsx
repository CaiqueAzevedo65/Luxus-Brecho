import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../contexts/ToastContext';
import { ProductSchema, PRODUCT_CATEGORIES, useProductValidation } from '../../schemas/product.schema';
import api from '../../services/api';
import { FiArrowLeft, FiImage, FiX, FiUpload, FiPackage } from 'react-icons/fi';
import './ProductForm.css';

export default function ProductFormNew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToastContext();
  const fileInputRef = useRef(null);
  const { validate, validateImage } = useProductValidation();

  const [formData, setFormData] = useState({
    titulo: '',
    preco: '',
    descricao: '',
    categoria: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      showError('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/');
      return;
    }

    // Se tem ID, carregar produto para edição
    if (id) {
      loadProduct();
    }
  }, [id, isAuthenticated, user, navigate]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      
      setFormData({
        titulo: product.titulo || '',
        preco: product.preco?.toString() || '',
        descricao: product.descricao || '',
        categoria: product.categoria || '',
        status: product.status || 'disponivel',
      });
      
      if (product.imagem) {
        setImagePreview(product.imagem);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      showError('Erro ao carregar produto');
      navigate('/admin/products');
    } finally {
      setLoading(false);
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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar imagem
    const validation = validateImage(file);
    if (!validation.success) {
      setErrors(prev => ({ ...prev, imagem: validation.error }));
      return;
    }

    // Limpar erro de imagem
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.imagem;
      return newErrors;
    });

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url || response.data.image_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validar dados do formulário
      const validation = validate(formData);
      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      let imageUrl = imagePreview;

      // Se tem nova imagem, fazer upload
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          setErrors({ imagem: 'Erro ao fazer upload da imagem' });
          return;
        }
      }

      // Preparar dados para envio
      const productData = {
        ...validation.data,
        imagem: imageUrl || '',
      };

      // Enviar para API
      if (id) {
        await api.put(`/products/${id}`, productData);
        success('Produto atualizado com sucesso! ✅');
      } else {
        await api.post('/products', productData);
        success('Produto criado com sucesso! 🎉');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Erro ao salvar produto. Tente novamente.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return null;
  }

  if (loading) {
    return (
      <div className="product-form-page">
        <div className="loading-state-form">
          <div className="spinner-form"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      {/* Header */}
      <div className="product-form-header">
        <button onClick={() => navigate('/admin/products')} className="back-button-form">
          <FiArrowLeft />
        </button>
        <h1>{id ? 'Editar Produto' : 'Novo Produto'}</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="product-form-content">
        <form onSubmit={handleSubmit} className="product-form">
          {/* Upload de Imagem */}
          <div className="form-section-image">
            <label className="form-label-image">Imagem do Produto *</label>
            
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-button"
                  title="Remover imagem"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div
                className="image-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className="upload-icon" />
                <p className="upload-text">Clique para selecionar uma imagem</p>
                <p className="upload-hint">JPG, PNG, GIF ou WEBP (máx. 5MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            
            {errors.imagem && <p className="error-text-form">{errors.imagem}</p>}
          </div>

          {/* Título */}
          <div className="form-group-form">
            <label htmlFor="titulo" className="form-label-form">Título *</label>
            <input
              id="titulo"
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ex: Vestido Floral Vintage"
              className={`form-input-form ${errors.titulo ? 'input-error-form' : ''}`}
            />
            {errors.titulo && <p className="error-text-form">{errors.titulo}</p>}
          </div>

          {/* Preço */}
          <div className="form-group-form">
            <label htmlFor="preco" className="form-label-form">Preço (R$) *</label>
            <input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => handleInputChange('preco', e.target.value)}
              placeholder="0.00"
              className={`form-input-form ${errors.preco ? 'input-error-form' : ''}`}
            />
            {errors.preco && <p className="error-text-form">{errors.preco}</p>}
          </div>

          {/* Categoria */}
          <div className="form-group-form">
            <label htmlFor="categoria" className="form-label-form">Categoria *</label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              className={`form-select-form ${errors.categoria ? 'input-error-form' : ''}`}
            >
              <option value="">Selecione uma categoria</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && <p className="error-text-form">{errors.categoria}</p>}
          </div>

          {/* Descrição */}
          <div className="form-group-form">
            <label htmlFor="descricao" className="form-label-form">Descrição *</label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva o produto em detalhes..."
              rows="5"
              className={`form-textarea-form ${errors.descricao ? 'input-error-form' : ''}`}
            />
            {errors.descricao && <p className="error-text-form">{errors.descricao}</p>}
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="error-box-form">
              <strong>Erro:</strong> {errors.submit}
            </div>
          )}

          {/* Botões */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="cancel-button-form"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (id ? 'Atualizar' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
