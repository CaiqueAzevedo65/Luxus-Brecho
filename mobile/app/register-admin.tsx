import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { RegisterSchema, RegisterFormData, useZodValidation } from '../schemas/auth.schema';
import ConfirmModal from '../components/ui/ConfirmModal';
import { getApiUrl } from '../utils/networkUtils';

export default function RegisterAdminScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { validate } = useZodValidation(RegisterSchema);

  // Verifica se o usuário é administrador
  useEffect(() => {
    if (!isAuthenticated || !user || user.tipo !== 'Administrador') {
      router.replace('/');
    }
  }, [isAuthenticated, user]);

  const validateForm = (): boolean => {
    const result = validate(formData);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors || {});
      return false;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          senha: formData.senha.trim(),
          tipo: 'Administrador', // Força o tipo como Administrador
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.message || 'Erro ao criar administrador');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!user || user.tipo !== 'Administrador') {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Administrador</Text>
          <View style={{ width: 40 }} />
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
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={32} color="#E91E63" />
              <Text style={styles.infoTitle}>Novo Administrador</Text>
              <Text style={styles.infoText}>
                Crie uma conta com privilégios de administrador para gerenciar o sistema.
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <View style={[styles.inputContainer, errors.nome && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.nome}
                    onChangeText={(value) => handleInputChange('nome', value)}
                    placeholder="Digite o nome completo"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.nome && (
                  <Text style={styles.errorText}>{errors.nome}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Digite o email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Senha *</Text>
                <View style={[styles.inputContainer, errors.senha && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.senha}
                    onChangeText={(value) => handleInputChange('senha', value)}
                    placeholder="Digite a senha"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.senha && (
                  <Text style={styles.errorText}>{errors.senha}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={[styles.inputContainer, errors.confirmarSenha && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.confirmarSenha}
                    onChangeText={(value) => handleInputChange('confirmarSenha', value)}
                    placeholder="Confirme a senha"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmarSenha && (
                  <Text style={styles.errorText}>{errors.confirmarSenha}</Text>
                )}
              </View>

              {/* Badge de Tipo */}
              <View style={styles.typeBadge}>
                <Ionicons name="shield" size={16} color="#E91E63" />
                <Text style={styles.typeBadgeText}>Tipo: Administrador</Text>
              </View>

              {/* Botão de Registro */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text style={styles.registerButtonText}>Criar Administrador</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal de Sucesso */}
        <ConfirmModal
          visible={showSuccessModal}
          title="Administrador Criado"
          message="O novo administrador foi criado com sucesso! Um email de confirmação foi enviado."
          confirmText="OK"
          cancelText=""
          icon="checkmark-circle"
          iconColor="#22C55E"
          onConfirm={() => {
            setShowSuccessModal(false);
            setFormData({ nome: '', email: '', senha: '', confirmarSenha: '' });
            router.back();
          }}
          onCancel={() => setShowSuccessModal(false)}
        />

        {/* Modal de Erro */}
        <ConfirmModal
          visible={showErrorModal}
          title="Erro"
          message={errorMessage}
          confirmText="OK"
          cancelText=""
          icon="close-circle"
          iconColor="#EF4444"
          onConfirm={() => setShowErrorModal(false)}
          onCancel={() => setShowErrorModal(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#E91E63',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
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
    flexGrow: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FCE4EC',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F8BBD9',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#E91E63',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCE4EC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
  },
  registerButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
