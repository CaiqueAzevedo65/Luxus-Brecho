import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFeaturedProducts, useTopSellingProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
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
  const { 
    featuredProducts, 
    loading: loadingFeatured, 
    error: errorFeatured 
  } = useFeaturedProducts();
  
  const { 
    topSellingProducts, 
    loading: loadingTopSelling, 
    error: errorTopSelling 
  } = useTopSellingProducts();

  const { addToCart, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

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
            onPress={() => router.push(`/product/${product.id}`)}
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 12, 
              marginRight: 12, 
              width: width * 0.42,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            <View style={{ width: '100%', height: 160, backgroundColor: '#f0f0f0', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
              {product.imagem ? (
                <Image
                  source={{
                    uri: product.imagem,
                    cache: 'force-cache',
                    headers: {
                      'Cache-Control': 'max-age=31536000'
                    }
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => console.warn('Erro ao carregar imagem:', product.imagem)}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <MaterialIcons name="checkroom" size={40} color="#E0E0E0" />
                </View>
              )}
            </View>

            <Text style={{ color: '#333', fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 }} numberOfLines={2}>
              {product.titulo}
            </Text>

            <Text style={{ color: '#E91E63', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
              R$ {(product.preco || 0).toFixed(2).replace('.', ',')}
            </Text>

            <TouchableOpacity
              style={{ backgroundColor: '#E91E63', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' }}
              onPress={() => addToCart(product)}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>+ Carrinho</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#E91E63', paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              borderRadius: 20, 
              flexDirection: 'row', 
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8
            }}>
              <TouchableOpacity
                onPress={() => router.push('/new-product')}
                style={{ marginRight: 8 }}
              >
                <Ionicons name="add-circle" size={20} color="#E91E63" />
              </TouchableOpacity>
              <Ionicons name="search" size={20} color="#666" />
              <Text style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>Buscar</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="relative flex items-center justify-center"
            onPress={() => router.push('/cart')}
          >
            <MaterialIcons name="shopping-cart" size={28} color="white" />
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-white rounded-full min-w-[18px] h-[18px] items-center justify-center">
                <Text className="text-pink-600 text-xs font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
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

        {/* Grid Circular de Categorias */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-4"
          >
            {[
              { 
                title: 'Casual', 
                image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/casual.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9jYXN1YWwucG5nIiwiaWF0IjoxNzU3NzI2MzQ1LCJleHAiOjE3ODkyNjIzNDV9.yUU6OM5sIsCVnYI2n38iMbP9HW6pzEY0e5ZxSSNAISQ'
              },
              { 
                title: 'Social', 
                image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/social.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9zb2NpYWwucG5nIiwiaWF0IjoxNzU3NzI2Mzc0LCJleHAiOjE3ODkyNjIzNzR9.ZcedMVhkhAMd13QdlFhgH0m9NSLc1NYBJXPjkCYkl_0'
              },
              { 
                title: 'Esportivo', 
                image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/esportivo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9lc3BvcnRpdm8ucG5nIiwiaWF0IjoxNzU3NzI2NDE4LCJleHAiOjE3ODkyNjI0MTh9.HRlKvfz-VsWIQqgcWReP0cvtwpDGoDeWqZKCX8xPVCA'
              }
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                className="items-center mr-6"
                onPress={() => router.push(`/category/${category.title.toLowerCase()}`)}
              >
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-gray-100">
                  <Image
                    source={{ uri: category.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <Text className="text-xs text-gray-800 text-center">
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Produtos em Destaque */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-base font-bold text-gray-800">Produtos em Destaque</Text>
            <TouchableOpacity>
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
                onPress={() => router.push('/category/casual')}
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
                onPress={() => router.push('/category/social')}
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
              onPress={() => router.push('/category/esportivo')}
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

        {/* CLIENTES SATISFEITOS */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-pink-600 text-center mb-4">
            CLIENTES SATISFEITOS
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {testimonials.map((testimonial, index) => (
              <View 
                key={index} 
                className="bg-white rounded-xl mr-3 shadow-sm overflow-hidden" 
                style={{ width: width * 0.7 }}
              >
                <View className="bg-pink-50 p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-full bg-pink-200 mr-3" />
                    <View>
                      <Text className="text-gray-800 font-medium">Cliente {index + 1}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 leading-relaxed">
                    {testimonial.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Chat Section */}
        <View className="bg-white mx-4 rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm text-gray-600 mb-3">
            Para tirar suas dúvidas
          </Text>
          <View className="flex-row justify-end">
            <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full mr-2">
              <Text className="text-pink-600 text-xs">Oi</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-600 px-4 py-2 rounded-full">
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
              <Text className="text-white text-xs mb-1">Suporte</Text>
              <Text className="text-white text-xs mb-1">Contato</Text>
              <Text className="text-white text-xs">Políticas</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {[1, 2, 3].map((_, index) => (
                <View key={index} className="w-6 h-4 bg-white rounded ml-1" />
              ))}
            </View>
          </View>
        </View>

        <ConnectionStatus />
      </ScrollView>
    </SafeAreaView>
  );
}
