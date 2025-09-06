import { create } from 'zustand';
import { apiService } from '../services/api';

const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  
  // Actions
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Async actions
  fetchCategories: async (activeOnly = true) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getCategories(1, 10, activeOnly);
      set({ categories: response.items, loading: false });
      return response.items;
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCategoriesSummary: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await apiService.getCategoriesSummary();
      set({ categories, loading: false });
      return categories;
    } catch (error) {
      console.error('Error fetching categories summary:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const newCategory = await apiService.createCategory(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false
      }));
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedCategory = await apiService.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? updatedCategory : cat
        ),
        loading: false
      }));
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  activateCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const activatedCategory = await apiService.activateCategory(id);
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? activatedCategory : cat
        ),
        loading: false
      }));
      return activatedCategory;
    } catch (error) {
      console.error('Error activating category:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  seedCategories: async () => {
    set({ loading: true, error: null });
    try {
      await apiService.seedCategories();
      // Refresh categories after seeding
      await get().fetchCategories();
    } catch (error) {
      console.error('Error seeding categories:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearCategories: () => set({ 
    categories: [], 
    error: null 
  }),

  // Utility getters
  getActiveCategories: () => {
    const { categories } = get();
    return categories.filter(cat => cat.active);
  },

  getCategoryByName: (name) => {
    const { categories } = get();
    return categories.find(cat => cat.name === name);
  },

  getCategoryById: (id) => {
    const { categories } = get();
    return categories.find(cat => cat.id === id);
  }
}));

export default useCategoryStore;
