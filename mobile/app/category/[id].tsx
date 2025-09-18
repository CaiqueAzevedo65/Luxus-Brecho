import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { Product } from '../../types/product';
import { useCartStore } from '../../store/cartStore';

const categories = [
  { 
    id: 'casual', 
    title: 'Casual',
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468452915_17928657050967827_7578668394488839966_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0NTI5MTVfMTc5Mjg2NTcwNTA5Njc4MjdfNzU3ODY2ODM5NDQ4ODgzOTk2Nl9uLnBuZyIsImlhdCI6MTc1NzcwNDg3MCwiZXhwIjoxNzg5MjQwODcwfQ.J66iL4I5K3b0rQyRrV4u9eekqVx1ekR517RVgoP5bmk'
  },
  { 
    id: 'social',
    title: 'Social',
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/Captura%20de%20tela%202025-06-03%20200924.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9DYXB0dXJhIGRlIHRlbGEgMjAyNS0wNi0wMyAyMDA5MjQucG5nIiwiaWF0IjoxNzU3NzA0ODg0LCJleHAiOjE3ODkyNDA4ODR9.CbhbTjEGk59ONGoDvjxzaaXd8PVHi9M48xF2cOQDTNU'
  },
  { 
    id: 'esportivo',
    title: 'Esportivo',
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468403560_17928651893967827_8798510667129991733_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0MDM1NjBfMTc5Mjg2NTE4OTM5Njc4MjdfODc5ODUxMDY2NzEyOTk5MTczM19uLnBuZyIsImlhdCI6MTc1NzcwNDgyMywiZXhwIjoxNzg5MjQwODIzfQ.hyXpfqqAgGRVW2Ke_XguKDLijxXMlqXX9ibHjkxvwv0'
  }
];

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const category = categories.find(c => c.id === id);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const categoryTitle = category?.title as "Casual" | "Social" | "Esportivo";
        const response = await apiService.getProductsByCategory(categoryTitle);
        setProducts(response.items || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      loadProducts();
    }
  }, [category]);

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categoria não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.title}</Text>
      </View>

      {/* Products Grid */}
      <ScrollView contentContainerStyle={styles.productsGrid}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum produto encontrado nesta categoria.</Text>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <View style={styles.imageContainer}>
                {product.imagem ? (
                  <Image
                    source={{
                      uri: product.imagem,
                      cache: 'force-cache',
                      headers: {
                        'Cache-Control': 'max-age=31536000'
                      }
                    }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() => console.warn('Erro ao carregar imagem:', product.imagem)}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={32} color="#ccc" />
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.titulo}
                </Text>
                <Text style={styles.productPrice}>
                  R$ {product.preco.toFixed(2).replace('.', ',')}
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                >
                  <Text style={styles.addButtonText}>+ Carrinho</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  banner: {
    height: 150,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  productsGrid: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#E91E63',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
