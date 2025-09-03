import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white p-4 m-2 rounded shadow">
      <Image source={{ uri: product.imagem }} className="h-40 w-full rounded" />
      <Text className="font-bold text-lg mt-2">{product.titulo}</Text>
      <Text className="text-gray-600 mt-1">${product.preco.toFixed(2)}</Text>
    </TouchableOpacity>
  );
}
