import { Product, ProductResponse, ProductFilters } from '../types/product';
import { Category, CategoryResponse } from '../types/category';
import { cacheManager } from '../utils/cache';
import { getApiUrl, getNetworkInfo } from '../utils/networkUtils';
import { CONFIG } from '../constants/config';

// URL da API detectada automaticamente
const API_BASE_URL = getApiUrl();

// Log das informações de rede para debug
if (__DEV__) {
  console.log('🌐 Network Info:', getNetworkInfo());
  console.log('🔗 Using API URL:', API_BASE_URL);
}

// Log apenas em desenvolvimento
if (CONFIG.DEBUG.ENABLE_API_LOGS) {
  console.log('🌐 Usando API:', API_BASE_URL);
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: any;
}

class ApiService {
  private timeout = CONFIG.API.TIMEOUT;
  private maxRetries = CONFIG.API.MAX_RETRIES;
  private retryDelay = CONFIG.API.RETRY_DELAY;
  private initialDelay = CONFIG.API.INITIAL_DELAY;

  private async fetchApi<T>(
    endpoint: string, 
    options?: RequestInit & { useCache?: boolean; cacheMinutes?: number },
    retryCount = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Tenta buscar do cache primeiro
      if (options?.useCache && options.method?.toUpperCase() === 'GET') {
        const cached = await cacheManager.get<T>(endpoint, { 
          expirationMinutes: options.cacheMinutes || CONFIG.API.CACHE_MINUTES.DEFAULT
        });
        if (cached) {
          if (CONFIG.DEBUG.ENABLE_CACHE_LOGS) {
            console.log(`📦 Cache hit: ${endpoint}`);
          }
          return cached;
        }
      }

      // Adiciona um pequeno delay inicial para dar tempo do emulador responder
      if (retryCount === 0) {
        await this.delay(this.initialDelay);
      }

      if (CONFIG.DEBUG.ENABLE_API_LOGS) {
        console.log(`🔗 API Request: ${API_BASE_URL}${endpoint} (timeout: ${this.timeout}ms)`);
      }
      
      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'X-Client-Version': '1.0.0',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Unknown error');
        const error: ApiError = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.response = errorData;
        
        console.error('❌ API Error:', error);
        throw error;
      }

      const data = await response.json();
      const endTime = Date.now();
      
      if (CONFIG.DEBUG.ENABLE_API_LOGS) {
        console.log(`✅ API Success: ${endpoint} (${endTime - startTime}ms)`);
      }

      // Salva no cache se necessário
      if (options?.useCache && options.method?.toUpperCase() === 'GET') {
        await cacheManager.set(endpoint, data, { 
          expirationMinutes: options.cacheMinutes || CONFIG.API.CACHE_MINUTES.DEFAULT
        });
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry lógica para erros de rede (corrigido)
      const apiError = error as ApiError;
      if (
        retryCount < this.maxRetries && 
        ((error as any).name === 'AbortError' || 
        apiError.status === undefined ||
        apiError.status >= 500)
      ) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        if (CONFIG.DEBUG.ENABLE_API_LOGS) {
          console.warn(`🔄 Retrying request (${retryCount + 1}/${this.maxRetries}): ${endpoint} in ${delay}ms`);
        }
        await this.delay(delay); // Backoff exponencial
        return this.fetchApi<T>(endpoint, options, retryCount + 1);
      }

      // Log detalhado do erro
      if ((error as any).name === 'AbortError') {
        console.error('⏰ Request timeout:', endpoint);
        throw new Error('Tempo limite de conexão excedido. Verifique sua internet.');
      }

      if ((error as ApiError).status === undefined) {
        console.error('🌐 Network error:', endpoint, error);
        throw new Error('Erro de conexão. Verifique se o backend está rodando e sua internet.');
      }

