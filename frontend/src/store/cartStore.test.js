import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cartStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store antes de cada teste (usa 'cart', não 'items')
    useCartStore.setState({ cart: [], loading: false });
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    it('deve adicionar produto ao carrinho', () => {
      const product = { id: 1, titulo: 'Produto 1', preco: 100 };
      
      useCartStore.getState().addToCart(product);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].id).toBe(1);
    });

    it('não deve adicionar produto duplicado (peça única)', () => {
      const product = { id: 1, titulo: 'Produto 1', preco: 100 };
      
      useCartStore.getState().addToCart(product);
      const result = useCartStore.getState().addToCart(product);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(result.alreadyInCart).toBe(true);
    });
  });

  describe('removeFromCart', () => {
    it('deve remover produto do carrinho', () => {
      const product = { id: 1, titulo: 'Produto 1', preco: 100 };
      useCartStore.setState({ cart: [product] });
      
      useCartStore.getState().removeFromCart(1);
      
      expect(useCartStore.getState().cart).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('deve limpar o carrinho', () => {
      useCartStore.setState({ 
        cart: [
          { id: 1, titulo: 'Produto 1', preco: 100 },
          { id: 2, titulo: 'Produto 2', preco: 200 }
        ] 
      });
      
      useCartStore.getState().clearCart();
      
      expect(useCartStore.getState().cart).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('deve retornar total de itens (peças únicas)', () => {
      useCartStore.setState({ 
        cart: [
          { id: 1, titulo: 'Produto 1', preco: 100 },
          { id: 2, titulo: 'Produto 2', preco: 200 }
        ] 
      });
      
      expect(useCartStore.getState().getTotalItems()).toBe(2);
    });

    it('deve retornar 0 quando carrinho vazio', () => {
      expect(useCartStore.getState().getTotalItems()).toBe(0);
    });
  });

  describe('getSubtotal', () => {
    it('deve calcular subtotal corretamente', () => {
      useCartStore.setState({ 
        cart: [
          { id: 1, titulo: 'Produto 1', preco: 100 },
          { id: 2, titulo: 'Produto 2', preco: 50 }
        ] 
      });
      
      // 100 + 50 = 150
      expect(useCartStore.getState().getSubtotal()).toBe(150);
    });
  });

  describe('getShippingCost', () => {
    it('deve retornar frete grátis quando subtotal >= R$150', () => {
      useCartStore.setState({ 
        cart: [{ id: 1, titulo: 'Produto 1', preco: 200 }] 
      });
      
      expect(useCartStore.getState().getShippingCost()).toBe(0);
    });

    it('deve retornar frete de R$15 quando subtotal < R$150', () => {
      useCartStore.setState({ 
        cart: [{ id: 1, titulo: 'Produto 1', preco: 100 }] 
      });
      
      expect(useCartStore.getState().getShippingCost()).toBe(15);
    });
  });

  describe('getTotal', () => {
    it('deve calcular total com frete', () => {
      useCartStore.setState({ 
        cart: [{ id: 1, titulo: 'Produto 1', preco: 100 }] 
      });
      
      // 100 + 15 (frete) = 115
      expect(useCartStore.getState().getTotal()).toBe(115);
    });

    it('deve calcular total sem frete quando subtotal >= R$150', () => {
      useCartStore.setState({ 
        cart: [{ id: 1, titulo: 'Produto 1', preco: 200 }] 
      });
      
      expect(useCartStore.getState().getTotal()).toBe(200);
    });
  });

  describe('isInCart', () => {
    it('deve retornar true se produto está no carrinho', () => {
      useCartStore.setState({ 
        cart: [{ id: 1, titulo: 'Produto 1', preco: 100 }] 
      });
      
      expect(useCartStore.getState().isInCart(1)).toBe(true);
    });

    it('deve retornar false se produto não está no carrinho', () => {
      useCartStore.setState({ cart: [] });
      
      expect(useCartStore.getState().isInCart(1)).toBe(false);
    });
  });
});
