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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Category } from '../../types/category';
import { CreateProductFormSchema, CreateProductFormData, useZodValidation } from '../../schemas/createProduct.schema';

export default function CreateProductScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProductFormData>({
    titulo: '',
    descricao: '',
    preco: '',
    categoria: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { validate } = useZodValidation(CreateProductFormSchema);

  useEffect(() => {
    // Verificar se é administrador
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      Alert.alert(
        'Acesso negado',
        'Apenas administradores podem criar produtos.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadCategories();
  }, [isAuthenticated, user]);

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
    // Validar dados do formulário
    const result = validate(formData);
    
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    // Adicionar erros do Zod
    if (!result.success) {
      Object.assign(newErrors, result.errors || {});
      hasErrors = true;
    }

    // Validar imagem separadamente
    if (!selectedImage) {
      newErrors.image = 'Selecione uma imagem';
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleInputChange = (field: keyof CreateProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
    if (selectedImage) {
      // Se já tem imagem, não permitir selecionar outra
      return;
    }

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
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
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
        Alert.alert('Sucesso', 'Produto criado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      Alert.alert('Erro', 'Erro ao criar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="shield-outline" size={80} color="#EF4444" />
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedText}>
            Apenas administradores podem acessar esta tela
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Criar Produto</Text>
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
          {/* Formulário */}
          <View style={styles.formContainer}>
            {/* Título */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={[styles.input, errors.titulo && styles.inputError]}
                value={formData.titulo}
                onChangeText={(value) => handleInputChange('titulo', value)}
                placeholder="Digite o título do produto"
              />
              {errors.titulo && (
                <Text style={styles.errorText}>{errors.titulo}</Text>
              )}
            </View>

            {/* Descrição */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.descricao && styles.inputError]}
                value={formData.descricao}
                onChangeText={(value) => handleInputChange('descricao', value)}
                placeholder="Digite a descrição do produto"
                multiline
                numberOfLines={4}
              />
              {errors.descricao && (
                <Text style={styles.errorText}>{errors.descricao}</Text>
              )}
            </View>

            {/* Preço */}
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

            {/* Categoria */}
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

            {/* Imagem */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem *</Text>
              <TouchableOpacity
                style={[styles.imageSelector, errors.image && styles.inputError]}
                onPress={pickImage}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#999" />
                    <Text style={styles.imagePlaceholderText}>Toque para selecionar imagem</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.image && (
                <Text style={styles.errorText}>{errors.image}</Text>
              )}
            </View>

            {/* Botão de Submissão */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Criando produto...' : 'Criar produto'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Categoria */}
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
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryDescription}>{item.description}</Text>
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
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  imageSelector: {
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
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
    borderBottomColor: '#f0f0f0',
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
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
});
