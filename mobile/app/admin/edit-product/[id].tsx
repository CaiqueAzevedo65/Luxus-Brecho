import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../contexts/ToastContext';
import { apiService } from '../../../services/api';

const CATEGORIES = ['Casual', 'Social', 'Esportivo'];
const STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'indisponivel', label: 'Indisponível' },
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    preco: '',
    descricao: '',
    categoria: '',
    status: 'disponivel',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      Alert.alert(
        'Acesso negado',
        'Apenas administradores podem editar produtos.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadProduct();
  }, [id, isAuthenticated, user]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await apiService.getProductById(Number(id));

      setFormData({
        titulo: product.titulo || '',
        preco: product.preco?.toString() || '',
        descricao: product.descricao || '',
        categoria: product.categoria || '',
        status: product.status || 'disponivel',
      });

      if (product.imagem) {
        setImageUri(product.imagem);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      showError('Erro ao carregar produto');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageFile(result.assets[0]);
      
      if (errors.imagem) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imagem;
          return newErrors;
        });
      }
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageFile(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file: any) => {
    const formData = new FormData();
    formData.append('image', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'product.jpg',
    } as any);

    try {
      const response = await fetch(`${apiService.baseURL}/images/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      return data.url || data.image_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário.');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = imageUri;

      // Se há uma nova imagem, fazer upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        titulo: formData.titulo,
        preco: parseFloat(formData.preco),
        descricao: formData.descricao,
        categoria: formData.categoria,
        status: formData.status,
        imagem: imageUrl,
      };

      await apiService.updateProduct(Number(id), productData);

      success('Produto atualizado com sucesso! ✅');
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      showError('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Produto</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.content}>
            {/* Imagem */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imagem do Produto</Text>
              
              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                  <Ionicons name="image-outline" size={48} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Toque para selecionar imagem</Text>
                </TouchableOpacity>
              )}
              
              {imageUri && (
                <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={20} color="#E91E63" />
                  <Text style={styles.changeImageText}>Alterar Imagem</Text>
                </TouchableOpacity>
              )}
              {errors.imagem && <Text style={styles.errorText}>{errors.imagem}</Text>}
            </View>

            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={[styles.input, errors.titulo && styles.inputError]}
                value={formData.titulo}
                onChangeText={(value) => handleChange('titulo', value)}
                placeholder="Ex: Vestido Floral Vintage"
              />
              {errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}
            </View>

            {/* Preço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={[styles.input, errors.preco && styles.inputError]}
                value={formData.preco}
                onChangeText={(value) => handleChange('preco', value)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              {errors.preco && <Text style={styles.errorText}>{errors.preco}</Text>}
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria *</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.categoria === category && styles.categoryChipActive
                    ]}
                    onPress={() => handleChange('categoria', category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.categoria === category && styles.categoryChipTextActive
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.statusContainer}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusChip,
                      formData.status === option.value && styles.statusChipActive
                    ]}
                    onPress={() => handleChange('status', option.value)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        formData.status === option.value && styles.statusChipTextActive
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.textArea, errors.descricao && styles.inputError]}
                value={formData.descricao}
                onChangeText={(value) => handleChange('descricao', value)}
                placeholder="Descreva o produto..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#E91E63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
