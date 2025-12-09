import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getApiUrl } from '../utils/networkUtils';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validação
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      // Mesmo que o email não exista, mostramos mensagem genérica por segurança
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Erro ao solicitar recuperação de senha:', err);
      // Mesmo em caso de erro, mostramos mensagem de sucesso por segurança
      setSuccess(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Senha</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {!success ? (
              <View style={styles.card}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={48} color="#E91E63" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Esqueceu sua senha?</Text>

                {/* Description */}
                <Text style={styles.description}>
                  Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
                </Text>

                {/* Error */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError('');
                      }}
                      placeholder="Digite seu email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Lembrou sua senha?</Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>Voltar para Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
                </View>

                {/* Success Title */}
                <Text style={styles.title}>Email Enviado!</Text>

                {/* Success Description */}
                <Text style={styles.description}>
                  Se o email informado estiver cadastrado em nossa base, você receberá um link para redefinir sua senha.
                </Text>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color="#3B82F6" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Não recebeu o email?</Text>
                    <Text style={styles.infoItem}>• Verifique sua caixa de spam</Text>
                    <Text style={styles.infoItem}>• Aguarde alguns minutos</Text>
                    <Text style={styles.infoItem}>• Certifique-se de que digitou o email correto</Text>
                  </View>
                </View>

                {/* Back to Login Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.submitButtonText}>Voltar para Login</Text>
                </TouchableOpacity>

                {/* Resend Button */}
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => setSuccess(false)}
                >
                  <Text style={styles.resendButtonText}>Enviar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 4,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
});
