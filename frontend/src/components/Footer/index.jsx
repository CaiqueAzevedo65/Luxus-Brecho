import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';
import instagramIcon from '../../assets/Instagram.png';
import visaLogo from '../../assets/logotipo-visa 1.png';
import mastercardLogo from '../../assets/cartao 1.png';
import paypalLogo from '../../assets/paypal 1.png';
import gpayLogo from '../../assets/pagamento-do-google 1.png';

const Footer = () => (
  <footer className="footer" role="contentinfo">
    <div className="footer-content">
      <div className="footer-left">
        <div className="footer-brand-container">
          <img src={instagramIcon} alt="Instagram" className="footer-instagram" />
          <a href="https://www.instagram.com/luxus.brecho_/" target="_blank" rel="noopener noreferrer" className="footer-brand">luxus.brecho_</a>
        </div>
        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul>
            <li><Link to="/sobre">Sobre Nós</Link></li>
            <li><Link to="/suporte">Suporte</Link></li>
            <li><Link to="/contato">Contato</Link></li>
          </ul>
        </nav>
      </div>
      <div className="footer-right" aria-label="Métodos de Pagamento">
        <ul>
          <li><img src={visaLogo} alt="Visa" /></li>
          <li><img src={mastercardLogo} alt="Mastercard" /></li>
          <li><img src={paypalLogo} alt="PayPal" /></li>
          <li><img src={gpayLogo} alt="G Pay" /></li>
        </ul>
      </div>
    </div>
    <div className="footer-copyright">
      <p>© {new Date().getFullYear()} Luxus Brechó. Todos os direitos reservados.</p>
    </div>
  </footer>
);

export default Footer;

