export interface Category {
  id: number;
  name: string;        
  description: string;   
  active: boolean;      
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  items: Category[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}

export type CategoryName = 'Casual' | 'Social' | 'Esportivo';

export const ALLOWED_CATEGORIES: CategoryName[] = ['Casual', 'Social', 'Esportivo'];
