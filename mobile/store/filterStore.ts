import { create } from 'zustand';

interface FilterState {
  selectedCategory: string;
  setCategory: (category: string) => void;
  clearCategory: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategory: '',
  setCategory: (category: string) => set({ selectedCategory: category }),
  clearCategory: () => set({ selectedCategory: '' }),
}));
