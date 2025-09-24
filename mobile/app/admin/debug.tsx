import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
// import NetworkDiagnostic from '../../components/debug/NetworkDiagnostic';
import { getNetworkInfo, getApiUrl } from '../../utils/networkUtils';
import { apiService } from '../../services/api';

interface DebugInfo {
  networkInfo: any;
  apiUrl: string;
  backendHealth: any;
  userInfo: any;
  deviceInfo: any;
}

export default function DebugScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Verificar se é administrador
    if (!isAuthenticated || user?.tipo !== 'Administrador') {
      Alert.alert(
        'Acesso negado',
        'Apenas administradores podem acessar o debug.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    loadDebugInfo();
  }, [isAuthenticated, user]);

  const loadDebugInfo = async () => {
    try {
      setIsLoading(true);

      // Coletar informações de rede
      const networkInfo = getNetworkInfo();
      const apiUrl = getApiUrl();

      // Testar saúde do backend
      let backendHealth: any = null;
      try {
        // Usar um endpoint simples para testar conectividade
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
          backendHealth = await response.json();
        } else {
          backendHealth = { error: `HTTP ${response.status}` };
        }
      } catch (error) {
        backendHealth = { error: 'Backend não acessível', details: (error as Error).message };
      }

      // Informações do usuário
      const userInfo = {
        isAuthenticated,
        user: user ? {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          ativo: user.ativo,
        } : null,
      };

      // Informações do dispositivo
      const deviceInfo = {
        platform: 'mobile',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      setDebugInfo({
        networkInfo,
        apiUrl,
        backendHealth,
        userInfo,
        deviceInfo,
      });
    } catch (error) {
      console.error('Erro ao carregar informações de debug:', error);
      Alert.alert('Erro', 'Erro ao carregar informações de debug.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDebugInfo();
  };

  const handleCopyToClipboard = () => {
    if (!debugInfo) return;

    const debugText = JSON.stringify(debugInfo, null, 2);
    // Em um app real, usaríamos Clipboard.setString(debugText)
    Alert.alert('Debug Info', 'Informações copiadas para debug (funcionalidade simulada)');
  };

  const handleTestConnection = async () => {
    try {
      Alert.alert('Testando...', 'Testando conexão com o backend...');
      
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        const health = await response.json();
        Alert.alert(
          'Teste de Conexão',
          `✅ Backend acessível!\n\nStatus: ${health.status || 'OK'}\nTimestamp: ${health.timestamp || 'N/A'}`
        );
      } else {
        Alert.alert(
          'Teste de Conexão',
          `❌ Erro HTTP ${response.status}!`
        );
      }
    } catch (error) {
      Alert.alert(
        'Teste de Conexão',
        `❌ Erro na conexão!\n\nDetalhes: ${(error as Error).message}`
      );
    }
  };

  const renderInfoSection = (title: string, data: any, icon: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color="#E91E63" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.debugText}>
          {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
        </Text>
      </View>
    </View>
  );

  if (!isAuthenticated || user?.tipo !== 'Administrador') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="shield-outline" size={80} color="#EF4444" />
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedText}>
            Apenas administradores podem acessar esta tela
          </Text>
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
        <Text style={styles.headerTitle}>Debug</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Ionicons 
            name={isRefreshing ? "refresh" : "refresh-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Coletando informações...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Ações rápidas */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.testButton]}
              onPress={handleTestConnection}
            >
              <Ionicons name="wifi-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Testar Conexão</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyToClipboard}
            >
              <Ionicons name="copy-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Copiar Info</Text>
            </TouchableOpacity>
          </View>

          {/* Diagnóstico de rede simplificado */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={20} color="#E91E63" />
              <Text style={styles.sectionTitle}>Diagnóstico de Rede</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.debugText}>
                Diagnóstico integrado nas informações acima
              </Text>
            </View>
          </View>

          {debugInfo && (
            <>
              {/* Informações de Rede */}
              {renderInfoSection(
                'Informações de Rede',
                debugInfo.networkInfo,
                'globe-outline'
              )}

              {/* URL da API */}
              {renderInfoSection(
                'URL da API',
                debugInfo.apiUrl,
                'link-outline'
              )}

              {/* Saúde do Backend */}
              {renderInfoSection(
                'Saúde do Backend',
                debugInfo.backendHealth,
                'pulse-outline'
              )}

              {/* Informações do Usuário */}
              {renderInfoSection(
                'Informações do Usuário',
                debugInfo.userInfo,
                'person-outline'
              )}

              {/* Informações do Dispositivo */}
              {renderInfoSection(
                'Informações do Dispositivo',
                debugInfo.deviceInfo,
                'phone-portrait-outline'
              )}
            </>
          )}

          {/* Espaço extra no final */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#22C55E',
  },
  copyButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    padding: 16,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});
