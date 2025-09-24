import { Platform } from 'react-native';
import { CONFIG } from '../constants/config';

/**
 * Detecta automaticamente a URL da API baseada no ambiente
 */
export function getApiUrl(): string {
  if (!__DEV__) {
    return CONFIG.NETWORK.PRODUCTION_URL;
  }

  // Em desenvolvimento, sempre usa o IP da rede para dispositivos físicos
  // O Expo Go sempre roda em dispositivo físico, não em emulador
  return CONFIG.NETWORK.NETWORK_URL;
}

/**
 * Testa conectividade com diferentes URLs
 */
export async function testConnectivity(): Promise<{
  success: boolean;
  url: string;
  error?: string;
}> {
  const urlsToTest = [
    CONFIG.NETWORK.NETWORK_URL,
    CONFIG.NETWORK.LOCAL_URL,
    CONFIG.NETWORK.EMULATOR_URL
  ];

  for (const url of urlsToTest) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true, url };
      }
    } catch (error) {
      console.log(`Failed to connect to ${url}:`, error);
    }
  }

  return {
    success: false,
    url: '',
    error: 'Não foi possível conectar com nenhuma URL'
  };
}

/**
 * Obtém informações de rede para debug
 */
export function getNetworkInfo() {
  return {
    platform: Platform.OS,
    isDev: __DEV__,
    currentUrl: getApiUrl(),
    availableUrls: {
      network: CONFIG.NETWORK.NETWORK_URL,
      local: CONFIG.NETWORK.LOCAL_URL,
      emulator: CONFIG.NETWORK.EMULATOR_URL,
      production: CONFIG.NETWORK.PRODUCTION_URL
    }
  };
}
