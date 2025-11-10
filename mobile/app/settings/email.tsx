import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

export default function EmailSettingsScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { success, error: showError, warning } = useToast();
  
  const [formData, setFormData] = useState({
    novoEmail: '',
    senha: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.novoEmail) {
      newErrors.novoEmail = 'Novo email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.novoEmail)) {
      newErrors.novoEmail = 'Email inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória para confirmar a alteração';
    }
    
    if (user && formData.novoEmail.toLowerCase() === user.email.toLowerCase()) {
      newErrors.novoEmail = 'O novo email deve ser diferente do atual';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    Alert.alert(
      'Confirmar Alteração',
      'Ao alterar seu email, você será desconectado e precisará fazer login novamente. Deseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);

            try {
              // Aqui você faria a chamada à API para alterar o email
              // await api.changeEmail({
              //   novo_email: formData.novoEmail,
              //   senha: formData.senha
              // });
              
              // Simulação
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              success('Email alterado com sucesso! 📧');
              warning('Você será desconectado em 3 segundos...');
              
              // Desloga após 3 segundos
              setTimeout(() => {
                logout();
                router.replace('/login');
              }, 3000);
            } catch (err) {
              showError('Erro ao alterar email. Verifique sua senha.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
          <Text style={styles.headerTitle}>Alterar Email</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.content}>
            {/* Email Atual */}
            <View style={styles.currentEmailCard}>
              <Text style={styles.currentEmailLabel}>Email Atual</Text>
              <Text style={styles.currentEmail}>{user.email}</Text>
            </View>

            {/* Novo Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Novo Email *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.novoEmail}
                  onChangeText={(value) => handleChange('novoEmail', value)}
                  placeholder="Digite seu novo email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.novoEmail && <Text style={styles.errorText}>{errors.novoEmail}</Text>}
            </View>

            {/* Senha para Confirmação */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha Atual *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.senha}
                  onChangeText={(value) => handleChange('senha', value)}
                  placeholder="Digite sua senha para confirmar"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
              <Text style={styles.helperText}>Confirme sua identidade com sua senha atual</Text>
            </View>

            {/* Aviso Importante */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
                <Text style={styles.warningTitle}>Importante</Text>
              </View>
              <Text style={styles.warningText}>
                • Você será desconectado após a alteração{'\n'}
                • Precisará fazer login com o novo email{'\n'}
                • Um email de confirmação será enviado{'\n'}
                • Certifique-se de ter acesso ao novo email
              </Text>
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
                <Text style={styles.submitButtonText}>Alterar Email</Text>
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
  currentEmailCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  currentEmailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
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
