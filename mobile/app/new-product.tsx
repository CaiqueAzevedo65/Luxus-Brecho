import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../services/api';
import { Category } from '../types/category';

interface FormData {
  titulo: string;
  descricao: string;
  preco: string;
  categoria: string;
}

interface FormErrors {
  titulo?: string;
  descricao?: string;
  preco?: string;
  categoria?: string;
  image?: string;
}

export default function NewProductScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    preco: '',
    categoria: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategoriesSummary();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback para categorias padrão
      setCategories([
        { id: 1, name: 'Casual', description: 'Roupas casuais', active: true, created_at: '', updated_at: '' },
        { id: 2, name: 'Social', description: 'Roupas sociais', active: true, created_at: '', updated_at: '' },
        { id: 3, name: 'Esportivo', description: 'Roupas esportivas', active: true, created_at: '', updated_at: '' }
      ]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.preco.trim()) {
      newErrors.preco = 'Preço é obrigatório';
    } else {
      const precoNum = parseFloat(formData.preco.replace(',', '.'));
      if (isNaN(precoNum) || precoNum <= 0) {
        newErrors.preco = 'Preço deve ser um número válido maior que zero';
      }
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!selectedImage) {
      newErrors.image = 'Imagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriceChange = (value: string) => {
    // Permitir apenas números e vírgula/ponto
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    handleInputChange('preco', cleanValue);
  };

  const selectCategory = (category: Category) => {
    handleInputChange('categoria', category.name);
    setShowCategoryModal(false);
  };

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
      // Limpar erro de imagem
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descricao', formData.descricao);
      
      // Converter preço para formato correto
      const precoNum = parseFloat(formData.preco.replace(',', '.'));
      formDataToSend.append('preco', precoNum.toString());
      formDataToSend.append('categoria', formData.categoria);

      // Adicionar imagem
      if (selectedImage) {
        const filename = selectedImage.split('/').pop();
        const match = /\.[\w\d]+$/.exec(filename || '');
        const type = match ? `image/${match[0].substring(1)}` : 'image/jpeg';

        formDataToSend.append('image', {
          uri: selectedImage,
          name: filename || 'image.jpg',
          type,
        } as any);
      }

      const response = await apiService.createProductWithImage(formDataToSend);
      
      if (response) {
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar produto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      Alert.alert('Erro', 'Erro ao cadastrar produto. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
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

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              value={formData.titulo}
              onChangeText={(value) => handleInputChange('titulo', value)}
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
              value={formData.descricao}
              onChangeText={(value) => handleInputChange('descricao', value)}
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
              value={formData.preco}
              onChangeText={handlePriceChange}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />
            {errors.preco && (
              <Text style={styles.errorText}>{errors.preco}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <TouchableOpacity
              style={[styles.input, styles.categorySelector, errors.categoria && styles.inputError]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.categoryText, !formData.categoria && styles.placeholderText]}>
                {formData.categoria || 'Selecione uma categoria'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
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
      </KeyboardAvoidingView>

      {/* Modal de Categorias */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.categoryItemText}>{item.name}</Text>
                  <Text style={styles.categoryItemDescription}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryItemDescription: {
    fontSize: 14,
    color: '#666',
  },
});
