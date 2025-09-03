import create from 'zustand';

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  setProducts: (items) => set({ products: items }),
  setLoading: (status) => set({ loading: status }),
}));
