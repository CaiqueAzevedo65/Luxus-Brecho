import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ProductCard } from '../components/ecommerce/ProductCard';
import { apiService } from '../services/api';
import { Product } from '../types/product';
import { SearchSchema, SearchFormData, useZodValidation } from '../schemas/auth.schema';

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { validate } = useZodValidation(SearchSchema);

  useEffect(() => {
    if (q) {
      handleSearch(q);
    }
  }, [q]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    
    if (!searchTerm.trim()) {
      return;
    }

    // Validar com Zod
    const result = validate({ query: searchTerm.trim() });
    if (!result.success) {
      setError(result.errors?.query || 'Termo de busca inválido');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Buscar produtos usando a API
      const response = await apiService.getProducts(1, 50, {
        q: searchTerm.trim(),
      });

      setProducts(response.items || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      setError('Erro ao buscar produtos. Tente novamente.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <ProductCard 
        {...item}
        onPress={() => router.push(`/product/${item._id}`)}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Buscando produtos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
          <Text style={styles.errorTitle}>Erro na busca</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleSearch()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasSearched && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
          <Text style={styles.emptyText}>
            Tente buscar com outros termos ou explore nossas categorias
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.exploreButtonText}>Ver categorias</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Digite algo para buscar</Text>
          <Text style={styles.emptyText}>
            Encontre produtos por nome, marca ou categoria
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com busca */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch()}
          disabled={isLoading}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      <View style={styles.content}>
        {hasSearched && products.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </Text>
            {searchQuery && (
              <Text style={styles.searchTerm}>para "{searchQuery}"</Text>
            )}
          </View>
        )}

        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id || ''}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchTerm: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  productItem: {
    flex: 1,
    margin: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
