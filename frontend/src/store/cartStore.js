import { create } from 'zustand';

const STORAGE_KEY = 'luxus-cart';
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 15;

export const useCartStore = create((set, get) => ({
  // Estado
  cart: [],
  loading: false,
  
  // Getters computados
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
  
  getSubtotal: () => {
    return get().cart.reduce((total, item) => total + (item.preco * item.quantity), 0);
  },
  
  getShippingCost: () => {
    const subtotal = get().getSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getShippingCost();
  },
  
  // Ações
  addToCart: (product) => {
    set({ loading: true });
    try {
      const currentCart = get().cart;
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        // Se o produto já existe, aumenta a quantidade
        updatedCart = currentCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Se é um produto novo, adiciona com quantidade 1
        const cartItem = {
          id: product.id,
          titulo: product.titulo,
          preco: Number(product.preco) || 0,
          imagem: product.imagem,
          quantity: 1,
          categoria: product.categoria
        };
        updatedCart = [...currentCart, cartItem];
      }
      
      set({ cart: updatedCart });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  removeFromCart: (productId) => {
    set({ loading: true });
    try {
      const updatedCart = get().cart.filter(item => item.id !== productId);
      set({ cart: updatedCart });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao remover produto do carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    set({ loading: true });
    try {
      const updatedCart = get().cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: quantity }
          : item
      );
      set({ cart: updatedCart });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  loadCart: () => {
    set({ loading: true });
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        set({ cart: parsedCart });
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  clearCart: () => {
    set({ loading: true });
    try {
      set({ cart: [] });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },

  getItemQuantity: (productId) => {
    const item = get().cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  },

  isInCart: (productId) => {
    return get().cart.some(item => item.id === productId);
  },
}));
