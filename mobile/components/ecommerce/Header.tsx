import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  
  // Animação para o campo de busca
  const searchWidth = useState(new Animated.Value(0))[0];

  const handleSearchFocus = () => {
    setSearchFocused(true);
    Animated.timing(searchWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchBlur = () => {
    if (!searchText) {
      setSearchFocused(false);
      Animated.timing(searchWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View className="bg-white shadow-sm">
      {/* Header Principal */}
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Menu/Perfil */}
        <TouchableOpacity className="p-2">
          <Ionicons name="person-circle-outline" size={28} color="#E91E63" />
        </TouchableOpacity>

        {/* Logo Central - quando não estiver pesquisando */}
        {!searchFocused && (
          <View className="flex-1 items-center">
            <Text className="text-pink-600 font-bold text-xl tracking-wider">
              LUXUS
            </Text>
            <Text className="text-gray-500 text-xs tracking-widest">
              BRECHÓ
            </Text>
          </View>
        )}

        {/* Barra de Pesquisa Expansível */}
        {searchFocused && (
          <Animated.View 
            className="flex-1 mx-3"
            style={{
              opacity: searchWidth,
            }}
          >
            <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Buscar produtos, marcas..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-gray-700 text-sm"
                value={searchText}
                onChangeText={setSearchText}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* Ações do Header */}
        <View className="flex-row items-center">
          {/* Botão de Busca */}
          {!searchFocused && (
            <TouchableOpacity 
              className="p-2 mr-2"
              onPress={handleSearchFocus}
            >
              <Ionicons name="search" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Favoritos */}
          <TouchableOpacity className="p-2 mr-2">
            <Ionicons name="heart-outline" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Carrinho */}
          <TouchableOpacity className="relative p-2">
            <MaterialIcons name="shopping-bag" size={24} color="#E91E63" />
            {/* Badge do Carrinho */}
            <View className="absolute top-0 right-0 bg-pink-600 rounded-full min-w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de Categorias Rápidas */}
      <View className="border-t border-gray-100">
        <View className="flex-row justify-around py-2 px-4">
          <TouchableOpacity className="py-1">
            <Text className="text-gray-600 text-sm">Novidades</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-1">
            <Text className="text-gray-600 text-sm">Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-1">
            <Text className="text-gray-600 text-sm">Promoções</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-1">
            <Text className="text-gray-600 text-sm">Marcas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
