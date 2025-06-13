import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Luxus Brechó</Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/produtos" className="nav-link">Produtos</Link>
            </li>
            <li className="nav-item">
              <Link to="/categorias" className="nav-link">Categorias</Link>
            </li>
            <li className="nav-item">
              <Link to="/sobre" className="nav-link">Sobre</Link>
            </li>
            <li className="nav-item">
              <Link to="/contato" className="nav-link">Contato</Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-button">
            <span className="material-icons">search</span>
          </button>
          <button className="icon-button">
            <span className="material-icons">person</span>
          </button>
          <button className="icon-button cart-button">
            <span className="material-icons">shopping_cart</span>
            <span className="cart-count">0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;