/**
 * Serviço de produtos - Camada de abstração para API de produtos
 */
import api from './api';

export const productService = {
  /**
   * Lista produtos com filtros e paginação
   */
  async getAll(params = {}) {
    const { page = 1, pageSize = 20, categoria, q } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (categoria) queryParams.append('categoria', categoria);
    if (q) queryParams.append('q', q);
    
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },

  /**
   * Busca produto por ID
   */
  async getById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Busca produtos por categoria
   */
  async getByCategory(categoria, params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    const response = await api.get(`/products/category/${categoria}?${queryParams}`);
    return response.data;
  },

  /**
   * Busca produtos (texto)
   */
  async search(query, params = {}) {
    return this.getAll({ ...params, q: query });
  },

  /**
   * Cria novo produto (Admin)
   */
  async create(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Cria produto com imagem (Admin)
   */
  async createWithImage(formData) {
    const response = await api.post('/products/with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Atualiza produto (Admin)
   */
  async update(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Atualiza imagem do produto (Admin)
   */
  async updateImage(id, formData) {
    const response = await api.put(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Exclui produto (Admin)
   */
  async delete(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Busca produtos em destaque
   */
  async getFeatured(limit = 6) {
    return this.getAll({ page: 1, pageSize: limit });
  },
};

export default productService;
