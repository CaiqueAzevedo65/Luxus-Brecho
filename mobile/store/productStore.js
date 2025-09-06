import { create } from 'zustand';

const useProductStore = create((set) => ({
  products: [],
  featuredProducts: [],
  topSellingProducts: [],
  loading: false,
  error: null,
  
  setProducts: (products) => set({ products }),
  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
  setTopSellingProducts: (topSellingProducts) => set({ topSellingProducts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter(p => p._id !== productId)
  })),
  
  updateProduct: (productId, updates) => set((state) => ({
    products: state.products.map(p => 
      p._id === productId ? { ...p, ...updates } : p
    )
  })),
  
  clearProducts: () => set({ 
    products: [], 
    featuredProducts: [], 
    topSellingProducts: [],
    error: null 
  })
}));

export default useProductStore;
