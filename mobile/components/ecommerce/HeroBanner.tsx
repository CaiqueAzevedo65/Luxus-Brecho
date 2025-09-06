import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function HeroBanner() {
  return (
    <View className="mx-4 mt-4 mb-6">
      <TouchableOpacity activeOpacity={0.9}>
        <View className="rounded-3xl overflow-hidden shadow-lg" style={{ height: width * 0.5 }}>
          {/* Gradiente de fundo elegante */}
          <LinearGradient
            colors={['#E91E63', '#C2185B', '#AD1457']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />
          
          {/* Padrão decorativo */}
          <View className="absolute inset-0">
            <View className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full" />
          </View>

          {/* Conteúdo */}
          <View className="flex-1 justify-center px-6">
            <View className="mb-4">
              <Text className="text-white/90 text-sm font-medium tracking-wider mb-2">
                COLEÇÃO EXCLUSIVA
              </Text>
              <Text className="text-white text-3xl font-bold mb-2">
                Peças Únicas
              </Text>
              <Text className="text-white text-2xl font-light">
                com História
              </Text>
            </View>
            
            <Text className="text-white/80 text-sm mb-6 leading-5">
              Marcas premium selecionadas especialmente para você
            </Text>
            
            <TouchableOpacity className="bg-white self-start rounded-full px-6 py-3 flex-row items-center shadow-md">
              <Text className="text-pink-600 font-bold mr-2">Descobrir</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#E91E63" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
