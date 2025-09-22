import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function MenuScreen() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const menuItems = [
    {
      title: 'Categorias',
      icon: 'grid-outline',
      onPress: () => router.push('/categories'),
    },
    {
      title: 'Meus Pedidos',
      icon: 'bag-check-outline',
      href: '/orders',
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
      </View>
      
      <View style={styles.content}>
        {menuItems.map((item, index) => (
          item.onPress ? (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={24} color="#E91E63" style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons 
                name="chevron-forward-outline" 
                size={20} 
                color="#666" 
                style={styles.chevron} 
              />
            </TouchableOpacity>
          ) : (
            <Link key={index} href={item.href!} asChild>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name={item.icon as any} size={24} color="#E91E63" style={styles.icon} />
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons 
                  name="chevron-forward-outline" 
                  size={20} 
                  color="#666" 
                  style={styles.chevron} 
                />
              </TouchableOpacity>
            </Link>
          )
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
          <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#E91E63',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutItem: {
    backgroundColor: '#fef2f2',
    marginTop: 20,
  },
  icon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
