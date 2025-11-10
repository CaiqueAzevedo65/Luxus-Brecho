import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import { FiArrowLeft, FiPlus, FiEdit3, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import './ProductsList.css';

export default function ProductsList() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToastContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Verificar se é administrador
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      showError('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/');
      return;
    }

    fetchProducts();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Filtrar produtos baseado na busca
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { page: 1, page_size: 100 }
      });
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Tem certeza que deseja excluir "${product.titulo}"?`)) {
      confirmDeleteProduct(product);
    }
  };

  const confirmDeleteProduct = async (product) => {
    try {
      await api.delete(`/products/${product.id}`);
      success('Produto excluído com sucesso! 🗑️');
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      showError('Erro ao excluir produto. Tente novamente.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return null;
  }

  return (
    <div className="products-list-page">
      {/* Header */}
      <div className="products-list-header">
        <button onClick={() => navigate('/perfil')} className="back-button-products">
          <FiArrowLeft />
        </button>
        <h1>Gerenciar Produtos</h1>
      </div>

      <div className="products-list-content">
        {/* Barra de busca */}
        <div className="search-container-products">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-products"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search">
              ×
            </button>
          )}
        </div>

        {/* Contador */}
        {!loading && (
          <div className="products-counter">
            <p>
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery && ` encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Lista de produtos */}
        {loading ? (
          <div className="loading-state-products">
            <div className="spinner-products"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state-products">
            <FiPackage className="empty-icon" />
            <h3>Nenhum produto encontrado</h3>
            <p>
              {searchQuery 
                ? 'Tente buscar com outros termos' 
                : 'Comece criando seu primeiro produto'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/admin/products/new')} 
                className="create-first-button"
              >
                Criar produto
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card-admin">
                <div className="product-image-admin">
                  {product.imagem ? (
                    <img
                      src={product.imagem}
                      alt={product.titulo}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=Sem+Imagem';
                      }}
                    />
                  ) : (
                    <div className="no-image-admin">Sem Imagem</div>
                  )}
                </div>

                <div className="product-info-admin">
                  <h3>{product.titulo}</h3>
                  <p className="product-description-admin">{product.descricao}</p>
                  <div className="product-meta-admin">
                    <span className="product-price-admin">{formatPrice(product.preco)}</span>
                    <span className="product-category-admin">{product.categoria}</span>
                  </div>
                </div>

                <div className="product-actions-admin">
                  <button
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    className="edit-button-admin"
                    title="Editar produto"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="delete-button-admin"
                    title="Excluir produto"
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
}
