import React from 'react';
import './index.css';
import logo from '../../assets/logo1.png';
import header1 from '../../assets/header1.png';
import header2 from '../../assets/header2.png';
import header3 from '../../assets/header3.png';
import bolsaAnimal from '../../assets/Bolsa-animal-nannyborges.png';
import camisaFloral from '../../assets/Camisa-floral.png';
import bolsaGuess from '../../assets/Bolsa-guess.png';
import bolsaRosa from '../../assets/Bolsa-rosa-feminina.png';
import croppedGirassol from '../../assets/Cropped-girassol.png';
import tamancoVintage from '../../assets/Tamanco-vintage-N38.png';
import moletomGarfield from '../../assets/Moletom-garfield.png';
import bolsaGrande from '../../assets/Bolsa-grande.png';
import casual from '../../assets/casual.png';
import formal1 from '../../assets/formal1.png';
import formal2 from '../../assets/formal2.png';
import social1 from '../../assets/social1.png';
import social2 from '../../assets/social2.png';
import esportiva from '../../assets/esportiva.png';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-logo">
          <img src={logo} alt="Luxus Brechó" />
        </div>
        <div className="hero-images">
          <img src={header1} alt="" className="hero-img img1" />
          <img src={header2} alt="" className="hero-img img2" />
          <img src={header3} alt="" className="hero-img img3" />
        </div>
        <div className="hero-content">
          <h1>Encontre Roupas que Encaixem com seu estilo</h1>
          <p>Diversas marcas em bom estado!</p>
          <button className="cta-button">Ver Coleção</button>
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands">
        <h2>BRANDS</h2>
        <div className="brand-list">
          <div className="brand-item">
            <h3 className="brand-title">VERSACE</h3>
            <div className="brand-card">
              <img src={bolsaGrande} alt="Versace" />
            </div>
            <span className="product-name">Bolsa Grande</span>
            <div className="stars">★★★★★</div>
            <p className="price">90$</p>
          </div>
          <div className="brand-item">
            <h3 className="brand-title">ZARA</h3>
            <div className="brand-card">
              <img src={croppedGirassol} alt="Zara" />
            </div>
            <span className="product-name">Cropped Girassol</span>
            <div className="stars">★★★★★</div>
            <p className="price">20$</p>
          </div>
          <div className="brand-item">
            <h3 className="brand-title">GUCCI</h3>
            <div className="brand-card">
              <img src={camisaFloral} alt="Gucci" />
            </div>
            <span className="product-name">Camisa floral</span>
            <div className="stars">★★★★★</div>
            <p className="price">28$</p>
          </div>
          <div className="brand-item">
            <h3 className="brand-title">PRADA</h3>
            <div className="brand-card">
              <img src={bolsaRosa} alt="Prada" />
            </div>
            <span className="product-name">Bolsa rosa feminina</span>
            <div className="stars">★★★★★</div>
            <p className="price">80$</p>
          </div>
        </div>
      </section>
      <button className="btn-view-more">Ver mais</button>
      {/* Top Selling Section */}
      <section className="top-selling">
        <h2>TOP SELLING</h2>
        <div className="product-grid">
          <div className="product-item">
            <div className="product-card">
              <img src={bolsaGuess} alt="" />
            </div>
            <h3>Bolsa Guess</h3>
          </div>
          <div className="product-item">
            <div className="product-card">
              <img src={tamancoVintage} alt="" />
            </div>
            <h3>Tamanco vintage Nº38</h3>
          </div>
          <div className="product-item">
            <div className="product-card">
              <img src={bolsaAnimal} alt="" />
            </div>
            <h3>Bolsa animal Nannyborges</h3>
          </div>
          <div className="product-item">
            <div className="product-card">
              <img src={moletomGarfield} alt="" />
            </div>
            <h3>Moletom Garfield</h3>
          </div>
        </div>
      </section>
      {/* Search by Style */}
      <section className="search-style">
        <h2>PESQUISE POR ESTILO</h2>
        <div className="style-grid">
          <div className="style-card single">
            <span className="style-title">Casual</span>
            <div className="style-images single">
              <img src={casual} alt="Casual" />
            </div>
          </div>
          <div className="style-card multiple">
            <span className="style-title">Formal</span>
            <div className="style-images">
              <img src={formal1} alt="Formal 1" />
              <img src={formal2} alt="Formal 2" />
            </div>
          </div>
          <div className="style-card multiple">
            <span className="style-title">Social</span>
            <div className="style-images">
              <img src={social1} alt="Social 1" />
              <img src={social2} alt="Social 2" />
            </div>
          </div>
          <div className="style-card single">
            <span className="style-title">Esportiva</span>
            <div className="style-images single">
              <img src={esportiva} alt="Esportiva" />
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="testimonials">
        <h2>CLIENTES SATISFEITOS</h2>
        <div className="testimonial-list">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <div className="customer-name">Sadie A.</div>
            <p>Encontrar roupas que alinham com meu gosto pessoal era muito difícil até eu descobrir a Luxus Brechó!</p>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <div className="customer-name">John M.</div>
            <p>Consegui encontrar roupas de presente para minha esposa, um ótimo presente!</p>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <div className="customer-name">Arthur M.</div>
            <p>Acredito que foi a loja com maior custo benefício que encontrei com tamanha qualidade!</p>
          </div>
        </div>
      </section>
      {/* Subscribe Section */}
      <section className="subscribe">
        <h2>Fique ligado sobre nossas ofertas!</h2>
        <form>
          <input type="email" placeholder="E-mail" />
          <button type="submit">Se inscreva!</button>
        </form>
      </section>
      {/* Footer será renderizado pelo Layout */}
    </div>
  );
};

export default Home;