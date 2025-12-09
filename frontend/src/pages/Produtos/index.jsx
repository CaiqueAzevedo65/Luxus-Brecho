import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useToastContext } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { logger } from '../../utils/logger';
import { FiSearch, FiFilter, FiShoppingCart, FiX } from 'react-icons/fi';
import { ProductGridSkeleton } from '../../components/Skeleton';
import './index.css';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x400?text=Sem+Imagem';

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

  // Debounce da busca (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // Buscar produtos quando filtros mudam (com debounce na busca)
  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, debouncedSearchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/summary');
      setCategories(response.data || []);
    } catch (err) {
      logger.error('Erro ao carregar categorias', err, 'PRODUCTS');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
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
      
      if (debouncedSearchQuery) {
        params.q = debouncedSearchQuery;
      }

      const response = await api.get('/products', { params });
      
      setProducts(response.data.items || []);
      setTotalPages(Math.ceil(response.data.pagination.total / response.data.pagination.page_size));
    } catch (err) {
      logger.error('Erro ao carregar produtos', err, 'PRODUCTS');
      setError('Erro ao carregar produtos. Tente novamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedSearchQuery]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPage(1);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
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
  }, [selectedCategory, searchParams, setSearchParams]);

  const handleAddToCart = useCallback((product) => {
    const result = addToCart(product);
    if (result?.alreadyInCart) {
      info(`${product.titulo} já está no carrinho! Esta é uma peça única.`);
    } else if (result?.success) {
      success(`${product.titulo} adicionado ao carrinho! 🛒`);
    } else if (result?.error) {
      showError('Erro ao adicionar produto ao carrinho.');
    }
  }, [addToCart, info, success, showError]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setPage(1);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleImageError = useCallback((e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  }, []);

  // Memoizar formatação de preço
  const formatPrice = useMemo(() => {
    return (price) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

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
                  onClick={() => setSearchQuery('')}
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
        <div className="produtos-grid-container">
          <ProductGridSkeleton count={8} />
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
              onClick={handleClearFilters}
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
                        onError={handleImageError}
                        loading="lazy"
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
                  onClick={() => handleAddToCart(product)}
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
