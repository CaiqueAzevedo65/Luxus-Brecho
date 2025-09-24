import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/ecommerce/ProductCard';
import { Product } from '../types/product';

export default function FavoritesScreen() {
  const { favorites, isLoading, loadFavorites, removeFromFavorites } = useFavoritesStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!isAuthenticated) {
      Alert.alert(
        'Login necessário',
        'Você precisa estar logado para ver seus favoritos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    // Verificar se é cliente
    if (user?.tipo !== 'Cliente') {
      Alert.alert(
        'Acesso restrito',
        'Apenas clientes podem ter favoritos.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    // Carregar favoritos
    loadFavorites();
  }, [isAuthenticated, user]);

  const handleRemoveFavorite = (product: Product) => {
    Alert.alert(
      'Remover favorito',
      `Deseja remover "${product.titulo}" dos seus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFromFavorites(product._id || ''),
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: Product }) => (
    <View style={styles.favoriteItem}>
      <ProductCard 
        product={item}
        onPress={() => router.push(`/product/${item._id}`)}
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item)}
      >
        <Ionicons name="heart" size={24} color="#E91E63" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      <Text style={styles.emptyText}>
        Explore nossos produtos e adicione seus favoritos aqui
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/')}
      >
        <Text style={styles.exploreButtonText}>Explorar produtos</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated || user?.tipo !== 'Cliente') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#ccc" />
          <Text style={styles.restrictedTitle}>Acesso restrito</Text>
          <Text style={styles.restrictedText}>
            Faça login como cliente para ver seus favoritos
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
        <Text style={styles.headerTitle}>Meus Favoritos</Text>
        <View style={styles.headerRight}>
          <Text style={styles.favoriteCount}>{favorites.length}</Text>
        </View>
      </View>

      {/* Lista de Favoritos */}
      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item._id || ''}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  headerRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  favoriteCount: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    flex: 1,
    margin: 8,
    position: 'relative',
  },
  removeButton: {
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
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
