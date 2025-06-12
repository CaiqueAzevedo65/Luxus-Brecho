import React, { useEffect } from 'react';

function Hero() {
  useEffect(() => {
    // Adiciona classe de carregamento para ativar animações
    document.body.classList.add('page-loaded');
    return () => {
      document.body.classList.remove('page-loaded');
    };
  }, []);

  return (
    <section id="hero" aria-label="Destaque principal">
      <div className="hero-images-container">
        <img 
          src="/header1.webp" 
          srcSet="/header1.webp 1x, /header1@2x.webp 2x"
          alt="Modelo com roupa estilosa 1" 
          className="hero-image" 
          width="300" 
          height="400"
          loading="lazy"
        />
        <img 
          src="/header2.webp" 
          srcSet="/header2.webp 1x, /header2@2x.webp 2x"
          alt="Modelo com roupa estilosa 2" 
          className="hero-image" 
          width="300" 
          height="400"
          loading="lazy"
        />
        <img 
          src="/header3.webp" 
          srcSet="/header3.webp 1x, /header3@2x.webp 2x"
          alt="Modelo com roupa estilosa 3" 
          className="hero-image" 
          width="300" 
          height="400"
          loading="lazy"
        />
      </div>
      <div className="hero-text-banner">
        <h1>Encontre Roupas que Encaixem com seu estilo</h1>
        <p>Diversas marcas em bom estado!</p>
        <button className="cta-button">
          Ver Coleção
          <span className="sr-only">, abrir catálogo de produtos</span>
        </button>
      </div>
    </section>
  );
}

export default Hero;
