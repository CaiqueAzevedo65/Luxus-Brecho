import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Product, ProductFilters, ProductResponse } from '../types/product';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductResponse['pagination']>();

  const fetchProducts = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts(page, limit, filters);
      setProducts(response.items.map(item => ({
        ...item,
        preco: Number(item.preco) || 0
      })));
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(),
    fetchMore: (page: number) => fetchProducts(page),
  };
};

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await apiService.getFeaturedProducts();
      setFeaturedProducts(products.map(item => ({
        ...item,
        preco: Number(item.preco) || 0
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos em destaque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return {
    featuredProducts,
    loading,
    error,
    refetch: fetchFeaturedProducts,
  };
};

export const useTopSellingProducts = () => {
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopSellingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await apiService.getTopSellingProducts();
      setTopSellingProducts(products.map(item => ({
        ...item,
        preco: Number(item.preco) || 0
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mais vendidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  return {
    topSellingProducts,
    loading,
    error,
    refetch: fetchTopSellingProducts,
  };
};

export const useProductSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.searchProducts(query);
      return response.items || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { searchProducts };
};
