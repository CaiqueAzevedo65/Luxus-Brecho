/**
 * Serviço de categorias - Camada de abstração para API de categorias
 */
import api from './api';

export const categoryService = {
  /**
   * Lista categorias com paginação
   */
  async getAll(params = {}) {
    const { page = 1, pageSize = 10, activeOnly = true } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: activeOnly.toString(),
    });
    
    const response = await api.get(`/categories?${queryParams}`);
    return response.data;
  },

  /**
   * Busca resumo de categorias (para navegação)
   */
  async getSummary() {
    const response = await api.get('/categories/summary');
    return response.data;
  },

  /**
   * Busca categoria por ID
   */
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Cria nova categoria (Admin)
   */
  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Atualiza categoria (Admin)
   */
  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Exclui categoria (Admin)
   */
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  /**
   * Ativa categoria (Admin)
   */
  async activate(id) {
    const response = await api.put(`/categories/${id}/activate`);
    return response.data;
  },
};

export default categoryService;
