import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Header() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      {/* Menu Icon */}
      <TouchableOpacity>
        <Ionicons name="menu" size={24} color="#666" />
      </TouchableOpacity>

      {/* Search Bar */}
      <View className="flex-1 mx-3 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          className="flex-1 text-gray-700"
        />
        <TouchableOpacity>
          <Ionicons name="search" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Cart Icon */}
      <TouchableOpacity className="relative">
        <Ionicons name="basket" size={24} color="#E91E63" />
        {/* Badge */}
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-white text-xs font-bold">2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
