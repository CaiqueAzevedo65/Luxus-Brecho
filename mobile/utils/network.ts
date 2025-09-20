import { Platform } from 'react-native';

export async function getNetworkIP(): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return 'localhost';
    }

    // Para desenvolvimento local
    return '10.0.2.2'; // IP padrão para Android Emulator
  } catch (error) {
    console.error('Erro ao obter IP da rede:', error);
    return 'localhost';
  }
}
