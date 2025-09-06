import { useEffect } from 'react';
import { apiService } from '../services/api';
import useProductStore from '../store/productStore';
import { ProductFilters } from '../types/product';

export const useProducts = (filters?: ProductFilters) => {
  const { 
    products, 
    loading, 
    error, 
    setProducts, 
    setLoading, 
    setError 
  } = useProductStore();

  const fetchProducts = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts(page, limit, filters);
      setProducts(response.products);
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
  const { 
    featuredProducts, 
    loading, 
    error, 
    setFeaturedProducts, 
    setLoading, 
    setError 
  } = useProductStore();

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await apiService.getFeaturedProducts();
      setFeaturedProducts(products);
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
  const { 
    topSellingProducts, 
    loading, 
    error, 
    setTopSellingProducts, 
    setLoading, 
    setError 
  } = useProductStore();

  const fetchTopSellingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await apiService.getTopSellingProducts();
      setTopSellingProducts(products);
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
  const { setLoading, setError } = useProductStore();

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const products = await apiService.searchProducts(query);
      return products;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { searchProducts };
};
