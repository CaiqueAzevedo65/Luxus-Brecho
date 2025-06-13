import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHome, FiTag, FiGrid, FiInfo } from 'react-icons/fi';
import './index.css';

const Header = () => {
  const [showHeader, setShowHeader] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };

    // Handle click outside to close menu
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && 
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${showHeader ? 'visible' : 'hidden'}`}>
        <div className="header-container">
          <div className="logo">
            <Link to="/">Luxus <span>Brechó</span></Link>
          </div>
          
          <button 
            ref={menuButtonRef}
            className="menu-toggle" 
            onClick={toggleMenu}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          
          <nav ref={navRef} className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMenu}>
                  <FiHome className="nav-icon" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/produtos" className="nav-link" onClick={closeMenu}>
                  <FiTag className="nav-icon" />
                  <span>Produtos</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/categorias" className="nav-link" onClick={closeMenu}>
                  <FiGrid className="nav-icon" />
                  <span>Categorias</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/sobre" className="nav-link" onClick={closeMenu}>
                  <FiInfo className="nav-icon" />
                  <span>Sobre</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <button className="icon-button" aria-label="Pesquisar">
              <FiSearch />
            </button>
            <button className="icon-button" aria-label="Minha conta">
              <FiUser />
            </button>
            <button className="icon-button cart-button" aria-label="Carrinho de compras">
              <FiShoppingCart />
              <span className="cart-count">0</span>
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && <div className="overlay active" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;