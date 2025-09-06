import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFeaturedProducts, useTopSellingProducts } from '../../hooks/useProducts';
import type { Product } from '../../types/product';

const { width } = Dimensions.get('window');

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

  interface StyleCategory {
    title: string;
    color: string;
  }

  interface Testimonial {
    rating: number;
    text: string;
  }

  const styleCategories: StyleCategory[] = [
    { title: 'Casual', color: '#FF6B9D' },
    { title: 'Formal', color: '#9C5AFF' },
    { title: 'Social', color: '#FF8C42' },
    { title: 'Esportivo', color: '#4ECDC4' }
  ];

  const testimonials: Testimonial[] = [
    { rating: 5, text: 'Excelente qualidade e ótimo atendimento!' },
    { rating: 5, text: 'Peças lindas e bem conservadas.' },
    { rating: 5, text: 'Recomendo muito! Preços justos.' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={12}
        color="#FFD700"
      />
    ));
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
              <Ionicons name="search" size={20} color="#666" />
              <Text style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>Search</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ position: 'relative' }}
            onPress={() => router.push('/cart')}
          >
            <MaterialIcons name="shopping-cart" size={28} color="white" />
            <View style={{ 
              position: 'absolute', 
              top: -5, 
              right: -5, 
              backgroundColor: '#fff', 
              borderRadius: 10, 
              minWidth: 18, 
              height: 18, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Text style={{ color: '#E91E63', fontSize: 12, fontWeight: 'bold' }}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Principal */}
        <View style={{ backgroundColor: '#E91E63', margin: 16, borderRadius: 16, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {[1, 2, 3].map((_, index: number) => (
                <View 
                  key={index}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    backgroundColor: 'rgba(255,255,255,0.3)', 
                    borderRadius: 8, 
                    marginHorizontal: 4 
                  }} 
                />
              ))}
            </View>
          </View>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            Encontre Roupas que Encaixem com
          </Text>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
            seu estilo
          </Text>
          <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Diversas marcas em bom estado!
          </Text>
        </View>

        {/* Produtos em Destaque */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Produtos em Destaque</Text>
            <TouchableOpacity>
              <Text style={{ color: '#E91E63', fontSize: 14 }}>Ver Mais</Text>
            </TouchableOpacity>
          </View>
          
          {loadingFeatured ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={{ color: '#666', marginTop: 8 }}>Carregando produtos...</Text>
            </View>
          ) : errorFeatured ? (
            <View style={{ paddingVertical: 20, alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: '#E91E63', textAlign: 'center' }}>
                {errorFeatured}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {featuredProducts.map((product: Product) => (
                <View key={product._id} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: 12, 
                  padding: 12, 
                  marginRight: 12, 
                  width: 130,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2
                }}>
                  <View style={{ 
                    width: '100%', 
                    height: 80, 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: 8, 
                    marginBottom: 8,
                    overflow: 'hidden'
                  }}>
                    {product.images && product.images[0] ? (
                      <Image 
                        source={{ uri: product.images[0] }} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                    {renderStars(product.rating || 5)}
                  </View>
                  <Text style={{ fontSize: 12, color: '#333', marginBottom: 4 }} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E91E63' }}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* TOP SELLING */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#E91E63', 
            textAlign: 'center', 
            marginBottom: 16 
          }}>
            TOP SELLING
          </Text>
          
          {loadingTopSelling ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={{ color: '#666', marginTop: 8 }}>Carregando mais vendidos...</Text>
            </View>
          ) : errorTopSelling ? (
            <View style={{ paddingVertical: 20, alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: '#E91E63', textAlign: 'center' }}>
                {errorTopSelling}
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {topSellingProducts.map((product: Product) => (
                <View key={product._id} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: 12, 
                  padding: 12, 
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2
                }}>
                  <View style={{ 
                    width: 60, 
                    height: 60, 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: 8, 
                    marginRight: 12,
                    overflow: 'hidden'
                  }}>
                    {product.images && product.images[0] ? (
                      <Image 
                        source={{ uri: product.images[0] }} 
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                      {renderStars(product.rating || 5)}
                    </View>
                    <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                      {product.name}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E91E63' }}>
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* PESQUISE POR ESTILO */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#E91E63', 
            textAlign: 'center', 
            marginBottom: 16 
          }}>
            PESQUISE POR ESTILO
          </Text>
          
          <View style={{ 
            paddingHorizontal: 16, 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between' 
          }}>
            {styleCategories.map((category: StyleCategory, index: number) => (
              <TouchableOpacity 
                key={index}
                style={{ 
                  width: '48%', 
                  aspectRatio: 1.2,
                  backgroundColor: category.color, 
                  borderRadius: 16, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: 12
                }}
              >
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: 'rgba(255,255,255,0.3)', 
                  borderRadius: 8, 
                  marginBottom: 8 
                }} />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CLIENTES SATISFEITOS */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#E91E63', 
            textAlign: 'center', 
            marginBottom: 16 
          }}>
            CLIENTES SATISFEITOS
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <View key={index} style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 16, 
                marginRight: 12, 
                width: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {renderStars(testimonial.rating)}
                </View>
                <Text style={{ fontSize: 12, color: '#666', lineHeight: 16 }}>
                  {testimonial.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Chat Section */}
        <View style={{ 
          backgroundColor: 'white', 
          margin: 16, 
          borderRadius: 16, 
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Para tirar suas mais dúvidas
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ 
              backgroundColor: '#f0f0f0', 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 20, 
              marginRight: 8 
            }}>
              <Text style={{ color: '#E91E63', fontSize: 12 }}>Oi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ 
              backgroundColor: '#E91E63', 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 20 
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Preciso de ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ 
          backgroundColor: '#E91E63', 
          margin: 16, 
          borderRadius: 16, 
          padding: 16 
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            luxus.brecho...
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'white', fontSize: 12, marginBottom: 4 }}>Suporte</Text>
              <Text style={{ color: 'white', fontSize: 12, marginBottom: 4 }}>Contato</Text>
              <Text style={{ color: 'white', fontSize: 12 }}>Políticas</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {[1, 2, 3].map((_, index: number) => (
                <View key={index} style={{ 
                  width: 24, 
                  height: 16, 
                  backgroundColor: 'white', 
                  borderRadius: 4, 
                  marginLeft: 4 
                }} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
