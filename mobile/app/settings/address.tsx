import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

export default function AddressSettingsScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    // Carregar endereço existente se houver
    if (user.endereco) {
      setFormData({
        cep: user.endereco.cep || '',
        rua: user.endereco.rua || '',
        numero: user.endereco.numero || '',
        complemento: user.endereco.complemento || '',
        bairro: user.endereco.bairro || '',
        cidade: user.endereco.cidade || '',
        estado: user.endereco.estado || ''
      });
    }
  }, [isAuthenticated, user]);

  const handleCepChange = async (value: string) => {
    // Remove caracteres não numéricos
    const cepNumerico = value.replace(/\D/g, '');
    
    // Formata CEP enquanto digita
    let cepFormatado = cepNumerico;
    if (cepNumerico.length > 5) {
      cepFormatado = `${cepNumerico.substring(0, 5)}-${cepNumerico.substring(5, 8)}`;
    }
    
    setFormData(prev => ({ ...prev, cep: cepFormatado }));
    
    // Limpa erro do CEP
    if (errors.cep) {
      setErrors(prev => ({ ...prev, cep: '' }));
    }

    // Busca endereço quando CEP estiver completo
    if (cepNumerico.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        } else {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }));
          
          setErrors(prev => ({
            ...prev,
            rua: '',
            bairro: '',
            cidade: '',
            estado: ''
          }));
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }
    if (!formData.rua) newErrors.rua = 'Rua é obrigatória';
    if (!formData.numero) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado || formData.estado.length !== 2) {
      newErrors.estado = 'Estado inválido (use sigla)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      // Aqui você faria a chamada à API para atualizar o endereço
      // await api.updateUserAddress(formData);
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      success('Endereço atualizado com sucesso! 📍');
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      showError('Erro ao atualizar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Endereço</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.content}>
            {/* CEP */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CEP *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.cep}
                  onChangeText={handleCepChange}
                  placeholder="00000-000"
                  keyboardType="numeric"
                  maxLength={9}
                  editable={!loadingCep}
                />
                {loadingCep && <ActivityIndicator size="small" color="#E91E63" />}
              </View>
              {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
            </View>

            {/* Rua */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rua *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.rua}
                  onChangeText={(value) => handleChange('rua', value)}
                  placeholder="Nome da rua"
                />
              </View>
              {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}
            </View>

            {/* Número e Complemento */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Número *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.numero}
                    onChangeText={(value) => handleChange('numero', value)}
                    placeholder="123"
                    keyboardType="numeric"
                  />
                </View>
                {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Complemento</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.complemento}
                    onChangeText={(value) => handleChange('complemento', value)}
                    placeholder="Apto 101"
                  />
                </View>
              </View>
            </View>

            {/* Bairro */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bairro *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.bairro}
                  onChangeText={(value) => handleChange('bairro', value)}
                  placeholder="Nome do bairro"
                />
              </View>
              {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
            </View>

            {/* Cidade e Estado */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.label}>Cidade *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.cidade}
                    onChangeText={(value) => handleChange('cidade', value)}
                    placeholder="Nome da cidade"
                  />
                </View>
                {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>UF *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="flag-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.estado}
                    onChangeText={(value) => handleChange('estado', value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
                {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}
              </View>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Salvar Endereço</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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
