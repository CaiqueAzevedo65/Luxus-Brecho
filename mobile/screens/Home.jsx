import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

export default function Home({ navigation }) {
  const { products, setProducts } = useProductStore();

  useEffect(() => {
    // Aqui você pode buscar do backend ou usar dados mock
    setProducts([
      { id: 1, titulo: 'Camisa Floral Feminina', preco: 89.9, imagem: 'https://storage.supabase.co/bucket/produtos/camisa-floral.jpg' },
      { id: 2, titulo: 'Calça Jeans Masculina', preco: 120.0, imagem: 'https://storage.supabase.co/bucket/produtos/calca-jeans.jpg' },
    ]);
  }, []);

  return (
    <ScrollView className="bg-gray-100 flex-1">
      <View className="p-4 flex-wrap flex-row justify-between">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}
