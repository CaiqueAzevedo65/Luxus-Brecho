import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function MenuScreen() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const menuItems = [
    {
      title: 'Categorias',
      icon: 'grid-outline',
      href: '/categories',
    },
    {
      title: 'Meus Pedidos',
      icon: 'bag-check-outline',
      href: '/orders',
    },
    {
      title: 'Meus Favoritos',
      icon: 'heart-outline',
      href: '/favorites',
    },
    {
      title: 'Meu Perfil',
      icon: 'person-outline',
      href: '/profile',
    },
    {
      title: 'Notificações',
      icon: 'notifications-outline',
      href: '/notifications',
    },
    {
      title: 'Ajuda',
      icon: 'help-circle-outline',
      href: '/help',
    },
    {
      title: 'Sobre',
      icon: 'information-circle-outline',
      href: '/about',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Menu</Text>
        
        <View className="space-y-4">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity 
                className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                style={styles.menuItem}
              >
                <Ionicons name={item.icon as any} size={24} color={iconColor} style={styles.icon} />
                <Text className="text-lg text-gray-900 dark:text-white">{item.title}</Text>
                <Ionicons 
                  name="chevron-forward-outline" 
                  size={20} 
                  color={iconColor} 
                  style={styles.chevron} 
                />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <TouchableOpacity 
          className="flex-row items-center p-4 mt-6 bg-red-50 dark:bg-red-900 rounded-lg"
          style={styles.menuItem}
        >
          <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
          <Text className="text-lg text-red-600 dark:text-red-100">Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