      console.error('💥 API Request failed:', endpoint, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check com diagnóstico detalhado
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const result = await this.fetchApi<{ status: string; timestamp: string }>('/health');
      if (CONFIG.DEBUG.ENABLE_API_LOGS) {
        console.log('💚 Backend está online!');
      }
      return result;
    } catch (error) {
      console.error('💔 Backend não está acessível:', error);
      throw new Error('Backend não está acessível. Verifique se está rodando na porta 5000.');
    }
  }

  // Teste de conectividade
  async testConnection(): Promise<{ 
    backend: boolean; 
    api_url: string; 
    error?: string 
  }> {
    try {
      await this.healthCheck();
      return { 
        backend: true, 
        api_url: API_BASE_URL 
      };
    } catch (error) {
      return { 
        backend: false, 
        api_url: API_BASE_URL, 
        error: (error as Error).message 
      };
    }
  }

  // Produtos com tratamento de erro melhorado
  async getProducts(page = 1, page_size = 20, filters?: ProductFilters): Promise<ProductResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: page_size.toString(),
        ...filters && Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      return await this.fetchApi<ProductResponse>(`/products?${params}`, {
        useCache: true,
        cacheMinutes: CONFIG.API.CACHE_MINUTES.PRODUCTS
      });
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      // Retorna estrutura vazia em caso de erro
      return {
        items: [],
        pagination: { page, page_size, total: 0 }
      };
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      return await this.fetchApi<Product>(`/products/${id}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar produto ${id}:`, error);
      return null;
    }
  }

  async getProductsByCategory(categoria: 'Casual' | 'Social' | 'Esportivo', page = 1, page_size = 20): Promise<ProductResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: page_size.toString(),
      });
      return await this.fetchApi<ProductResponse>(`/products/category/${categoria}?${params}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar produtos da categoria ${categoria}:`, error);
      return {
        items: [],
        pagination: { page, page_size, total: 0 }
      };
    }
  }

  async searchProducts(query: string, page = 1, page_size = 20): Promise<ProductResponse> {
    try {
      const params = new URLSearchParams({ 
        q: query,
        page: page.toString(),
        page_size: page_size.toString(),
      });
      return await this.fetchApi<ProductResponse>(`/products?${params}`);
    } catch (error) {
      console.error(`❌ Erro ao buscar produtos com "${query}":`, error);
      return {
        items: [],
        pagination: { page, page_size, total: 0 }
      };
    }
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      const result = await this.fetchApi<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
      // Invalida cache de produtos após criar
      await cacheManager.invalidateProducts();
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      return null;
    }
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    try {
      const result = await this.fetchApi<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      // Invalida cache de produtos após atualizar
      await cacheManager.invalidateProducts();
      return result;
    } catch (error) {
      console.error(`❌ Erro ao atualizar produto ${id}:`, error);
      return null;
    }
  }

  async deleteProduct(id: number): Promise<{ message: string } | null> {
    try {
      const result = await this.fetchApi<{ message: string }>(`/products/${id}`, {
        method: 'DELETE',
      });
      // Invalida cache de produtos após deletar
      await cacheManager.invalidateProducts();
      return result;
    } catch (error) {
      console.error(`❌ Erro ao deletar produto ${id}:`, error);
      return null;
    }
  }

  // Produtos especializados
  async getFeaturedProducts(): Promise<Product[]> {
    const cacheKey = 'featured_products';

    try {
      // Como não temos endpoint específico, busca produtos em destaque
      const response = await this.getProducts(1, 20);
      // Retorna os primeiros produtos como destaque
      return response.items || [];
    } catch (error) {
      console.error('❌ Erro ao carregar produtos em destaque:', error);
      return [];
    }
  }

  async getTopSellingProducts(): Promise<Product[]> {
    try {
      // Como não temos endpoint específico, busca produtos populares
      const response = await this.getProducts(1, 20);
      return response.items || [];
    } catch (error) {
      console.error('❌ Erro ao carregar produtos mais vendidos:', error);
      return [];
    }
  }

  // Categorias com tratamento de erro
  async getCategories(page = 1, page_size = 10, active_only = true): Promise<CategoryResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: page_size.toString(),
        active_only: active_only.toString(),
      });

      return await this.fetchApi<CategoryResponse>(`/categories?${params}`);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      return {
        items: [],
        pagination: { page, page_size, total: 0 }
      };
    }
  }

  async getCategoriesSummary(): Promise<Category[]> {
    try {
      return await this.fetchApi<Category[]>('/categories/summary', {
        useCache: true,
        cacheMinutes: CONFIG.API.CACHE_MINUTES.CATEGORIES
      });
    } catch (error) {
      console.error('❌ Erro ao carregar resumo de categorias:', error);
      return [];
    }
  }

