import React, { useState, memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from '../../contexts/ToastContext';

const { width } = Dimensions.get('window');

interface ProductCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  rating: number;
  image?: string;
  isHorizontal?: boolean;
  brand?: string;
  discount?: number;
  isNew?: boolean;
  isExclusive?: boolean;
  id: number;
}

const ProductCard = memo(function ProductCard({ 
  title, 
  price, 
  originalPrice, 
  rating, 
  image,
  brand,
  discount,
  id,
  isNew = false,
  isExclusive = false,
  isHorizontal = false 
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={12}
        color="#FFB800"
      />
    ));
  };

  const calculateDiscount = () => {
    if (originalPrice && price) {
      const original = parseFloat(originalPrice.replace(',', '.'));
      const current = parseFloat(price.replace(',', '.'));
      return Math.round(((original - current) / original) * 100);
    }
    return discount || 0;
  };

  if (isHorizontal) {
    return (
      <TouchableOpacity 
        className="flex-row bg-white rounded-2xl shadow-sm mb-3 p-3"
        onPress={() => router.push(`/product/${id}`)}>
        {/* Imagem do Produto */}
        <View className="relative">
          <View className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <MaterialIcons name="checkroom" size={32} color="#E0E0E0" />
              </View>
            )}
          </View>
          
          {/* Badge */}
          {(isNew || isExclusive) && (
            <View className="absolute top-1 left-1">
              {isExclusive && (
                <View className="bg-black px-2 py-1 rounded">
                  <Text className="text-white text-xs font-bold">EXCLUSIVO</Text>
                </View>
              )}
              {isNew && (
                <View className="bg-pink-600 px-2 py-1 rounded mt-1">
                  <Text className="text-white text-xs font-bold">NOVO</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Informações */}
        <View className="flex-1 ml-3">
          {brand && (
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">{brand}</Text>
          )}
          <Text className="text-gray-800 text-sm font-semibold mb-1" numberOfLines={2}>
            {title}
          </Text>
          <View className="flex-row items-center mb-2">
            {renderStars(rating)}
            <Text className="text-gray-400 text-xs ml-1">(4.{rating})</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-pink-600 font-bold text-base">R$ {price}</Text>
              {originalPrice && (
                <>
                  <Text className="text-gray-400 text-xs line-through ml-2">
                    R$ {originalPrice}
                  </Text>
                  <View className="bg-red-100 px-2 py-0.5 rounded ml-2">
                    <Text className="text-red-600 text-xs font-bold">-{calculateDiscount()}%</Text>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? "#E91E63" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Card Vertical (padrão)
  return (
    <View 
      className="bg-white rounded-2xl shadow-sm mr-3" 
      style={{ width: width * 0.42, height: 290 }}>
      {/* Área clicável do produto */}
      <TouchableOpacity 
        style={{ padding: 10 }}
        onPress={() => router.push(`/product/${id}`)}>
        {/* Imagem com Favorito */}
        <View className="relative mb-2">
          <View className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <MaterialIcons name="checkroom" size={32} color="#E0E0E0" />
              </View>
            )}
          </View>
          
          {/* Botão Favorito */}
          <TouchableOpacity 
            className="absolute top-1 right-1 bg-white/90 rounded-full p-1.5"
            onPress={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={16} 
              color={isFavorite ? "#E91E63" : "#6B7280"}
            />
          </TouchableOpacity>

          {/* Badges */}
          {(isNew || isExclusive || calculateDiscount() > 0) && (
            <View className="absolute top-1 left-1">
              {isExclusive && (
                <View className="bg-black px-1.5 py-0.5 rounded mb-1">
                  <Text className="text-white text-xs font-bold">EXCLUSIVO</Text>
                </View>
              )}
              {isNew && (
                <View className="bg-pink-600 px-1.5 py-0.5 rounded mb-1">
                  <Text className="text-white text-xs font-bold">NOVO</Text>
                </View>
              )}
              {calculateDiscount() > 0 && (
                <View className="bg-red-500 px-1.5 py-0.5 rounded">
                  <Text className="text-white text-xs font-bold">-{calculateDiscount()}%</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Informações do Produto */}
        <View>
          <Text className="text-gray-800 text-sm font-semibold mb-1 leading-4" numberOfLines={2} style={{ height: 32 }}>
            {title}
          </Text>
          
          {/* Preço */}
          <Text className="text-pink-600 font-bold text-base">R$ {price}</Text>
        </View>
      </TouchableOpacity>

      {/* Botão Adicionar ao Carrinho - Posição absoluta no final */}
      <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
        <TouchableOpacity 
          style={{
            backgroundColor: '#E91E63',
            borderRadius: 8,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={(e) => {
            e.stopPropagation();
            // Adicionar ao carrinho
          }}
        >
          <Ionicons name="cart-outline" size={14} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 11, marginLeft: 4 }}>
            + Carrinho
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export { ProductCard };
