import { create } from 'zustand';
import { favoritesService, FavoriteProduct } from '../services/favorites';
import { logger } from '../utils/logger';

interface FavoritesState {
  favorites: FavoriteProduct[];
  loading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  addToFavorites: (product: FavoriteProduct) => Promise<{ success: boolean; alreadyFavorite?: boolean; error?: string }>;
  removeFromFavorites: (productId: number) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (product: FavoriteProduct) => Promise<{ success: boolean; isFavorited?: boolean; error?: string }>;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
  getTotalFavorites: () => number;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  // Carregar favoritos da API
  loadFavorites: async () => {
    try {
      set({ loading: true, error: null });
      const result = await favoritesService.getFavorites();

      if (result.success) {
        // Extrair apenas os produtos dos favoritos
        const products = result.favorites
          .map((fav) => fav.product)
          .filter((product): product is FavoriteProduct => product !== null);

        set({ favorites: products, loading: false });
      } else {
        set({ favorites: [], loading: false, error: result.error || null });
      }
    } catch (error) {
      logger.error('Erro ao carregar favoritos', error as Error, 'FAVORITES');
      set({ favorites: [], loading: false, error: 'Erro ao carregar favoritos' });
    }
  },

  // Adicionar produto aos favoritos
  addToFavorites: async (product: FavoriteProduct) => {
    try {
      const result = await favoritesService.addFavorite(product.id);

      if (result.success) {
        // Atualizar estado local
        const updatedFavorites = [...get().favorites, product];
        set({ favorites: updatedFavorites });
        return { success: true, alreadyFavorite: false };
      } else {
        return {
          success: false,
          alreadyFavorite: result.alreadyFavorite,
          error: result.error,
        };
      }
    } catch (error) {
      logger.error('Erro ao adicionar aos favoritos', error as Error, 'FAVORITES');
      return { success: false, error: 'Erro ao adicionar favorito' };
    }
  },

  // Remover produto dos favoritos
  removeFromFavorites: async (productId: number) => {
    try {
      const result = await favoritesService.removeFavorite(productId);

      if (result.success) {
        // Atualizar estado local
        const updatedFavorites = get().favorites.filter((fav) => fav.id !== productId);
        set({ favorites: updatedFavorites });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Erro ao remover dos favoritos', error as Error, 'FAVORITES');
      return { success: false, error: 'Erro ao remover favorito' };
    }
  },

  // Alternar favorito (adicionar ou remover)
  toggleFavorite: async (product: FavoriteProduct) => {
    try {
      const result = await favoritesService.toggleFavorite(product.id);

      if (result.success) {
        if (result.isFavorited) {
          // Adicionado
          const updatedFavorites = [...get().favorites, product];
          set({ favorites: updatedFavorites });
        } else {
          // Removido
          const updatedFavorites = get().favorites.filter((fav) => fav.id !== product.id);
          set({ favorites: updatedFavorites });
        }
        return { success: true, isFavorited: result.isFavorited };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Erro ao alternar favorito', error as Error, 'FAVORITES');
      return { success: false, error: 'Erro ao alternar favorito' };
    }
  },

  // Verificar se produto está nos favoritos
  isFavorite: (productId: number) => {
    return get().favorites.some((fav) => fav.id === productId);
  },

  // Limpar todos os favoritos (apenas local)
  clearFavorites: () => {
    try {
      set({ favorites: [], loading: false, error: null });
    } catch (error) {
      logger.error('Erro ao limpar favoritos', error as Error, 'FAVORITES');
    }
  },

  // Obter total de favoritos
  getTotalFavorites: () => {
    return get().favorites.length;
  },
}));
