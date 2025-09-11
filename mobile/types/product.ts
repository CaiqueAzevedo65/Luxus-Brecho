export interface Product {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
  disponivel?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Campos extras para UI (não vêm do backend)
  _id?: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  brand?: string;
  size?: string[];
  color?: string[];
  condition?: 'novo' | 'seminovo' | 'usado';
  images?: string[];
  stock?: number;
  isExclusive?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: Review[];
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  size?: string;
  color?: string;
}

export interface ProductResponse {
  items: Product[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}
