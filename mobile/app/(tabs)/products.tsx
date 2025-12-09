import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useFilterStore } from '../../store/filterStore';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import type { Product } from '../../types/product';

const CATEGORIES = ['Casual', 'Social', 'Esportivo'];
const PAGE_SIZE = 12;

// Hook de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCategoryFromStore = useFilterStore((state) => state.selectedCategory);
  const clearCategory = useFilterStore((state) => state.clearCategory);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { addToCart, isInCart } = useCartStore();
  const { success, info } = useToast();

  // Debounce da busca (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Aplicar filtro do store quando a tela é aberta
  useEffect(() => {
    if (selectedCategoryFromStore) {
      setSelectedCategory(selectedCategoryFromStore);
      clearCategory(); // Limpar após aplicar
    }
  }, [selectedCategoryFromStore]);

  // Buscar produtos quando filtros mudam
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, true);
  }, [selectedCategory, debouncedSearchQuery]);

  const fetchProducts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const filters: any = {};

      if (selectedCategory) {
        filters.categoria = selectedCategory;
      }

      if (debouncedSearchQuery) {
        filters.q = debouncedSearchQuery;
      }

      const response = await apiService.getProducts(pageNum, PAGE_SIZE, filters);
      
      // Filtrar apenas produtos disponíveis para exibição pública
      const availableProducts = (response.items || []).filter(
        (product: Product) => product.status === 'disponivel'
      );

      if (reset) {
        setProducts(availableProducts);
      } else {
        setProducts(prev => [...prev, ...availableProducts]);
      }

      // Verificar se há mais produtos
      const totalPages = Math.ceil((response.pagination?.total || 0) / PAGE_SIZE);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);

    } catch (error) {
      logger.error('Erro ao carregar produtos', error as Error, 'PRODUCTS');
      if (reset) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategory, debouncedSearchQuery]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Carregar mais (paginação infinita)
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchProducts(page + 1, false);
    }
  }, [loadingMore, hasMore, loading, page, fetchProducts]);

  const handleCategoryFilter = useCallback((category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
  }, [selectedCategory]);

  const handleAddToCart = useCallback(async (product: Product) => {
    if (isInCart(product.id)) {
      info('Este produto já está no carrinho!');
      return;
    }

    await addToCart(product);
    success(`${product.titulo} adicionado ao carrinho! 🛒`);
  }, [isInCart, addToCart, info, success]);

  // Memoizar renderProduct para evitar re-renders
  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        {item.imagem ? (
          <Image
            source={{ uri: item.imagem }}
            style={styles.productImage}
            resizeMode="cover"
            defaultSource={require('../../assets/images/icon.png')}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="checkroom" size={40} color="#E0E0E0" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.productPrice}>
          R$ {(item.preco || 0).toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={(e) => {
          e.stopPropagation();
          handleAddToCart(item);
        }}
      >
        <MaterialIcons name="shopping-cart" size={14} color="white" />
        <Text style={styles.addButtonText}>+ Carrinho</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleAddToCart]);

  // Footer para loading de paginação
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E91E63" />
        <Text style={styles.footerText}>Carregando mais...</Text>
      </View>
    );
  }, [loadingMore]);

  // Key extractor memoizado
  const keyExtractor = useCallback((item: Product) => item.id.toString(), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Produtos</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Categorias:</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            {selectedCategory && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => handleCategoryFilter(selectedCategory)}
              >
                <Ionicons name="close" size={16} color="#E91E63" />
                <Text style={styles.clearFilterText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="checkroom" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'Tente ajustar os filtros de busca'
                : 'Não há produtos disponíveis no momento'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={keyExtractor}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#E91E63']}
                tintColor="#E91E63"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
  },
  productsGrid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '47%',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});
