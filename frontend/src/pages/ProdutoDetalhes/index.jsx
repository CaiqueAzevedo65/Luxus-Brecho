import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useToastContext } from '../../contexts/ToastContext';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';
import './index.css';

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleFavorite, isFavorite: checkIsFavorite, loadFavorites } = useFavoritesStore();
  const { success, info, error: showError } = useToastContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFavorites();
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setIsFavorite(checkIsFavorite(product.id));
    }
  }, [product, checkIsFavorite]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Erro ao carregar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    const result = await toggleFavorite(product);
    
    if (result?.success) {
      const newIsFavorite = checkIsFavorite(product.id);
      setIsFavorite(newIsFavorite);
      
      if (newIsFavorite) {
        success(`${product.titulo} adicionado aos favoritos! ❤️`);
      } else {
        info(`${product.titulo} removido dos favoritos.`);
      }
    } else if (result?.error) {
      showError('Erro ao atualizar favoritos.');
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.titulo,
      text: `Confira este produto incrível no Luxus Brechó:\n\n${product.titulo}\nR$ ${formatPrice(product.preco)}\n\nPeças únicas com história!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        info('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Verificar se produto está disponível
    if (product.status !== 'disponivel') {
      showError('Este produto não está disponível no momento.');
      return;
    }

    const result = addToCart(product);
    
    if (result?.alreadyInCart) {
      info(`${product.titulo} já está no carrinho! Esta é uma peça única. 🛍️`);
    } else if (result?.success) {
      success(`${product.titulo} adicionado ao carrinho! 🛒`);
    } else if (result?.error) {
      showError('Erro ao adicionar produto ao carrinho.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container-details">
          <div className="spinner-details"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="error-container-details">
          <p>{error || 'Produto não encontrado'}</p>
          <button onClick={() => navigate('/produtos')} className="back-to-products-btn">
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Header */}
      <div className="product-details-header">
        <button onClick={() => navigate(-1)} className="back-btn-details">
          <FiArrowLeft />
        </button>
        
        <div className="header-actions">
          <button onClick={handleShare} className="action-btn-details" title="Compartilhar">
            <FiShare2 />
          </button>
          <button 
            onClick={handleToggleFavorite} 
            className={`action-btn-details ${isFavorite ? 'favorite-active' : ''}`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <FiHeart />
          </button>
        </div>
      </div>

      {/* Imagem do Produto */}
      <div className="product-image-section">
        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.titulo}
            className="product-detail-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x600?text=Sem+Imagem';
            }}
          />
        ) : (
          <div className="product-image-placeholder-details">
            <span>Sem Imagem</span>
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="product-info-section">
        {/* Preço e Título */}
        <div className="product-main-info">
          <h1 className="product-price-details">{formatPrice(product.preco)}</h1>
          <h2 className="product-title-details">{product.titulo}</h2>
          <span className="product-category-badge">{product.categoria}</span>
        </div>

        {/* Descrição */}
        <div className="product-description-section">
          <h3>Descrição</h3>
          <p className="product-description-details">{product.descricao}</p>
        </div>

        {/* Branding */}
        <div className="product-branding">
          <h2 className="brand-name">LUXUS BRECHÓ</h2>
          <p className="brand-tagline">Peças únicas com história</p>
        </div>
      </div>

      {/* Botão de Compra Fixo */}
      <div className="purchase-section">
        <button
          className="add-to-cart-btn-details"
          onClick={handleAddToCart}
          disabled={product.status !== 'disponivel'}
        >
          <FiShoppingCart />
          {product.status === 'disponivel' ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
        </button>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;
