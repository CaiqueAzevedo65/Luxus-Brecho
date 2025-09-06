import { create } from 'zustand';
import { apiService } from '../services/api';

const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  topSellingProducts: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    page_size: 20,
    total: 0
  },
  
  // Basic setters
  setProducts: (products) => set({ products }),
  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
  setTopSellingProducts: (topSellingProducts) => set({ topSellingProducts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  
  // API-integrated actions
  fetchProducts: async (page = 1, page_size = 20, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getProducts(page, page_size, filters);
      set({ 
        products: response.items,
        pagination: response.pagination,
        loading: false 
      });
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProductsByCategory: async (categoria, page = 1, page_size = 20) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getProductsByCategory(categoria, page, page_size);
      set({ 
        products: response.items,
        pagination: response.pagination,
        loading: false 
      });
      return response;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchProducts: async (query, page = 1, page_size = 20) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.searchProducts(query, page, page_size);
      set({ 
        products: response.items,
        pagination: response.pagination,
        loading: false 
      });
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const product = await apiService.getProductById(id);
      set({ loading: false });
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await apiService.createProduct(productData);
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false
      }));
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await apiService.updateProduct(id, updates);
      set((state) => ({
        products: state.products.map(p => 
          p.id === id ? updatedProduct : p
        ),
        loading: false
      }));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter(p => p.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter(p => (p.id || p._id) !== productId)
  })),
  
  clearProducts: () => set({ 
    products: [], 
    featuredProducts: [], 
    topSellingProducts: [],
    error: null,
    pagination: {
      page: 1,
      page_size: 20,
      total: 0
    }
  }),

  // Utility getters
  getProductById: (id) => {
    const { products } = get();
    return products.find(p => p.id === id || p._id === id);
  },

  getProductsByCategory: (categoria) => {
    const { products } = get();
    return products.filter(p => p.categoria === categoria);
  }
}));

export default useProductStore;
