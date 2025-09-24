import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import { Product } from '../types/product';

export interface CartItem {
  id: number;
  titulo: string;
  preco: number;
  imagem?: string;
  quantity: number;
  categoria?: string;
}

export interface CartState {
  cart: CartItem[];
  loading: boolean;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  loadCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: number) => number;
  isInCart: (productId: number) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
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
    return subtotal >= CONFIG.CART.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.CART.SHIPPING_FEE;
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getShippingCost();
  },
  
  // Ações
  addToCart: async (product: Product) => {
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
          quantity: 1
        };
        updatedCart = [...currentCart, cartItem];
      }
      
      set({ cart: updatedCart });
      await AsyncStorage.setItem(CONFIG.CART.STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  removeFromCart: async (productId: number) => {
    set({ loading: true });
    try {
      const updatedCart = get().cart.filter(item => item.id !== productId);
      set({ cart: updatedCart });
      await AsyncStorage.setItem(CONFIG.CART.STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao remover produto do carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  updateQuantity: async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await get().removeFromCart(productId);
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
      await AsyncStorage.setItem(CONFIG.CART.STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  loadCart: async () => {
    set({ loading: true });
    try {
      const savedCart = await AsyncStorage.getItem(CONFIG.CART.STORAGE_KEY);
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
  
  clearCart: async () => {
    set({ loading: true });
    try {
      set({ cart: [] });
      await AsyncStorage.removeItem(CONFIG.CART.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    } finally {
      set({ loading: false });
    }
  },

  getItemQuantity: (productId: number) => {
    const item = get().cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  },

  isInCart: (productId: number) => {
    return get().cart.some(item => item.id === productId);
  },
}));
