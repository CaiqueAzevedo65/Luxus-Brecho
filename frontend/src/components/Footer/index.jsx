import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './index.css';
import visaLogo from '../../assets/logotipo-visa 1.png';
import mastercardLogo from '../../assets/cartao 1.png';
import paypalLogo from '../../assets/paypal 1.png';
import gpayLogo from '../../assets/pagamento-do-google 1.png';

const Footer = () => (
  <footer className="footer" role="contentinfo">
    <div className="footer-container">
      <div className="footer-content">
        {/* Coluna 1: Sobre */}
        <div className="footer-column footer-about">
          <div className="footer-logo">
            <h3>LUXUS</h3>
            <span>BRECHÓ</span>
          </div>
          <p className="footer-description">
            Moda sustentável e estilo único. Encontre peças exclusivas com qualidade e preço justo.
          </p>
          <div className="footer-social">
            <a 
              href="https://www.instagram.com/luxus.brecho_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              <FiInstagram />
              <span>@luxus.brecho_</span>
            </a>
          </div>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="footer-column footer-links">
          <h4 className="footer-title">Links Rápidos</h4>
          <nav className="footer-nav" aria-label="Footer Navigation">
            <ul>
              <li><Link to="/sobre">Sobre Nós</Link></li>
              <li><Link to="/suporte">Suporte</Link></li>
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/produtos">Produtos</Link></li>
              <li><Link to="/categorias">Categorias</Link></li>
            </ul>
          </nav>
        </div>

        {/* Coluna 3: Contato e Pagamento */}
        <div className="footer-column footer-contact">
          <h4 className="footer-title">Contato</h4>
          <div className="contact-info">
            <div className="contact-item">
              <FiMail />
              <span>contato@luxusbrecho.com</span>
            </div>
            <div className="contact-item">
              <FiPhone />
              <span>(19) 98225-1266</span>
            </div>
            <div className="contact-item">
              <FiMapPin />
              <span>Campinas, SP</span>
            </div>
          </div>
          
          <div className="footer-payment">
            <h5>Formas de Pagamento</h5>
            <div className="payment-methods" aria-label="Métodos de Pagamento">
              <img src={visaLogo} alt="Visa" />
              <img src={mastercardLogo} alt="Mastercard" />
              <img src={paypalLogo} alt="PayPal" />
              <img src={gpayLogo} alt="Google Pay" />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Luxus Brechó. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

