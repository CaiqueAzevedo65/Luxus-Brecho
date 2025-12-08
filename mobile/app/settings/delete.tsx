import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function DeleteAccountScreen() {
  const { user } = useAuthStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: showError } = useToast();

  if (!user) {
    router.replace('/login');
    return null;
  }

  const handleDeleteRequest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const result = await authService.requestAccountDeletion(user.id);

      if (result.success) {
        // Navega para a tela de inserir código
        router.push({
          pathname: '/delete-account-code',
          params: { userId: user.id.toString(), email: user.email },
        });
      } else {
        showError(result.error || 'Erro ao solicitar exclusão');
      }
    } catch (err) {
      showError('Erro ao solicitar exclusão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#EF4444' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Excluir Conta</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={64} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Tem certeza?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Ao excluir sua conta, você perderá permanentemente:
          </Text>

          {/* List of consequences */}
          <View style={styles.consequencesList}>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.consequenceText}>
                Todos os seus dados pessoais
              </Text>
            </View>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.consequenceText}>
                Histórico de compras e favoritos
              </Text>
            </View>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.consequenceText}>
                Acesso à sua conta
              </Text>
            </View>
          </View>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text style={styles.infoText}>
              Após solicitar a exclusão, você receberá um código de 6 dígitos 
              no seu email para confirmar a ação. O código será válido por 30 minutos.
            </Text>
          </View>

          {/* User email */}
          <View style={styles.emailBox}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.emailText}>
              O código será enviado para: <Text style={styles.emailHighlight}>{user.email}</Text>
            </Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
            onPress={handleDeleteRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.deleteButtonText}>Solicitar Exclusão</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Confirm Modal */}
        <ConfirmModal
          visible={showConfirmModal}
          title="Excluir Conta"
          message="Você está prestes a solicitar a exclusão da sua conta. Um código de verificação será enviado para seu email. Deseja continuar?"
          confirmText="Continuar"
          cancelText="Cancelar"
          icon="warning"
          iconColor="#EF4444"
          isDestructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#EF4444',
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
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  consequencesList: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  consequenceText: {
    fontSize: 14,
    color: '#991B1B',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 20,
  },
  emailBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
