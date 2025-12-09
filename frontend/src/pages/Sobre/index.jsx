import React from 'react';
import { FiTarget, FiHeart, FiStar, FiShield, FiUsers, FiCode, FiCheckCircle } from 'react-icons/fi';
import './index.css';

const Sobre = () => {
  const valores = [
    {
      icon: FiStar,
      titulo: 'Qualidade',
      descricao: 'Cada peça é selecionada e verificada para garantir sua autenticidade e excelente estado.'
    },
    {
      icon: FiHeart,
      titulo: 'Sustentabilidade',
      descricao: 'Promovemos um ciclo de moda mais longo e consciente.'
    },
    {
      icon: FiShield,
      titulo: 'Exclusividade',
      descricao: 'Oferecemos peças raras e especiais que contam uma história.'
    },
    {
      icon: FiCheckCircle,
      titulo: 'Confiança',
      descricao: 'Construímos um relacionamento transparente e seguro com nossos clientes.'
    }
  ];

  const equipe = [
    {
      nome: 'Caique Azevedo',
      cargo: 'Full-stack Developer',
      iniciais: 'CA',
      cor: '#E91E63'
    },
    {
      nome: 'João Mateus Firmino',
      cargo: 'QA Developer',
      iniciais: 'JM',
      cor: '#3B82F6'
    }
  ];

  return (
    <div className="sobre-page">
      {/* Hero Section */}
      <section className="sobre-hero">
        <div className="hero-content">
          <span className="hero-badge">Sobre Nós</span>
          <h1>Luxus Brechó</h1>
          <p>Moda de luxo com consciência. Descubra peças únicas que contam histórias.</p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </section>

      {/* Missão Section */}
      <section className="sobre-section missao-section">
        <div className="section-container">
          <div className="section-icon">
            <FiTarget />
          </div>
          <h2>Nossa Missão</h2>
          <p className="section-text">
            No Luxus Brechó, nossa missão é dar uma nova vida a peças de luxo, promovendo a 
            <strong> moda circular</strong> e o <strong>consumo consciente</strong>. Acreditamos que a 
            elegância e a sustentabilidade podem e devem andar de mãos dadas.
          </p>
        </div>
      </section>

      {/* História Section */}
      <section className="sobre-section historia-section">
        <div className="section-container">
          <div className="historia-content">
            <div className="historia-text">
              <h2>Nossa História</h2>
              <p>
                Tudo começou com um pequeno sonho de compartilhar achados incríveis de moda. 
                Com o tempo, o que era um hobby se transformou em uma curadoria cuidadosa de 
                peças únicas e de alta qualidade.
              </p>
              <p>
                Hoje, criamos uma comunidade de amantes da moda que valorizam a história por 
                trás de cada item, conectando pessoas a peças especiais que merecem uma segunda chance.
              </p>
            </div>
            <div className="historia-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Peças Vendidas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Clientes Felizes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Autenticidade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="sobre-section valores-section">
        <div className="section-container">
          <h2>Nossos Valores</h2>
          <p className="section-subtitle">Os pilares que guiam cada decisão que tomamos</p>
          
          <div className="valores-grid">
            {valores.map((valor, index) => {
              const IconComponent = valor.icon;
              return (
                <div key={index} className="valor-card">
                  <div className="valor-icon">
                    <IconComponent />
                  </div>
                  <h3>{valor.titulo}</h3>
                  <p>{valor.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipe Section */}
      <section className="sobre-section equipe-section">
        <div className="section-container">
          <div className="equipe-header">
            <FiUsers className="equipe-icon" />
            <h2>Nossa Equipe</h2>
            <p className="section-subtitle">Conheça os responsáveis por trás do Luxus Brechó</p>
          </div>
          
          <div className="equipe-grid">
            {equipe.map((membro, index) => (
              <div key={index} className="membro-card">
                <div 
                  className="membro-avatar"
                  style={{ backgroundColor: membro.cor }}
                >
                  <span>{membro.iniciais}</span>
                </div>
                <div className="membro-info">
                  <h3>{membro.nome}</h3>
                  <span className="membro-cargo">
                    <FiCode />
                    {membro.cargo}
                  </span>
                </div>
                <div className="membro-decoration" style={{ backgroundColor: membro.cor }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="sobre-section cta-section">
        <div className="section-container">
          <h2>Pronto para encontrar sua próxima peça especial?</h2>
          <p>Explore nossa coleção curada de peças de luxo</p>
          <a href="/produtos" className="cta-button">
            Ver Produtos
          </a>
        </div>
      </section>
    </div>
  );
};

export default Sobre;
