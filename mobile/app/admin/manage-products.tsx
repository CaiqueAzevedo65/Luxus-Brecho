import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Product, ProductUI } from '../../types/product';

export default function ManageProductsScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Verificar se é administrador
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      Alert.alert(
        'Acesso negado',
        'Apenas administradores podem gerenciar produtos.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadProducts();
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Filtrar produtos baseado na busca
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProducts(1, 100); // Parâmetros separados
      setProducts(response.items || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Erro ao carregar produtos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/edit-product/${product._id}`);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Excluir Produto',
      `Tem certeza que deseja excluir "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDeleteProduct(product),
        },
      ]
    );
  };

  const confirmDeleteProduct = async (product: Product) => {
    try {
      const productId = product.id || parseInt(product._id || '0') || 0;
      await apiService.deleteProduct(productId);
      Alert.alert('Sucesso', 'Produto excluído com sucesso!');
      loadProducts(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      Alert.alert('Erro', 'Erro ao excluir produto. Tente novamente.');
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      {/* Imagem do produto */}
      <View style={styles.productImageContainer}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color="#999" />
          </View>
        )}
      </View>

      {/* Informações do produto */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descricao}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>
            R$ {item.preco.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={styles.productBrand}>{item.categoria}</Text>
        </View>
        <View style={styles.productStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.disponivel !== false ? '#22C55E' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
              {item.disponivel !== false ? 'Disponível' : 'Indisponível'}
            </Text>
          </View>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cube-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Tente buscar com outros termos' : 'Comece criando seu primeiro produto'}
        </Text>
        {!searchQuery && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/admin/create-product')}
          >
            <Text style={styles.createButtonText}>Criar produto</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="shield-outline" size={80} color="#EF4444" />
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedText}>
            Apenas administradores podem acessar esta tela
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/create-product')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contador de produtos */}
      {!isLoading && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
            {searchQuery && ` encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      )}

      {/* Lista de produtos */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item._id || item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadProducts}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#E91E63',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  counterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  counterText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  productBrand: {
    fontSize: 12,
    color: '#999',
  },
  productStatus: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productActions: {
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
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
  createButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
