import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function PromoBanner() {
  return (
    <View className="mx-4 mt-4 mb-6">
      <View 
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ backgroundColor: '#E91E63' }}
      >
        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-20">
          <View className="flex-row justify-between">
            <View className="w-20 h-20 bg-white rounded-full -mt-10 -ml-10" />
            <View className="w-16 h-16 bg-white rounded-full mt-8" />
            <View className="w-12 h-12 bg-white rounded-full -mr-6" />
          </View>
        </View>

        {/* Content */}
        <View className="relative z-10">
          <Text className="text-white text-xl font-bold text-center mb-2">
            Encontre Roupas que Encaixem com
          </Text>
          <Text className="text-white text-xl font-bold text-center mb-2">
            seu estilo
          </Text>
          <Text className="text-white text-center text-sm mb-4">
            Diversas marcas em bom estado!
          </Text>
          
          <TouchableOpacity className="bg-white/20 rounded-full py-2 px-6 self-center">
            <Text className="text-white font-semibold">Explorar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
