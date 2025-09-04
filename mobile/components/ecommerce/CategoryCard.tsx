import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CategoryCardProps {
  title: string;
  backgroundColor: string;
}

export function CategoryCard({ title, backgroundColor }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      className="rounded-xl p-4 mr-3 items-center justify-center min-h-20"
      style={{ backgroundColor }}
    >
      {/* Placeholder for category image */}
      <View className="w-12 h-12 bg-white/30 rounded-lg mb-2" />
      <Text className="text-white font-semibold text-xs text-center">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
