import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Category } from '../types/category';
import { CONFIG } from '../constants/config';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategoriesSummary();
      
      // Se não houver dados da API, usa as categorias padrão
      if (data.length === 0) {
        setCategories(CONFIG.CATEGORIES.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: `Categoria ${cat.name}`,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback para categorias padrão
      setCategories(CONFIG.CATEGORIES.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: `Categoria ${cat.name}`,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categorias</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore por categoria</Text>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={styles.categoryButton}
              onPress={() => router.push(`/category/${category.name.toLowerCase()}`)}
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryIconText}>
                  {category.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
});
