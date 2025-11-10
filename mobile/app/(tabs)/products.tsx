import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useFilterStore } from '../../store/filterStore';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../types/product';

const CATEGORIES = ['Casual', 'Social', 'Esportivo'];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCategoryFromStore = useFilterStore((state) => state.selectedCategory);
  const clearCategory = useFilterStore((state) => state.clearCategory);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const { addToCart, isInCart } = useCartStore();
  const { success, info } = useToast();

  // Aplicar filtro do store quando a tela é aberta
  useEffect(() => {
    if (selectedCategoryFromStore) {
      setSelectedCategory(selectedCategoryFromStore);
      clearCategory(); // Limpar após aplicar
    }
  }, [selectedCategoryFromStore]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};

      if (selectedCategory) {
        filters.categoria = selectedCategory;
      }

      if (searchQuery) {
        filters.q = searchQuery;
      }

      const response = await apiService.getProducts(page, 12, filters);
      setProducts(response.items || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    setPage(1);
  };

  const handleAddToCart = async (product: Product) => {
    if (isInCart(product.id)) {
      info('Este produto já está no carrinho!');
      return;
    }

    await addToCart(product);
    success(`${product.titulo} adicionado ao carrinho! 🛒`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
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
        style={[
          styles.addButton,
          item.status !== 'disponivel' && styles.addButtonDisabled
        ]}
        onPress={(e) => {
          e.stopPropagation();
          if (item.status === 'disponivel') {
            handleAddToCart(item);
          }
        }}
        disabled={item.status !== 'disponivel'}
      >
        <MaterialIcons name="shopping-cart" size={14} color="white" />
        <Text style={styles.addButtonText}>
          {item.status === 'disponivel' ? '+ Carrinho' : 'Indisponível'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                fetchProducts();
              }}>
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
        {loading ? (
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
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
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
  addButtonDisabled: {
    backgroundColor: '#999',
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
});
