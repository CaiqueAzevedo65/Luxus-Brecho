import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFeaturedProducts, useTopSellingProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useFilterStore } from '../../store/filterStore';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../types/product';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

const { width } = Dimensions.get('window');

interface Testimonial {
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  { rating: 5, text: 'Excelente qualidade e ótimo atendimento!' },
  { rating: 5, text: 'Peças lindas e bem conservadas.' },
  { rating: 5, text: 'Recomendo muito! Preços justos.' }
];

export default function HomeScreen() {
  const { success, error, info, warning } = useToast();
  const setCategory = useFilterStore((state) => state.setCategory);
  const { 
    featuredProducts: allFeaturedProducts, 
    loading: loadingFeatured, 
    error: errorFeatured 
  } = useFeaturedProducts();
  
  const { 
    topSellingProducts, 
    loading: loadingTopSelling, 
    error: errorTopSelling 
  } = useTopSellingProducts();

  // Filtrar apenas produtos disponíveis
  const featuredProducts = allFeaturedProducts.filter(product => product.status === 'disponivel');

  const addToCart = useCartStore((state) => state.addToCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItemCount = getTotalItems();

  const handleCategoryPress = (category: string) => {
    setCategory(category);
    router.push('/(tabs)/products');
  };

  const handleAddToCart = async (product: Product) => {
    const isAlreadyInCart = useCartStore.getState().isInCart(product.id);
    
    if (isAlreadyInCart) {
      info('Este produto já está no carrinho!');
      return;
    }
    
    await addToCart(product);
    success(`${product.titulo} adicionado ao carrinho! 🛒`);
  };

  const renderFeaturedProducts = () => {
    if (loadingFeatured) {
      return (
        <View className="py-10 items-center">
          <ActivityIndicator size="large" color="#E91E63" />
          <Text className="text-gray-500 mt-2">Carregando produtos...</Text>
        </View>
      );
    }

    if (errorFeatured) {
      return (
        <View className="py-5 items-center px-4">
          <Text className="text-pink-600 text-center">{errorFeatured}</Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
        {featuredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              marginRight: 12, 
              width: width * 0.42,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              overflow: 'hidden'
            }}
            onPress={() => router.push(`/product/${product.id}`)}
          >
            <View style={{ width: '100%', height: 180, backgroundColor: '#f0f0f0' }}>
              {product.imagem ? (
                <Image
                  source={{
                    uri: product.imagem,
                    cache: 'force-cache',
                    headers: {
                      'Cache-Control': 'max-age=31536000'
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={() => console.warn('Erro ao carregar imagem:', product.imagem)}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialIcons name="checkroom" size={40} color="#E0E0E0" />
                </View>
              )}
            </View>

            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, minHeight: 40 }} numberOfLines={2}>
                {product.titulo}
              </Text>

              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E91E63', marginBottom: 8 }}>
                R$ {(product.preco || 0).toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <TouchableOpacity
              style={{ 
                backgroundColor: product.status === 'disponivel' ? '#E91E63' : '#999',
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                paddingVertical: 10,
                gap: 6
              }}
              onPress={(e) => {
                e.stopPropagation();
                if (product.status === 'disponivel') {
                  handleAddToCart(product);
                }
              }}
              disabled={product.status !== 'disponivel'}
            >
              <MaterialIcons name="shopping-cart" size={14} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {product.status === 'disponivel' ? '+ Carrinho' : 'Indisponível'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#E91E63', paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <TouchableOpacity 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.9)', 
                borderRadius: 20, 
                flexDirection: 'row', 
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8
              }}
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search" size={20} color="#666" />
              <Text style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>Buscar produtos...</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Principal */}
        <View className="px-4 mb-6">
          <View className="relative rounded-xl overflow-hidden">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              className="w-full"
            >
              {[1, 2, 3].map((_, index) => (
                <View
                  key={index}
                  style={{ width: width - 32 }}
                  className="relative aspect-[4/3]"
                >
                  <Image
                    source={{ uri: `https://picsum.photos/800/600?random=${index}` }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/30 justify-center items-center">
                    <Text className="text-white text-2xl font-bold text-center mb-2">
                      Encontre Roupas que{"\n"}Encaixem com seu estilo
                    </Text>
                    <Text className="text-white text-base text-center">
                      Diversas marcas em bom estado!
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View className="absolute bottom-4 w-full flex-row justify-center space-x-2">
              {[0, 1, 2].map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 rounded-full bg-white/50"
                  style={index === 0 ? { backgroundColor: 'white' } : {}}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Produtos em Destaque */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-base font-bold text-gray-800">Produtos em Destaque</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text className="text-pink-600 text-sm">Ver Mais</Text>
            </TouchableOpacity>
          </View>
          
          {renderFeaturedProducts()}
        </View>

        {/* PESQUISE POR ESTILO */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-pink-600 text-center mb-4">
            PESQUISE POR ESTILO
          </Text>
          
          <View className="px-4">
            <View className="flex-row justify-between mb-4">
              {/* Categoria Casual */}
              <TouchableOpacity 
                style={{ width: '48%' }}
                className="rounded-xl shadow-sm overflow-hidden aspect-square"
                onPress={() => handleCategoryPress('Casual')}
              >
                <Image
                  source={{
                    uri: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/casual.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9jYXN1YWwucG5nIiwiaWF0IjoxNzU3NzI2MTIyLCJleHAiOjE3ODkyNjIxMjJ9.UKmBAgjtEYZ4hQpP17Lh4la2osOuaj6Q8EeSz8NL1Eo',
                    cache: 'force-cache'
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/20 justify-end p-3">
                  <Text className="text-white text-lg font-bold">
                    Casual
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Categoria Social */}
              <TouchableOpacity 
                style={{ width: '48%' }}
                className="rounded-xl shadow-sm overflow-hidden aspect-square"
                onPress={() => handleCategoryPress('Social')}
              >
                <Image
                  source={{
                    uri: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/social.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9zb2NpYWwucG5nIiwiaWF0IjoxNzU3NzI2MTYwLCJleHAiOjE3ODkyNjIxNjB9.tmafoLASIGCieYzM-rRv-cQxp26suWzMGW1_cK_5ZJc',
                    cache: 'force-cache'
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/20 justify-end p-3">
                  <Text className="text-white text-lg font-bold">
                    Social
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Categoria Esportivo */}
            <TouchableOpacity 
              className="rounded-xl shadow-sm overflow-hidden aspect-[2/1] w-full"
              onPress={() => handleCategoryPress('Esportivo')}
            >
              <Image
                source={{
                  uri: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/esportivo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9lc3BvcnRpdm8ucG5nIiwiaWF0IjoxNzU3NzI2MTQxLCJleHAiOjE3ODkyNjIxNDF9.F6XpbxRgaQZIsQL7wGKQjY9lObD1f6TjlRW2EESZcks',
                  cache: 'force-cache'
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/20 justify-end p-3">
                <Text className="text-white text-lg font-bold">
                  Esportivo
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Section */}
        <View className="bg-white mx-4 rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm text-gray-600 mb-3">
            Para tirar suas dúvidas
          </Text>
          <View className="flex-row justify-end">
            <TouchableOpacity 
              className="bg-pink-600 px-4 py-2 rounded-full"
              onPress={() => router.push('/support')}
            >
              <Text className="text-white text-xs">Preciso de ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="bg-pink-600 mx-4 rounded-xl p-4 mb-4">
          <Text className="text-white text-lg font-bold mb-4">
            luxus.brecho...
          </Text>
          <View className="flex-row justify-between items-center">
            <View>
              <TouchableOpacity onPress={() => router.push('/support')}>
                <Text className="text-white text-xs mb-1">Suporte</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/contact')}>
                <Text className="text-white text-xs mb-1">Contato</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <ConnectionStatus />
      </SafeAreaView>
    </View>
  );
}
