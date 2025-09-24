import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  useEffect(() => {
    // Inicializar dados de autenticação ao carregar a tela
    initialize();
  }, []);

  // Se não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.replace('/login');
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
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
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações do Usuário */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#E91E63" />
            </View>
          </View>
          
          <Text style={styles.userName}>{user.nome}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userTypeContainer}>
            <Text style={styles.userType}>{user.tipo}</Text>
          </View>
        </View>

        {/* Informações da Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Conta</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{user.nome}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de Conta</Text>
              <Text style={styles.infoValue}>{user.tipo}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membro desde</Text>
              <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons 
                name={user.ativo ? "checkmark-circle-outline" : "close-circle-outline"} 
                size={20} 
                color={user.ativo ? "#22C55E" : "#EF4444"} 
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status da Conta</Text>
              <Text style={[
                styles.infoValue, 
                { color: user.ativo ? "#22C55E" : "#EF4444" }
              ]}>
                {user.ativo ? "Ativa" : "Inativa"}
              </Text>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings-outline" size={20} color="#666" />
            </View>
            <Text style={styles.actionText}>Configurações</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
            </View>
            <Text style={styles.actionText}>Ajuda</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
            </View>
            <Text style={styles.actionText}>Sobre</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  userTypeContainer: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userType: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 40,
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
