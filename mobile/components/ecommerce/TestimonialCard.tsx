import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TestimonialCardProps {
  rating: number;
  comment: string;
  author: string;
}

export function TestimonialCard({ rating, comment, author }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={14}
        color="#FFD700"
      />
    ));
  };

  return (
    <View className="bg-white rounded-xl p-4 mr-3 w-64 shadow-sm">
      {/* Rating */}
      <View className="flex-row items-center mb-2">
        {renderStars(rating)}
      </View>
      
      {/* Comment */}
      <Text className="text-gray-600 text-sm leading-5 mb-3" numberOfLines={4}>
        {comment}
      </Text>
      
      {/* Author */}
      <Text className="text-gray-800 font-semibold text-sm">
        {author}
      </Text>
    </View>
  );
}
