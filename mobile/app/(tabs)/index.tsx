import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ecommerce/Header';
import { PromoBanner } from '@/components/ecommerce/PromoBanner';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { CategoryCard } from '@/components/ecommerce/CategoryCard';
import { TestimonialCard } from '@/components/ecommerce/TestimonialCard';

export default function HomeScreen() {
  const featuredProducts = [
    { id: 1, title: 'Blusa Rosa Estampada', price: '45,00', originalPrice: '60,00', rating: 5 },
    { id: 2, title: 'Vestido Amarelo Floral', price: '75,00', originalPrice: '90,00', rating: 4 },
    { id: 3, title: 'Camiseta Vintage', price: '35,00', originalPrice: '50,00', rating: 5 },
    { id: 4, title: 'Saia Vermelha Plissada', price: '55,00', originalPrice: '70,00', rating: 4 }
  ];

  const topSellingProducts = [
    { id: 1, title: 'Óculos Vintage Retrô', price: '89,00', rating: 5 },
    { id: 2, title: 'Bolsa Couro Marrom', price: '120,00', rating: 4 },
    { id: 3, title: 'Relógio Clássico', price: '200,00', rating: 5 },
    { id: 4, title: 'Chapéu de Palha', price: '45,00', rating: 4 }
  ];

  const categories = [
    { title: 'Casual', backgroundColor: '#FF6B9D' },
    { title: 'Formal', backgroundColor: '#9C5AFF' },
    { title: 'Social', backgroundColor: '#FF8C42' },
    { title: 'Esportivo', backgroundColor: '#4ECDC4' }
  ];

  const testimonials = [
    {
      rating: 5,
      comment: 'Excelente qualidade das roupas! Amei minha compra e chegou super rápido. Recomendo muito!',
      author: 'Maria Silva'
    },
    {
      rating: 5,
      comment: 'Ótima variedade de produtos e preços justos. Atendimento nota 10, voltarei a comprar!',
      author: 'João Santos'
    },
    {
      rating: 4,
      comment: 'Produtos de qualidade e entrega rápida. Só faltou mais opções de tamanhos grandes.',
      author: 'Ana Costa'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        <PromoBanner />

        {/* Featured Products */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Produtos em Destaque</Text>
            <TouchableOpacity>
              <Text className="text-pink-600 font-medium">Ver mais</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Selling */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 px-4 mb-3 text-center">
            TOP SELLING
          </Text>
          
          <View className="px-4">
            {topSellingProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                rating={product.rating}
                isHorizontal={true}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 px-4 mb-3 text-center">
            PESQUISE POR ESTILO
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                title={category.title}
                backgroundColor={category.backgroundColor}
              />
            ))}
          </ScrollView>
        </View>

        {/* Customer Testimonials */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 px-4 mb-3 text-center">
            CLIENTES SATISFEITOS
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                rating={testimonial.rating}
                comment={testimonial.comment}
                author={testimonial.author}
              />
            ))}
          </ScrollView>
        </View>

        {/* Chat Section */}
        <View className="mx-4 mb-6 bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-gray-600 text-sm mb-3">
            Para tirar suas mais dúvidas
          </Text>
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity className="bg-pink-100 px-4 py-2 rounded-full">
              <Text className="text-pink-600 text-sm">Oi</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-600 px-4 py-2 rounded-full">
              <Text className="text-white text-sm">Preciso de ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="bg-pink-600 mx-4 mb-6 rounded-xl p-4">
          <Text className="text-white font-bold text-lg mb-2">luxus.brecho...</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-sm">Termos</Text>
              <Text className="text-white text-sm">Suporte</Text>
              <Text className="text-white text-sm">Contato</Text>
            </View>
            <View className="flex-row space-x-2">
              <View className="bg-white rounded p-1">
                <Text className="text-xs">💳</Text>
              </View>
              <View className="bg-white rounded p-1">
                <Text className="text-xs">💳</Text>
              </View>
              <View className="bg-white rounded p-1">
                <Text className="text-xs">💳</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

