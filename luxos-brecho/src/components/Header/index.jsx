import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Header = () => {
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${showHeader ? 'visible' : 'hidden'}`}>
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
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;