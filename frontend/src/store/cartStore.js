import { create } from 'zustand';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'luxus-cart';
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 15;

export const useCartStore = create((set, get) => ({
  // Estado
  cart: [],
  loading: false,
  
  // Getters computados
  getTotalItems: () => {
    return get().cart.length; // Cada item é único, então total = número de itens
  },
  
  getSubtotal: () => {
    return get().cart.reduce((total, item) => total + item.preco, 0); // Sem multiplicação por quantidade
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
      const existingItem = currentCart.find(item => item.id === product.id);
      
      // Se o produto já existe, não adiciona novamente (peça única)
      if (existingItem) {
        logger.info('Produto já está no carrinho (peça única)', 'CART');
        set({ loading: false });
        return { success: false, alreadyInCart: true };
      }
      
      // Adiciona novo produto sem quantidade (peça única)
      const cartItem = {
        id: product.id,
        titulo: product.titulo,
        preco: Number(product.preco) || 0,
        imagem: product.imagem,
        categoria: product.categoria
      };
      
      const updatedCart = [...currentCart, cartItem];
      set({ cart: updatedCart });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
      set({ loading: false });
      return { success: true, alreadyInCart: false };
    } catch (error) {
      logger.error('Erro ao adicionar produto ao carrinho', error, 'CART');
      set({ loading: false });
      return { success: false, alreadyInCart: false, error: true };
    }
  },
  
  removeFromCart: (productId) => {
    set({ loading: true });
    try {
      const updatedCart = get().cart.filter(item => item.id !== productId);
      set({ cart: updatedCart });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      logger.error('Erro ao remover produto do carrinho', error, 'CART');
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
      logger.error('Erro ao carregar carrinho', error, 'CART');
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
      logger.error('Erro ao limpar carrinho', error, 'CART');
    } finally {
      set({ loading: false });
    }
  },

  isInCart: (productId) => {
    return get().cart.some(item => item.id === productId);
  },
}));
