import { Product, ProductResponse, ProductFilters } from '../types/product';

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
  async getProducts(page = 1, limit = 20, filters?: ProductFilters): Promise<ProductResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters && Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
    });

    return this.fetchApi<ProductResponse>(`/products?${params}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.fetchApi<Product>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.fetchApi<Product[]>('/products/featured');
  }

  async getTopSellingProducts(): Promise<Product[]> {
    return this.fetchApi<Product[]>('/products/top-selling');
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.fetchApi<Product[]>(`/products/category/${category}`);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const params = new URLSearchParams({ q: query });
    return this.fetchApi<Product[]>(`/products/search?${params}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchApi<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
