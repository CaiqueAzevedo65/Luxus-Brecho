import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function Footer() {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  return (
    <View style={styles.footer} className="bg-white dark:bg-gray-900">
      <Link href="/" asChild>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="home-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </Link>

      <Link href="/cart" asChild>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="cart-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </Link>

      <Link href="/favorites" asChild>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="heart-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </Link>

      <Link href="/menu" asChild>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="menu-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 5, // Ajuste para notch
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
