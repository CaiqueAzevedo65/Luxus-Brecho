import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { apiService } from '../../services/api';

interface ConnectionStatusProps {
  showDetails?: boolean;
}

export default function ConnectionStatus({ showDetails = false }: ConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<{
    backend: boolean;
    api_url: string;
    error?: string;
    isLoading: boolean;
    lastCheck?: string;
  }>({
    backend: false,
    api_url: '',
    isLoading: true,
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await apiService.testConnection();
      setConnectionStatus({
        ...result,
        isLoading: false,
        lastCheck: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setConnectionStatus({
        backend: false,
        api_url: '',
        error: 'Erro ao testar conexão',
        isLoading: false,
        lastCheck: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const showDiagnostic = () => {
    const message = `
Status da Conexão:
• Backend: ${connectionStatus.backend ? '✅ Online' : '❌ Offline'}
• URL: ${connectionStatus.api_url}
• Última verificação: ${connectionStatus.lastCheck}
${connectionStatus.error ? `• Erro: ${connectionStatus.error}` : ''}

Troubleshooting:
1. Verifique se o backend está rodando (python run.py)
2. Para dispositivo físico, configure seu IP em services/api.ts
3. Verifique sua conexão de internet
4. Tente recarregar o app
    `;
    
    Alert.alert('Diagnóstico de Conexão', message);
  };

  if (!showDetails && connectionStatus.backend) {
    return null; // Não mostra se está tudo OK e não quer detalhes
  }

  return (
    <View className="flex-row items-center justify-between p-3 mx-4 my-2 rounded-lg bg-gray-100">
      <View className="flex-row items-center flex-1">
        {connectionStatus.isLoading ? (
          <MaterialIcons name="sync" size={20} color="#f59e0b" />
        ) : connectionStatus.backend ? (
          <MaterialIcons name="wifi" size={20} color="#10b981" />
        ) : (
          <MaterialIcons name="wifi-off" size={20} color="#ef4444" />
        )}
        
        <Text className="ml-2 text-sm text-gray-700">
          {connectionStatus.isLoading
            ? 'Verificando conexão...'
            : connectionStatus.backend
            ? 'Backend Online'
            : 'Backend Offline'
          }
        </Text>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          onPress={checkConnection}
          className="p-2 rounded"
          disabled={connectionStatus.isLoading}
        >
          <MaterialIcons 
            name="refresh" 
            size={18} 
            color={connectionStatus.isLoading ? "#9ca3af" : "#6b7280"} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showDiagnostic}
          className="p-2 rounded ml-1"
        >
          <MaterialIcons name="info" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
