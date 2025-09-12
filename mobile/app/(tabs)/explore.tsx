import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.categoryButton}
              onPress={() => router.push(`/category/${category.title.toLowerCase()}`)}
            >
              <Image
                source={{ uri: category.image }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <Text style={styles.categoryText}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const categories = [
  { 
    title: 'Casual', 
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468452915_17928657050967827_7578668394488839966_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0NTI5MTVfMTc5Mjg2NTcwNTA5Njc4MjdfNzU3ODY2ODM5NDQ4ODgzOTk2Nl9uLnBuZyIsImlhdCI6MTc1NzcwNDg3MCwiZXhwIjoxNzg5MjQwODcwfQ.J66iL4I5K3b0rQyRrV4u9eekqVx1ekR517RVgoP5bmk'
  },
  { 
    title: 'Social', 
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/Captura%20de%20tela%202025-06-03%20200924.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy9DYXB0dXJhIGRlIHRlbGEgMjAyNS0wNi0wMyAyMDA5MjQucG5nIiwiaWF0IjoxNzU3NzA0ODg0LCJleHAiOjE3ODkyNDA4ODR9.CbhbTjEGk59ONGoDvjxzaaXd8PVHi9M48xF2cOQDTNU'
  },
  { 
    title: 'Esportivo', 
    image: 'https://vvdfhyntiiqfzfadzkrp.supabase.co/storage/v1/object/sign/luxus-brecho/categories/468403560_17928651893967827_8798510667129991733_n.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMWJmMzBiMS0yZDhlLTRiY2QtOWQ0Yi1iMDI4MDQxMDc5YzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsdXh1cy1icmVjaG8vY2F0ZWdvcmllcy80Njg0MDM1NjBfMTc5Mjg2NTE4OTM5Njc4MjdfODc5ODUxMDY2NzEyOTk5MTczM19uLnBuZyIsImlhdCI6MTc1NzcwNDgyMywiZXhwIjoxNzg5MjQwODIzfQ.hyXpfqqAgGRVW2Ke_XguKDLijxXMlqXX9ibHjkxvwv0'
  }
];

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
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
});
