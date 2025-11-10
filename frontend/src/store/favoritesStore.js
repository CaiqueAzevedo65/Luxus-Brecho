import { create } from 'zustand';

const STORAGE_KEY = 'luxus-favorites';

export const useFavoritesStore = create((set, get) => ({
  // Estado
  favorites: [],
  loading: false,

  // Carregar favoritos do localStorage
  loadFavorites: () => {
    try {
      const savedFavorites = localStorage.getItem(STORAGE_KEY);
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        set({ favorites: parsedFavorites });
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  },

  // Adicionar produto aos favoritos
  addToFavorites: (product) => {
    try {
      const currentFavorites = get().favorites;
      const exists = currentFavorites.find(fav => fav.id === product.id);

      if (exists) {
        console.log('Produto já está nos favoritos');
        return { success: false, alreadyFavorite: true };
      }

      const favoriteItem = {
        id: product.id,
        titulo: product.titulo,
        preco: Number(product.preco) || 0,
        imagem: product.imagem,
        categoria: product.categoria,
        descricao: product.descricao,
        addedAt: new Date().toISOString()
      };

      const updatedFavorites = [...currentFavorites, favoriteItem];
      set({ favorites: updatedFavorites });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
      return { success: true, alreadyFavorite: false };
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return { success: false, error: true };
    }
  },

  // Remover produto dos favoritos
  removeFromFavorites: (productId) => {
    try {
      const updatedFavorites = get().favorites.filter(fav => fav.id !== productId);
      set({ favorites: updatedFavorites });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return { success: false, error: true };
    }
  },

  // Alternar favorito (adicionar ou remover)
  toggleFavorite: (product) => {
    const isFavorite = get().isFavorite(product.id);
    if (isFavorite) {
      return get().removeFromFavorites(product.id);
    } else {
      return get().addToFavorites(product);
    }
  },

  // Verificar se produto está nos favoritos
  isFavorite: (productId) => {
    return get().favorites.some(fav => fav.id === productId);
  },

  // Limpar todos os favoritos
  clearFavorites: () => {
    try {
      set({ favorites: [] });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
    }
  },

  // Obter total de favoritos
  getTotalFavorites: () => {
    return get().favorites.length;
  }
}));
