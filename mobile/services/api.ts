import { Product, ProductResponse, ProductFilters } from '../types/product';
import { Category, CategoryResponse } from '../types/category';

const API_BASE_URL = 'http://localhost:3000/api'; // Ajuste para sua URL do backend

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Produtos
  async getProducts(page = 1, page_size = 20, filters?: ProductFilters): Promise<ProductResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...filters && Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });

    return this.fetchApi<ProductResponse>(`/products?${params}`);
  }

  async getProductById(id: number): Promise<Product> {
    return this.fetchApi<Product>(`/products/${id}`);
  }

  async getProductsByCategory(categoria: string, page = 1, page_size = 20): Promise<ProductResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });
    return this.fetchApi<ProductResponse>(`/products/category/${categoria}?${params}`);
  }

  async searchProducts(query: string, page = 1, page_size = 20): Promise<ProductResponse> {
    const params = new URLSearchParams({ 
      q: query,
      page: page.toString(),
      page_size: page_size.toString(),
    });
    return this.fetchApi<ProductResponse>(`/products?${params}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.fetchApi<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    return this.fetchApi<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categorias
  async getCategories(page = 1, page_size = 10, active_only = true): Promise<CategoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      active_only: active_only.toString(),
    });

    return this.fetchApi<CategoryResponse>(`/categories?${params}`);
  }

  async getCategoriesSummary(): Promise<Category[]> {
    return this.fetchApi<Category[]>('/categories/summary');
  }

  async getCategoryById(id: number): Promise<Category> {
    return this.fetchApi<Category>(`/categories/${id}`);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return this.fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    return this.fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async activateCategory(id: number): Promise<Category> {
    return this.fetchApi<Category>(`/categories/${id}/activate`, {
      method: 'PUT',
    });
  }

  async seedCategories(): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>('/categories/seed', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchApi<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
