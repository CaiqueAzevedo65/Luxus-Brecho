export interface Category {
  id: number;
  nome: string;        
  descricao: string;   
  ativa: boolean;      
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
