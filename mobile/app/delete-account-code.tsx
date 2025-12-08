import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

export default function DeleteAccountCodeScreen() {
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { error: showError, success: showSuccess } = useToast();

  // Focus no primeiro input ao montar
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    // Apenas números
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Move para próximo input se digitou um número
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length === 6) {
      // Cole do clipboard
      const digits = numericValue.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmDeletion = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      showError('Digite o código completo de 6 dígitos');
      return;
    }

    if (!userId) {
      showError('Erro: ID do usuário não encontrado');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmAccountDeletion(parseInt(userId), fullCode);

      if (result.success) {
        router.replace('/account-deleted');
      } else {
        showError(result.error || 'Código inválido');
        // Limpa o código em caso de erro
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      showError('Erro ao confirmar exclusão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) return;

    setResending(true);

    try {
      const result = await authService.requestAccountDeletion(parseInt(userId));

      if (result.success) {
        showSuccess('Novo código enviado para seu email');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showError(result.error || 'Erro ao reenviar código');
      }
    } catch (err) {
      showError('Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
    'seu email';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmar Exclusão</Text>
        </View>

        <View style={styles.content}>
          {/* Ícone */}
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={48} color="#EF4444" />
          </View>

          {/* Título */}
          <Text style={styles.title}>Verifique seu Email</Text>

          {/* Descrição */}
          <Text style={styles.description}>
            Enviamos um código de 6 dígitos para{'\n'}
            <Text style={styles.emailText}>{maskedEmail}</Text>
          </Text>

          {/* Aviso de tempo */}
          <View style={styles.warningContainer}>
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              O código é válido por 30 minutos
            </Text>
          </View>

          {/* Inputs do código */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Botão de confirmar */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (loading || code.join('').length !== 6) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmDeletion}
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Excluir Minha Conta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Reenviar código */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#E91E63" />
            ) : (
              <Text style={styles.resendButtonText}>
                Não recebeu? Reenviar código
              </Text>
            )}
          </TouchableOpacity>

          {/* Aviso */}
          <View style={styles.dangerContainer}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text style={styles.dangerText}>
              Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#EF4444',
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
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emailText: {
    fontWeight: '600',
    color: '#333',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  codeInputFilled: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  confirmButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  resendButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
});
