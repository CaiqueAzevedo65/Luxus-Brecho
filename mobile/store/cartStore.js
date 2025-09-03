import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCartStore = create((set, get) => ({
  cart: [],
  addToCart: async (product) => {
    const currentCart = [...get().cart, product];
    set({ cart: currentCart });
    await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
  },
  removeFromCart: async (id) => {
    const currentCart = get().cart.filter(item => item.id !== id);
    set({ cart: currentCart });
    await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
  },
  loadCart: async () => {
    const savedCart = await AsyncStorage.getItem('cart');
    if (savedCart) set({ cart: JSON.parse(savedCart) });
  },
  clearCart: async () => {
    set({ cart: [] });
    await AsyncStorage.removeItem('cart');
  },
}));
