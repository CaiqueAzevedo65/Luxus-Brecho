import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';

interface FavoritesState {
  // Estado
  favorites: Product[];
  isLoading: boolean;

  // Ações
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loadFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

const FAVORITES_STORAGE_KEY = '@luxus_brecho:favorites';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  // Estado inicial
  favorites: [],
  isLoading: false,

  // Adicionar aos favoritos
  addToFavorites: async (product: Product) => {
    try {
      const { favorites } = get();
      
      // Verificar se já não está nos favoritos
      if (favorites.some(fav => fav._id === product._id)) {
        return;
      }

      const newFavorites = [...favorites, product];
      
      // Atualizar estado
      set({ favorites: newFavorites });
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
    }
  },

  // Remover dos favoritos
  removeFromFavorites: async (productId: string) => {
    try {
      const { favorites } = get();
      const newFavorites = favorites.filter(fav => fav._id !== productId);
      
      // Atualizar estado
      set({ favorites: newFavorites });
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
    }
  },

  // Verificar se é favorito
  isFavorite: (productId: string) => {
    const { favorites } = get();
    return favorites.some(fav => fav._id === productId);
  },

  // Carregar favoritos do AsyncStorage
  loadFavorites: async () => {
    try {
      set({ isLoading: true });
      
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      
      if (storedFavorites) {
        const favorites: Product[] = JSON.parse(storedFavorites);
        set({ favorites, isLoading: false });
      } else {
        set({ favorites: [], isLoading: false });
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      set({ favorites: [], isLoading: false });
    }
  },

  // Limpar todos os favoritos
  clearFavorites: async () => {
    try {
      set({ favorites: [] });
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
    }
  },
}));
