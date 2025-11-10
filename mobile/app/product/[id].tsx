import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Share, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../../types/product';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { apiService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const toast = useToast();

  const toggleFavorite = async () => {
    if (!product) return;
    
    try {
      const willBeFavorite = !isFavorite;
      const newFavorites = willBeFavorite
        ? [...favoriteProducts, product.id]
        : favoriteProducts.filter(id => id !== product.id);
      
      setFavoriteProducts(newFavorites);
      setIsFavorite(willBeFavorite);
      await AsyncStorage.setItem('favoriteProducts', JSON.stringify(newFavorites));
      
      // Mostrar toast
      if (willBeFavorite) {
        toast.success('Adicionado aos favoritos! ❤️');
      } else {
        toast.info('Removido dos favoritos');
      }
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await apiService.getProductById(Number(id));
        setProduct(data);
        
        // Carregar favoritos
        const savedFavorites = await AsyncStorage.getItem('favoriteProducts');
        if (savedFavorites && data) {
          const favorites = JSON.parse(savedFavorites);
          setFavoriteProducts(favorites);
          setIsFavorite(favorites.includes(data.id));
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Confira este produto incrível no Luxus Brechó:\n\n${product.titulo}\nR$ ${product.preco.toFixed(2).replace('.', ',')}\n\nPeças únicas com história!`,
        url: product.imagem,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o produto.');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (product.status !== 'disponivel') {
        toast.error('Este produto não está disponível no momento.');
        return;
      }
      addToCart(product);
      toast.success(`${product.titulo} adicionado ao carrinho! 🛒`);
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Carregando produto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Navbar */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-pink-600">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Imagem do Produto */}
        <View className="w-full aspect-square bg-gray-100">
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
              <Ionicons name="image-outline" size={48} color="#ccc" />
            </View>
          )}
        </View>

        {/* Informações do Produto */}
        <View className="p-4">
          {/* Preço e Nome */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-pink-600">
              R$ {Number(product.preco).toFixed(2).replace('.', ',')}
            </Text>
            <Text className="text-xl font-semibold text-gray-800 mt-2">
              {product.titulo}
            </Text>
          </View>

          {/* Descrição */}
          <View className="mb-6">
            <Text className="text-base text-gray-600 leading-relaxed">
              {product.descricao}
            </Text>
          </View>

          {/* Logo do Brechó */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-pink-600">
              LUXUS BRECHÓ
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Peças únicas com história
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botão de Compra */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${product.status === 'disponivel' ? 'bg-pink-600' : 'bg-gray-400'}`}
          onPress={handleAddToCart}
          disabled={product.status !== 'disponivel'}
        >
          <Text className="text-white font-bold text-lg">
            {product.status === 'disponivel' ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
