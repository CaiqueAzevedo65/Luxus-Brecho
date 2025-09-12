import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => router.push('/category/casual')}
          >
            <Text style={styles.categoryText}>Casual</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => router.push('/category/social')}
          >
            <Text style={styles.categoryText}>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => router.push('/category/esportivo')}
          >
            <Text style={styles.categoryText}>Esportivo</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
});
