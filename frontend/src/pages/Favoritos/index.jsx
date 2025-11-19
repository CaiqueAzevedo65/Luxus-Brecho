import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useCartStore } from '../../store/cartStore';
import { useToastContext } from '../../contexts/ToastContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import './index.css';

const Favoritos = () => {
  const navigate = useNavigate();
  const { 
    favorites, 
    loadFavorites, 
    removeFromFavorites, 
    clearFavorites,
    getTotalFavorites 
  } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success, info, error: showError } = useToastContext();

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (product) => {
    const result = await removeFromFavorites(product.id);
    if (result?.success) {
      info(`${product.titulo} removido dos favoritos.`);
    } else {
      showError('Erro ao remover dos favoritos.');
    }
  };

  const handleAddToCart = (product) => {
    const result = addToCart(product);
    if (result?.alreadyInCart) {
      info(`${product.titulo} já está no carrinho! Esta é uma peça única.`);
    } else if (result?.success) {
      success(`${product.titulo} adicionado ao carrinho! 🛒`);
    } else if (result?.error) {
      showError('Erro ao adicionar produto ao carrinho.');
    }
  };

  const handleClearFavorites = () => {
    if (window.confirm('Tem certeza que deseja remover todos os favoritos?')) {
      clearFavorites();
      info('Todos os favoritos foram removidos.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="favoritos-page">
      {/* Header */}
      <div className="favoritos-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft /> Voltar
          </button>
          
          <div className="header-title">
            <h1>Meus Favoritos</h1>
            <span className="favorites-count">
              {getTotalFavorites()} {getTotalFavorites() === 1 ? 'item' : 'itens'}
            </span>
          </div>
          
          {favorites.length > 0 && (
            <button onClick={handleClearFavorites} className="clear-favorites-btn">
              Limpar Favoritos
            </button>
          )}
        </div>
      </div>

      <div className="favoritos-content">
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <FiHeart className="empty-icon" />
            <h2>Nenhum favorito ainda</h2>
            <p>Adicione produtos aos favoritos para vê-los aqui</p>
            <Link to="/produtos" className="browse-products-btn">
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((product) => (
              <div key={product.id} className="favorite-card">
                <Link to={`/produto/${product.id}`} className="favorite-card-link">
                  <div className="favorite-image-wrapper">
                    {product.imagem ? (
                      <img
                        src={product.imagem}
                        alt={product.titulo}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400?text=Sem+Imagem';
                        }}
                      />
                    ) : (
                      <div className="no-image">Sem Imagem</div>
                    )}
                  </div>
                  
                  <div className="favorite-info">
                    <h3>{product.titulo}</h3>
                    <p className="favorite-price">{formatPrice(product.preco)}</p>
                    <p className="favorite-category">{product.categoria}</p>
                  </div>
                </Link>

                <div className="favorite-actions">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="add-to-cart-btn-fav"
                    title="Adicionar ao carrinho"
                  >
                    <FiShoppingCart /> Adicionar
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(product)}
                    className="remove-favorite-btn"
                    title="Remover dos favoritos"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
