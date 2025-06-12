import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="container footer-content">
        <div className="social-media">
          <img src="/logo 3.png" alt="Instagram Icon" />
          <span>luxus.brecho_</span>
        </div>
        <div className="footer-links">
          <a href="#">Sobre Nós</a>
          <a href="#">Suporte</a>
          <a href="#">Contato</a>
        </div>
        <div className="payment-icons">
          <img src="/logotipo-visa 1.png" alt="Visa" />
          <img src="/cartao 1.png" alt="Mastercard" />
          <img src="/paypal 1.png" alt="PayPal" />
          <img src="/pagamento-do-google 1.png" alt="Google Pay" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
