import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';
import instagramIcon from '../../assets/Instagram.png';
import visaLogo from '../../assets/logotipo-visa 1.png';
import mastercardLogo from '../../assets/cartao 1.png';
import paypalLogo from '../../assets/paypal 1.png';
import gpayLogo from '../../assets/pagamento-do-google 1.png';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-left">
        <img src={instagramIcon} alt="Instagram" className="footer-instagram" />
        <a href="https://www.instagram.com/luxus.brecho_/" target="_blank" rel="noopener noreferrer" className="footer-brand">luxus.brecho_</a>
        <nav className="footer-nav">
          <Link to="/sobre">Sobre Nós</Link>
          <Link to="/suporte">Suporte</Link>
          <Link to="/contato">Contato</Link>
        </nav>
      </div>
      <div className="footer-right">
        <img src={visaLogo} alt="Visa" />
        <img src={mastercardLogo} alt="Mastercard" />
        <img src={paypalLogo} alt="PayPal" />
        <img src={gpayLogo} alt="G Pay" />
      </div>
    </div>
  </footer>
);

export default Footer;

