import React from 'react';

function Hero() {
  return (
    <section id="hero">
      <div className="hero-images-container">
        <img src="/header1.png" alt="Modelo com roupa estilosa 1" className="hero-image" />
        <img src="/header2.png" alt="Modelo com roupa estilosa 2" className="hero-image" />
        <img src="/header3.png" alt="Modelo com roupa estilosa 3" className="hero-image" />
      </div>
      <div className="hero-text-banner">
        <h1>Encontre Roupas que Encaixem com seu estilo</h1>
        <p>Diversas marcas em bom estado!</p>
      </div>
    </section>
  );
}

export default Hero;
