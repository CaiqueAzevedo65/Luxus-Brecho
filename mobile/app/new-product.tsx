import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useZodForm } from '../hooks/useZodForm';
import { CreateProductSchema, type CreateProductFormData } from '../schemas/createProduct.schema';
import { apiService } from '../services/api';

export default function NewProductScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues
  } = useZodForm<CreateProductFormData>({
    schema: CreateProductSchema,
    onSubmit: async (data) => {
      try {
        const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!result.granted) {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar a imagem.');
          return;
        }

        const imageResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!imageResult.canceled) {
          const formData = new FormData();
          formData.append('titulo', data.titulo);
          formData.append('descricao', data.descricao);
          formData.append('preco', data.preco.toString());
          formData.append('categoria', data.categoria);

          // Adiciona a imagem ao FormData
          const imageUri = imageResult.assets[0].uri;
          const filename = imageUri.split('/').pop();
          const match = /\.[\w\d]+$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image';

          formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
          } as any);

          const response = await apiService.createProductWithImage(formData);
          if (response) {
            Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
            router.back();
          } else {
            Alert.alert('Erro', 'Erro ao cadastrar produto. Tente novamente.');
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        Alert.alert('Erro', 'Erro ao cadastrar produto. Tente novamente.');
      }
    },
    initialValues: {
      titulo: '',
      descricao: '',
      preco: 0,
      categoria: '',
    }
  });

  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
    if (!result.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar a imagem.');
      return;
    }

    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!imageResult.canceled) {
      setSelectedImage(imageResult.assets[0].uri);
      setValues(prev => ({ ...prev, image: imageResult.assets[0] }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Produto</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Imagem */}
        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={pickImage}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#666" />
              <Text style={styles.imagePlaceholderText}>
                Toque para selecionar uma imagem
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.image && (
          <Text style={styles.errorText}>{errors.image}</Text>
        )}

        {/* Formulário */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={[styles.input, errors.titulo && styles.inputError]}
            value={values.titulo}
            onChangeText={(value) => handleChange('titulo', value)}
            placeholder="Nome do produto"
          />
          {errors.titulo && (
            <Text style={styles.errorText}>{errors.titulo}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.descricao && styles.inputError]}
            value={values.descricao}
            onChangeText={(value) => handleChange('descricao', value)}
            placeholder="Descreva o produto"
            multiline
            numberOfLines={4}
          />
          {errors.descricao && (
            <Text style={styles.errorText}>{errors.descricao}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Preço *</Text>
          <TextInput
            style={[styles.input, errors.preco && styles.inputError]}
            value={values.preco?.toString()}
            onChangeText={(value) => handleChange('preco', Number(value))}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
          {errors.preco && (
            <Text style={styles.errorText}>{errors.preco}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria *</Text>
          <TextInput
            style={[styles.input, errors.categoria && styles.inputError]}
            value={values.categoria}
            onChangeText={(value) => handleChange('categoria', value)}
            placeholder="Categoria do produto"
          />
          {errors.categoria && (
            <Text style={styles.errorText}>{errors.categoria}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar Produto'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#E91E63',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholderText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E91E63',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
