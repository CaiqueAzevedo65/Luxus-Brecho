import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiGrid, FiArrowRight } from 'react-icons/fi';
import './index.css';

const Categorias = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Imagens para cada categoria (baseado no mobile)
  const categoryImages = {
    'Casual': 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468452915_17928657050967827_7578668394488839966_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0NTI5MTVfMTc5Mjg2NTcwNTA5Njc4MjdfNzU3ODY2ODM5NDQ4ODgzOTk2Nl9uLnBuZyIsImlhdCI6MTc1NzcwNDg3MCwiZXhwIjoxNzg5MjQwODcwfQ.J66iL4I5K3b0rQyRrV4u9eekqVx1ekR517RVgoP5bmk',
    'Social': 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/Captura%20de%20tela%202025-06-03%20200924.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9DYXB0dXJhIGRlIHRlbGEgMjAyNS0wNi0wMyAyMDA5MjQucG5nIiwiaWF0IjoxNzU3NzA0ODg0LCJleHAiOjE3ODkyNDA4ODR9.CbhbTjEGk59ONGoDvjxzaaXd8PVHi9M48xF2cOQDTNU',
    'Esportivo': 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468403560_17928651893967827_8798510667129991733_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0MDM1NjBfMTc5Mjg2NTE4OTM5Njc4MjdfODc5ODUxMDY2NzEyOTk5MTczM19uLnBuZyIsImlhdCI6MTc1NzcwNDgyMywiZXhwIjoxNzg5MjQwODIzfQ.hyXpfqqAgGRVW2Ke_XguKDLijxXMlqXX9ibHjkxvwv0'
  };

  // Descrições personalizadas para cada categoria
  const categoryDescriptions = {
    'Casual': 'Peças confortáveis e versáteis para o dia a dia. Estilo despojado com muito charme.',
    'Social': 'Looks elegantes e sofisticados para ocasiões especiais. Clássicos que nunca saem de moda.',
    'Esportivo': 'Roupas práticas e modernas para um estilo ativo. Conforto e funcionalidade.'
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/categories/summary');
      const categoriesData = response.data || [];
      
      // Adiciona imagens e descrições às categorias
      const enrichedCategories = categoriesData.map(cat => ({
        ...cat,
        image: categoryImages[cat.name] || null,
        customDescription: categoryDescriptions[cat.name] || cat.description
      }));
      
      setCategories(enrichedCategories);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias. Tente novamente.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/produtos?categoria=${categoryName}`);
  };

  return (
    <div className="categorias-page">
      {/* Header da Página */}
      <div className="categorias-header">
        <FiGrid className="header-icon" />
        <h1>Nossas Categorias</h1>
        <p>Explore nossa seleção organizada por estilo</p>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando categorias...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-container">
          <p>Nenhuma categoria disponível no momento.</p>
        </div>
      ) : (
        <div className="categorias-content">
          {/* Grid de Categorias */}
          <div className="categorias-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="category-image-container">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="category-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="category-placeholder" style={{ display: category.image ? 'none' : 'flex' }}>
                    <FiGrid size={48} />
                  </div>
                  <div className="category-overlay">
                    <h2 className="category-name">{category.name}</h2>
                    <button className="explore-button">
                      Explorar
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
                
                <div className="category-info">
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-description">
                    {category.customDescription}
                  </p>
                  <div className="category-footer">
                    <span className="view-products-link">
                      Ver produtos <FiArrowRight />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seção de Destaque */}
          <div className="featured-section">
            <h2>Não sabe por onde começar?</h2>
            <p>Navegue por todas as nossas peças únicas e encontre o estilo perfeito para você.</p>
            <Link to="/produtos" className="view-all-button">
              Ver Todos os Produtos
              <FiArrowRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;
