export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
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
