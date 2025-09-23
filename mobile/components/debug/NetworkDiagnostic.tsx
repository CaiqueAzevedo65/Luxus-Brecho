import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnectivity, getNetworkInfo } from '../../utils/networkUtils';
import { apiService } from '../../services/api';

export default function NetworkDiagnostic() {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      // Testa conectividade
      const connectivity = await testConnectivity();
      
      // Testa health check
      let healthCheck = null;
      try {
        healthCheck = await apiService.healthCheck();
      } catch (error) {
        healthCheck = { error: (error as Error).message };
      }

      // Informações de rede
      const networkInfo = getNetworkInfo();

      setDiagnosticResult({
        connectivity,
        healthCheck,
        networkInfo,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDiagnosticResult({
        error: (error as Error).message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      runDiagnostic();
    }
  }, [isVisible]);

  if (!__DEV__) {
    return null; // Só mostra em desenvolvimento
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Ionicons 
          name={isVisible ? "close" : "information-circle"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.toggleText}>
          {isVisible ? 'Fechar' : 'Debug'}
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Diagnóstico de Rede</Text>
            <TouchableOpacity onPress={runDiagnostic} disabled={isLoading}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color={isLoading ? "#999" : "#E91E63"} 
              />
            </TouchableOpacity>
          </View>

          {diagnosticResult && (
            <View style={styles.content}>
              <Text style={styles.timestamp}>
                Última atualização: {diagnosticResult.timestamp}
              </Text>

              {diagnosticResult.networkInfo && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Configuração:</Text>
                  <Text style={styles.info}>
                    Plataforma: {diagnosticResult.networkInfo.platform}
                  </Text>
                  <Text style={styles.info}>
                    URL Atual: {diagnosticResult.networkInfo.currentUrl}
                  </Text>
                  <Text style={styles.info}>
                    Desenvolvimento: {diagnosticResult.networkInfo.isDev ? 'Sim' : 'Não'}
                  </Text>
                </View>
              )}

              {diagnosticResult.connectivity && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Conectividade:</Text>
                  <View style={styles.statusRow}>
                    <Ionicons 
                      name={diagnosticResult.connectivity.success ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={diagnosticResult.connectivity.success ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                      styles.status,
                      { color: diagnosticResult.connectivity.success ? "#4CAF50" : "#F44336" }
                    ]}>
                      {diagnosticResult.connectivity.success ? 'Conectado' : 'Falha na conexão'}
                    </Text>
                  </View>
                  {diagnosticResult.connectivity.url && (
                    <Text style={styles.info}>
                      URL: {diagnosticResult.connectivity.url}
                    </Text>
                  )}
                  {diagnosticResult.connectivity.error && (
                    <Text style={styles.error}>
                      Erro: {diagnosticResult.connectivity.error}
                    </Text>
                  )}
                </View>
              )}

              {diagnosticResult.healthCheck && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Health Check:</Text>
                  {diagnosticResult.healthCheck.error ? (
                    <Text style={styles.error}>
                      Erro: {diagnosticResult.healthCheck.error}
                    </Text>
                  ) : (
                    <Text style={styles.success}>
                      Status: {diagnosticResult.healthCheck.status}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    gap: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  info: {
    fontSize: 12,
    color: '#666',
  },
  success: {
    fontSize: 12,
    color: '#4CAF50',
  },
  error: {
    fontSize: 12,
    color: '#F44336',
  },
});
