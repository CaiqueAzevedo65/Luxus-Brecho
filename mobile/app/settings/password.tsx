import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

export default function PasswordSettingsScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmarNovaSenha: false
  });
  
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

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.senhaAtual) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    }
    
    if (!formData.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve ter no mínimo 6 caracteres';
    }
    
    if (!formData.confirmarNovaSenha) {
      newErrors.confirmarNovaSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmarNovaSenha) {
      newErrors.confirmarNovaSenha = 'As senhas não coincidem';
    }
    
    if (formData.senhaAtual === formData.novaSenha) {
      newErrors.novaSenha = 'A nova senha deve ser diferente da senha atual';
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
      // Aqui você faria a chamada à API para alterar a senha
      // await api.changePassword({
      //   senha_atual: formData.senhaAtual,
      //   senha_nova: formData.novaSenha
      // });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      success('Senha alterada com sucesso! 🔒');
      
      // Limpar formulário
      setFormData({
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
      });
      
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      showError('Erro ao alterar senha. Verifique sua senha atual.');
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
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.content}>
            {/* Senha Atual */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha Atual *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.senhaAtual}
                  onChangeText={(value) => handleChange('senhaAtual', value)}
                  placeholder="Digite sua senha atual"
                  secureTextEntry={!showPasswords.senhaAtual}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('senhaAtual')}>
                  <Ionicons 
                    name={showPasswords.senhaAtual ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.senhaAtual && <Text style={styles.errorText}>{errors.senhaAtual}</Text>}
            </View>

            {/* Nova Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Senha *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.novaSenha}
                  onChangeText={(value) => handleChange('novaSenha', value)}
                  placeholder="Digite sua nova senha"
                  secureTextEntry={!showPasswords.novaSenha}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('novaSenha')}>
                  <Ionicons 
                    name={showPasswords.novaSenha ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.novaSenha && <Text style={styles.errorText}>{errors.novaSenha}</Text>}
              <Text style={styles.helperText}>Mínimo de 6 caracteres</Text>
            </View>

            {/* Confirmar Nova Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Nova Senha *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmarNovaSenha}
                  onChangeText={(value) => handleChange('confirmarNovaSenha', value)}
                  placeholder="Confirme sua nova senha"
                  secureTextEntry={!showPasswords.confirmarNovaSenha}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('confirmarNovaSenha')}>
                  <Ionicons 
                    name={showPasswords.confirmarNovaSenha ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmarNovaSenha && <Text style={styles.errorText}>{errors.confirmarNovaSenha}</Text>}
            </View>

            {/* Dicas de Segurança */}
            <View style={styles.securityTips}>
              <Text style={styles.securityTitle}>Dicas de Segurança:</Text>
              <Text style={styles.securityTip}>• Use no mínimo 6 caracteres</Text>
              <Text style={styles.securityTip}>• Combine letras, números e símbolos</Text>
              <Text style={styles.securityTip}>• Não use informações pessoais óbvias</Text>
              <Text style={styles.securityTip}>• Não reutilize senhas de outros sites</Text>
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
                <Text style={styles.submitButtonText}>Alterar Senha</Text>
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
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  securityTips: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  securityTip: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
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
