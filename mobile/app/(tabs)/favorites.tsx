import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../types/product';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCartStore();
  const { success, info } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const savedFavorites = await AsyncStorage.getItem('favoriteProducts');
      
      if (savedFavorites) {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        
        // Buscar detalhes dos produtos favoritos
        const favoriteProducts = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              return await apiService.getProductById(id);
            } catch (error) {
              console.error(`Erro ao carregar produto ${id}:`, error);
              return null;
            }
          })
        );
        
        // Filtrar produtos nulos (que falharam ao carregar)
        setFavorites(favoriteProducts.filter((p): p is Product => p !== null));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteProducts');
      if (savedFavorites) {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        const newFavorites = favoriteIds.filter(id => id !== productId);
        await AsyncStorage.setItem('favoriteProducts', JSON.stringify(newFavorites));
        
        // Atualizar lista local
        setFavorites(prev => prev.filter(p => p.id !== productId));
        info('Removido dos favoritos');
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
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

      {/* Botão de Remover Favorito */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveFavorite(item.id);
        }}
      >
        <MaterialIcons name="favorite" size={24} color="#E91E63" />
      </TouchableOpacity>

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
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Carregando favoritos...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>
              Explore nossos produtos e adicione seus favoritos aqui
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/products')}
            >
              <Text style={styles.exploreButtonText}>Explorar Produtos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  countText: {
    color: 'white',
    fontSize: 14,
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
    position: 'relative',
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
});
