import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { LoginSchema, LoginFormData, useZodValidation } from '../schemas/auth.schema';

export default function LoginScreen() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error, clearError } = useAuthStore();
  const { validate } = useZodValidation(LoginSchema);

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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await login(formData);

    if (result.success) {
      Alert.alert('Sucesso', 'Login realizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else if (result.emailNotConfirmed) {
      // Email não confirmado - oferece opção de reenviar
      Alert.alert(
        'Email não confirmado',
        'Sua conta ainda não foi ativada. Verifique sua caixa de entrada ou solicite um novo email de confirmação.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Reenviar Email', 
            onPress: () => router.push('/resend-confirmation')
          }
        ]
      );
    } else {
      Alert.alert('Erro', error || 'Erro ao fazer login');
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
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
        <Text style={styles.headerTitle}>Entrar</Text>
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LUXUS</Text>
            <Text style={styles.logoSubtext}>BRECHÓ</Text>
            <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Digite seu email"
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
                  placeholder="Digite sua senha"
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

            {/* Botão de Login */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {/* Link para Registro */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 4,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
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
  loginButton: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
});
