// Tipos base para categorias
export type ProductCategory = 'Casual' | 'Social' | 'Esportivo';
export type ProductCondition = 'novo' | 'seminovo' | 'usado';

// Interface principal do produto (vem do backend)
export interface Product {
  // Campos obrigatórios do backend
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: ProductCategory;
  imagem: string; // Obrigatório conforme requisitos
  disponivel: boolean;
  created_at: string;
  updated_at: string;
  
  // Campo MongoDB
  _id?: string;
}

// Interface estendida para UI (campos extras opcionais)
export interface ProductUI extends Product {
  // Campos alternativos para compatibilidade
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  
  // Campos extras para UI
  brand?: string;
  size?: string[];
  color?: string[];
  condition?: ProductCondition;
  images?: string[];
  isExclusive?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: Review[];
}

// Interface para criação de produto (formulário)
export interface CreateProductData {
  titulo: string;
  descricao: string;
  preco: number;
  categoria: ProductCategory;
  image: {
    uri: string;
  };
}

// Interface para produto favorito (simplificada)
export interface FavoriteProduct {
  id: number;
  titulo: string;
  preco: number;
  imagem: string;
  categoria: ProductCategory;
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
  category?: 'Casual' | 'Social' | 'Esportivo';
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  size?: string;
  color?: string;
  q?: string; // Para busca por texto
}

export interface ProductResponse {
  items: Product[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}
