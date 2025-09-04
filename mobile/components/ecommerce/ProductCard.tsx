import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  rating: number;
  image?: string;
  isHorizontal?: boolean;
}

export function ProductCard({ 
  title, 
  price, 
  originalPrice, 
  rating, 
  image, 
  isHorizontal = false 
}: ProductCardProps) {
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

  if (isHorizontal) {
    return (
      <TouchableOpacity className="flex-row bg-white rounded-xl shadow-sm mb-3 p-3">
        <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3" />
        <View className="flex-1">
          <Text className="text-gray-800 text-sm font-medium mb-1" numberOfLines={2}>
            {title}
          </Text>
          <View className="flex-row items-center mb-1">
            {renderStars(rating)}
          </View>
          <View className="flex-row items-center">
            <Text className="text-pink-600 font-bold text-sm">R$ {price}</Text>
            {originalPrice && (
              <Text className="text-gray-400 text-xs line-through ml-2">
                R$ {originalPrice}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity className="bg-white rounded-xl shadow-sm p-3 mr-3 w-32">
      {/* Product Image */}
      <View className="w-full h-24 bg-gray-200 rounded-lg mb-2" />
      
      {/* Product Info */}
      <Text className="text-gray-800 text-xs font-medium mb-1" numberOfLines={2}>
        {title}
      </Text>
      
      {/* Rating */}
      <View className="flex-row items-center mb-2">
        {renderStars(rating)}
      </View>
      
      {/* Price */}
      <View className="flex-row items-center">
        <Text className="text-pink-600 font-bold text-sm">R$ {price}</Text>
        {originalPrice && (
          <Text className="text-gray-400 text-xs line-through ml-1">
            R$ {originalPrice}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
