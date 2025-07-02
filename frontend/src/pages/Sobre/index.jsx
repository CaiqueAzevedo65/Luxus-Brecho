import React from 'react';
import './index.css';

const Sobre = () => {
  return (
    <div className="sobre-container">
      <div className="sobre-header">
        <h1>Sobre Nós</h1>
        <p>Conheça a história e a paixão por trás do Luxus Brechó.</p>
      </div>

      <div className="sobre-content">
        <div className="sobre-section">
          <h2>Nossa Missão</h2>
          <p>
            No Luxus Brechó, nossa missão é dar uma nova vida a peças de luxo, promovendo a moda circular e o consumo consciente. Acreditamos que a elegância e a sustentabilidade podem e devem andar de mãos dadas.
          </p>
        </div>

        <div className="sobre-section">
          <h2>Nossa História</h2>
          <p>
            Tudo começou com um pequeno sonho de compartilhar achados incríveis de moda. Com o tempo, o que era um hobby se transformou em uma curadoria cuidadosa de peças únicas e de alta qualidade, criando uma comunidade de amantes da moda que valorizam a história por trás de cada item.
          </p>
        </div>

        <div className="sobre-section">
          <h2>Nossos Valores</h2>
          <ul>
            <li><strong>Qualidade:</strong> Cada peça é selecionada e verificada para garantir sua autenticidade e excelente estado.</li>
            <li><strong>Sustentabilidade:</strong> Promovemos um ciclo de moda mais longo e consciente.</li>
            <li><strong>Exclusividade:</strong> Oferecemos peças raras e especiais que contam uma história.</li>
            <li><strong>Confiança:</strong> Construímos um relacionamento transparente e seguro com nossos clientes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
