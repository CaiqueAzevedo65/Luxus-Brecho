import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useToastContext } from '../../contexts/ToastContext';
import { FiSearch, FiFilter, FiShoppingCart, FiX } from 'react-icons/fi';
import './index.css';

const Produtos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCartStore();
  const { success, info, error: showError } = useToastContext();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Atualiza filtros quando a URL muda
  useEffect(() => {
    const categoryFromUrl = searchParams.get('categoria');
    const queryFromUrl = searchParams.get('q');
    
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl || '');
    }
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl || '');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/summary');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        page_size: 12,
      };
      
      if (selectedCategory) {
        params.categoria = selectedCategory;
      }
      
      if (searchQuery) {
        params.q = searchQuery;
      }

      const response = await api.get('/products', { params });
      
      setProducts(response.data.items || []);
      setTotalPages(Math.ceil(response.data.pagination.total / response.data.pagination.page_size));
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategoryFilter = (category) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    setPage(1);
    
    // Atualiza a URL
    const params = new URLSearchParams(searchParams);
    if (newCategory) {
      params.set('categoria', newCategory);
    } else {
      params.delete('categoria');
    }
    setSearchParams(params);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="produtos-page">
      {/* Header da Página */}
      <div className="produtos-header">
        <h1>Nossos Produtos</h1>
        <p>Explore nossa coleção de peças únicas e especiais</p>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="produtos-filters-section">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                maxLength={50}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                >
                  <FiX />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filtros de Categoria */}
        {categories.length > 0 && (
          <div className="category-filters">
            <FiFilter className="filter-icon" />
            <button
              className={`category-filter-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategoryFilter('')}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Produtos */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-container">
          <p>Nenhum produto encontrado.</p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPage(1);
              }}
              className="clear-filters-button"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="produtos-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card-featured">
                <Link to={`/produto/${product.id}`} className="product-card-link">
                  <div className="product-image-wrapper">
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
                  <div className="product-info-featured">
                    <h3>{product.titulo}</h3>
                    <p className="product-price">{formatPrice(product.preco)}</p>
                    <p className="product-category">{product.categoria}</p>
                  </div>
                </Link>
                <button
                  className="add-cart-btn-produtos"
                  onClick={() => {
                    const result = addToCart(product);
                    if (result?.alreadyInCart) {
                      info(`${product.titulo} já está no carrinho! Esta é uma peça única.`);
                    } else if (result?.success) {
                      success(`${product.titulo} adicionado ao carrinho! 🛒`);
                    } else if (result?.error) {
                      showError('Erro ao adicionar produto ao carrinho.');
                    }
                  }}
                >
                  <FiShoppingCart /> Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              
              <span className="pagination-info">
                Página {page} de {totalPages}
              </span>
              
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Produtos;
