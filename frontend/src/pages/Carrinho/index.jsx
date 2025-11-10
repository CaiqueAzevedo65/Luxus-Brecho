import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useToastContext } from '../../contexts/ToastContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import './index.css';

const Carrinho = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    getTotalItems,
    getSubtotal,
    getShippingCost,
    getTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart
  } = useCartStore();
  const { success } = useToastContext();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = (productId, currentQuantity, increment) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    setItemToRemove(null);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = () => {
    success(`Pedido confirmado! 🎉\nTotal: ${formatPrice(getTotal())}\n\nObrigado pela compra!`);
    clearCart();
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <div className="carrinho-page">
      {/* Header */}
      <div className="carrinho-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft /> Voltar
          </button>
          <h1>Carrinho de Compras</h1>
          <span className="items-count">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </span>
        </div>
        
        {cart.length > 0 && (
          <button onClick={() => setShowClearConfirm(true)} className="clear-cart-btn">
            Limpar carrinho
          </button>
        )}
      </div>

      <div className="carrinho-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando carrinho...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingBag className="empty-icon" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione produtos para começar suas compras</p>
            <Link to="/produtos" className="continue-shopping-btn">
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <>
            {/* Products Section */}
            <div className="cart-items-section">
              <h2>Produtos ({totalItems})</h2>
              
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.titulo} />
                      ) : (
                        <div className="no-image">Sem imagem</div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h3>{item.titulo}</h3>
                      <p className="item-price">{formatPrice(item.preco)}</p>
                      <p className="item-subtotal">
                        Subtotal: {formatPrice(item.preco * item.quantity)}
                      </p>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, true)}
                          disabled={loading}
                          className="qty-btn"
                        >
                          <FiPlus />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, false)}
                          disabled={loading}
                          className="qty-btn"
                        >
                          <FiMinus />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setItemToRemove(item.id)}
                        disabled={loading}
                        className="remove-btn"
                        title="Remover item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <aside className="cart-summary">
              <h2>Resumo do Pedido</h2>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Frete:</span>
                  <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                    {shippingCost === 0 ? 'GRÁTIS' : formatPrice(shippingCost)}
                  </span>
                </div>
                
                {shippingCost > 0 && (
                  <p className="shipping-info">
                    Frete grátis para compras acima de R$ 150,00
                  </p>
                )}
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="checkout-btn"
              >
                Finalizar Compra
              </button>
              
              <Link to="/produtos" className="continue-link">
                Continuar comprando
              </Link>
            </aside>
          </>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Limpar carrinho</h3>
            <p>Tem certeza que deseja remover todos os itens do carrinho?</p>
            <div className="modal-actions">
              <button onClick={() => setShowClearConfirm(false)} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={handleClearCart} className="btn-confirm">
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Item Confirmation Modal */}
      {itemToRemove && (
        <div className="modal-overlay" onClick={() => setItemToRemove(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Remover item</h3>
            <p>Tem certeza que deseja remover este item do carrinho?</p>
            <div className="modal-actions">
              <button onClick={() => setItemToRemove(null)} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={() => handleRemoveItem(itemToRemove)} className="btn-confirm">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrinho;
