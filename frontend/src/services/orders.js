/**
 * Serviço de pedidos - Camada de abstração para API de pedidos
 */
import api from './api';

export const orderService = {
  /**
   * Lista pedidos do usuário
   */
  async getMyOrders(params = {}) {
    const { page = 1, pageSize = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    const response = await api.get(`/orders?${queryParams}`);
    return response.data;
  },

  /**
   * Busca pedido por ID
   */
  async getById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Cria novo pedido
   */
  async create(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Atualiza status do pedido (Admin)
   */
  async updateStatus(id, status) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cancela pedido
   */
  async cancel(id) {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  /**
   * Lista todos os pedidos (Admin)
   */
  async getAllAdmin(params = {}) {
    const { page = 1, pageSize = 20, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/orders/admin?${queryParams}`);
    return response.data;
  },
};

export default orderService;