// ... (rest of the code remains the same)
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      return await this.fetchApi<Category>(`/categories/${id}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar categoria ${id}:`, error);
      return null;
    }
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
    try {
      return await this.fetchApi<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      return null;
    }
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
    try {
      return await this.fetchApi<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error(`❌ Erro ao atualizar categoria ${id}:`, error);
      return null;
    }
  }

  async deleteCategory(id: number): Promise<{ message: string } | null> {
    try {
      return await this.fetchApi<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`❌ Erro ao deletar categoria ${id}:`, error);
      return null;
    }
  }

  async activateCategory(id: number): Promise<Category | null> {
    try {
      return await this.fetchApi<Category>(`/categories/${id}/activate`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error(`❌ Erro ao ativar categoria ${id}:`, error);
      return null;
    }
  }


  // Imagens com tratamento de erro
  async uploadProductImage(formData: FormData): Promise<{ message: string; image_url: string; filename: string; size: number } | null> {
    try {
      return await this.fetchApi<{ message: string; image_url: string; filename: string; size: number }>('/images/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Remove Content-Type para FormData
      });
    } catch (error) {
      console.error('❌ Erro ao fazer upload de imagem:', error);
      return null;
    }
  }

  async uploadMultipleImages(formData: FormData): Promise<{ message: string; images: Array<{ image_url: string; filename: string; size: number }> } | null> {
    try {
      return await this.fetchApi<{ message: string; images: Array<{ image_url: string; filename: string; size: number }> }>('/images/upload-multiple', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    } catch (error) {
      console.error('❌ Erro ao fazer upload múltiplo de imagens:', error);
      return null;
    }
  }

  async deleteProductImage(imageUrl: string): Promise<{ message: string } | null> {
    try {
      return await this.fetchApi<{ message: string }>('/images/delete', {
        method: 'DELETE',
        body: JSON.stringify({ image_url: imageUrl }),
      });
    } catch (error) {
      console.error('❌ Erro ao deletar imagem:', error);
      return null;
    }
  }

  async getProductImages(productId: number): Promise<{ product_id: string; images: string[]; count: number } | null> {
    try {
      return await this.fetchApi<{ product_id: string; images: string[]; count: number }>(`/images/product/${productId}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar imagens do produto ${productId}:`, error);
      return null;
    }
  }

  async getImageInfo(imageUrl: string): Promise<{ size: number; content_type: string; last_modified: string; url: string } | null> {
    try {
      const params = new URLSearchParams({ image_url: imageUrl });
      return await this.fetchApi<{ size: number; content_type: string; last_modified: string; url: string }>(`/images/info?${params}`);
    } catch (error) {
      console.error('❌ Erro ao obter informações da imagem:', error);
      return null;
    }
  }

  async createProductWithImage(formData: FormData): Promise<{ message: string; product: Product } | null> {
    try {
      return await this.fetchApi<{ message: string; product: Product }>('/products/with-image', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    } catch (error) {
      console.error('❌ Erro ao criar produto com imagem:', error);
      return null;
    }
  }

  async updateProductImage(productId: number, formData: FormData): Promise<{ message: string; product: Product } | null> {
    try {
      return await this.fetchApi<{ message: string; product: Product }>(`/products/${productId}/image`, {
        method: 'PUT',
        body: formData,
        headers: {},
      });
    } catch (error) {
      console.error(`❌ Erro ao atualizar imagem do produto ${productId}:`, error);
      return null;
    }
  }
}

export const apiService = new ApiService();
