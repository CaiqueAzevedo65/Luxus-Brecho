import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './index_new.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
  ];

  const categories = [
    {
      name: 'Casual',
      image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/casual.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9jYXN1YWwucG5nIiwiaWF0IjoxNzU3NzI2MTIyLCJleHAiOjE3ODkyNjIxMjJ9.UKmBAgjtEYZ4hQpP17Lh4la2osOuaj6Q8EeSz8NL1Eo'
    },
    {
      name: 'Social',
      image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/social.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9zb2NpYWwucG5nIiwiaWF0IjoxNzU3NzI2MTYwLCJleHAiOjE3ODkyNjIxNjB9.tmafoLASIGCieYzM-rRv-cQxp26suWzMGW1_cK_5ZJc'
    },
    {
      name: 'Esportivo',
      image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/esportivo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9lc3BvcnRpdm8ucG5nIiwiaWF0IjoxNzU3NzI2MTQxLCJleHAiOjE3ODkyNjIxNDF9.F6XpbxRgaQZIsQL7wGKQjY9lObD1f6TjlRW2EESZcks'
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { page: 1, page_size: 8 }
      });
      setFeaturedProducts(response.data.items || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="home">
      {/* Banner Principal */}
      <section className="hero-banner">
        <div className="banner-container">
          <button className="banner-nav prev" onClick={prevBanner}>
            <FiChevronLeft />
          </button>
          <div className="banner-slider">
            <img
              src={banners[currentBanner]}
              alt="Banner"
              className="banner-image"
            />
            <div className="banner-overlay">
              <h1>Encontre Roupas que{' '}Encaixem com seu estilo</h1>
              <p>Diversas marcas em bom estado!</p>
              <Link to="/produtos" className="cta-button">Ver Coleção</Link>
            </div>
          </div>
          <button className="banner-nav next" onClick={nextBanner}>
            <FiChevronRight />
          </button>
        </div>
        <div className="banner-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Produtos em Destaque</h2>
          <Link to="/produtos" className="view-more-link">Ver Mais</Link>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <div className="products-scroll">
            {featuredProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="product-card-featured">
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
                  <button
                    className="add-cart-btn"
                    onClick={() => navigate(`/produtos`)}
                  >
                    <FiShoppingCart /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pesquise por Estilo */}
      <section className="search-by-style">
        <h2>PESQUISE POR ESTILO</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/produtos?categoria=${category.name}`}
              className="category-card"
            >
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <span className="category-name">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Seção de Ajuda */}
      <section className="help-section">
        <div className="help-card">
          <p className="help-text">Para tirar suas dúvidas</p>
          <Link to="/sobre" className="help-button">Preciso de ajuda</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;