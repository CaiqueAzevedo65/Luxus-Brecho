import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHome, FiTag, FiGrid, FiInfo } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import './index.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const { getTotalItems, loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

  const cartItemCount = getTotalItems();

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && 
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="header">
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
            </ul>
          </nav>

          <div className="header-actions">
            <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="search-input"
                />
              </form>
            </div>
            
            <button 
              className="icon-button search-toggle" 
              onClick={toggleSearch}
              aria-label="Pesquisar"
            >
              <FiSearch />
            </button>
            
            <button className="icon-button" aria-label="Minha conta">
              <FiUser />
            </button>
            
            <Link to="/carrinho" className="icon-button cart-button" aria-label="Carrinho de compras">
              <FiShoppingCart />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      {isMenuOpen && <div className="overlay active" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;