import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

/**
 * Hook para monitorar status de conectividade de rede.
 * Retorna informações sobre conexão e função para verificar manualmente.
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    // Verificar status inicial
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Escutar mudanças de conectividade
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
      
      setNetworkStatus(newStatus);
      
      if (!newStatus.isConnected) {
        logger.warn('Conexão de rede perdida', 'NETWORK', { type: state.type });
      } else if (newStatus.isConnected && !newStatus.isInternetReachable) {
        logger.warn('Conectado mas sem acesso à internet', 'NETWORK', { type: state.type });
      } else {
        logger.info('Conexão de rede restaurada', 'NETWORK', { type: state.type });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      logger.error('Erro ao verificar conexão', error as Error, 'NETWORK');
      return false;
    }
  }, []);

  return {
    ...networkStatus,
    checkConnection,
  };
}

/**
 * Hook simplificado que retorna apenas se está online.
 */
export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && (isInternetReachable !== false);
}
