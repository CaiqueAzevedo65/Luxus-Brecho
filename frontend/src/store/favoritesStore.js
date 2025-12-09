import { create } from 'zustand';
import { favoritesService } from '../services/favorites';
import { logger } from '../utils/logger';

// Cache para evitar requisições duplicadas
let lastFetchTime = 0;
let fetchPromise = null;
const CACHE_DURATION = 30000; // 30 segundos de cache

export const useFavoritesStore = create((set, get) => ({
  // Estado
  favorites: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Carregar favoritos da API (com cache e deduplicação)
  loadFavorites: async (forceRefresh = false) => {
    const now = Date.now();
    const state = get();
    
    // Se já está carregando, retorna a promise existente
    if (fetchPromise && !forceRefresh) {
      return fetchPromise;
    }
    
    // Se os dados ainda estão em cache e não é refresh forçado
    if (!forceRefresh && state.lastUpdated && (now - state.lastUpdated) < CACHE_DURATION) {
      return { success: true, favorites: state.favorites };
    }
    
    // Evita múltiplas requisições simultâneas
    if (state.loading && !forceRefresh) {
      return { success: true, favorites: state.favorites };
    }
    
    try {
      set({ loading: true, error: null });
      
      fetchPromise = favoritesService.getFavorites();
      const result = await fetchPromise;
      
      if (result.success) {
        // Extrair apenas os produtos dos favoritos
        const products = result.favorites
          .map(fav => fav.product)
          .filter(product => product !== null);
        
        set({ favorites: products, loading: false, lastUpdated: now });
        lastFetchTime = now;
      } else {
        set({ favorites: [], loading: false, error: result.error });
      }
      
      return result;
    } catch (error) {
      logger.error('Erro ao carregar favoritos', error, 'FAVORITES');
      set({ favorites: [], loading: false, error: 'Erro ao carregar favoritos' });
      return { success: false, error: 'Erro ao carregar favoritos' };
    } finally {
      fetchPromise = null;
    }
  },

  // Adicionar produto aos favoritos
  addToFavorites: async (product) => {
    try {
      const result = await favoritesService.addFavorite(product.id);
      
      if (result.success) {
        // Atualizar estado local
        const updatedFavorites = [...get().favorites, product];
        set({ favorites: updatedFavorites });
        return { success: true, alreadyFavorite: false };
      } else {
        return { success: false, alreadyFavorite: result.alreadyFavorite, error: result.error };
      }
    } catch (error) {
      logger.error('Erro ao adicionar aos favoritos', error, 'FAVORITES');
      return { success: false, error: true };
    }
  },

  // Remover produto dos favoritos
  removeFromFavorites: async (productId) => {
    try {
      const result = await favoritesService.removeFavorite(productId);
      
      if (result.success) {
        // Atualizar estado local
        const updatedFavorites = get().favorites.filter(fav => fav.id !== productId);
        set({ favorites: updatedFavorites });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Erro ao remover dos favoritos', error, 'FAVORITES');
      return { success: false, error: true };
    }
  },

  // Alternar favorito (adicionar ou remover)
  toggleFavorite: async (product) => {
    try {
      const result = await favoritesService.toggleFavorite(product.id);
      
      if (result.success) {
        if (result.isFavorited) {
          // Adicionado
          const updatedFavorites = [...get().favorites, product];
          set({ favorites: updatedFavorites });
        } else {
          // Removido
          const updatedFavorites = get().favorites.filter(fav => fav.id !== product.id);
          set({ favorites: updatedFavorites });
        }
        return { success: true, isFavorited: result.isFavorited };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Erro ao alternar favorito', error, 'FAVORITES');
      return { success: false, error: true };
    }
  },

  // Verificar se produto está nos favoritos
  isFavorite: (productId) => {
    return get().favorites.some(fav => fav.id === productId);
  },

  // Limpar todos os favoritos (apenas local)
  clearFavorites: () => {
    try {
      set({ favorites: [], loading: false, error: null });
    } catch (error) {
      logger.error('Erro ao limpar favoritos', error, 'FAVORITES');
    }
  },

  // Obter total de favoritos
  getTotalFavorites: () => {
    return get().favorites.length;
  }
}));
