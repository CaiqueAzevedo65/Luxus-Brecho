// Importação condicional do arquivo network-config.json apenas em desenvolvimento
let networkConfig: any = {
  mobile: {
    api_urls: {
      local: 'http://localhost:5000/api',
      network: 'http://192.168.1.100:5000/api',
      emulator: 'http://10.0.2.2:5000/api',
      production: 'https://luxus-brechoapi.vercel.app/api'
    }
  }
};

// Em desenvolvimento, tenta carregar o arquivo gerado localmente
if (__DEV__) {
  try {
    networkConfig = require('../network-config.json');
  } catch (error) {
    console.warn('network-config.json não encontrado, usando valores padrão');
  }
}

// Função para obter valor de env com fallback
const getEnvValue = (key: string, fallback: string): string => {
  return process.env[key] || fallback;
};

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

// Configurações da aplicação
export const CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: getEnvNumber('EXPO_PUBLIC_API_TIMEOUT', 10000),
    MAX_RETRIES: getEnvNumber('EXPO_PUBLIC_API_MAX_RETRIES', 2),
    RETRY_DELAY: getEnvNumber('EXPO_PUBLIC_API_RETRY_DELAY', 2000),
    INITIAL_DELAY: getEnvNumber('EXPO_PUBLIC_API_INITIAL_DELAY', 500),
    CACHE_MINUTES: {
      PRODUCTS: getEnvNumber('EXPO_PUBLIC_CACHE_PRODUCTS_MINUTES', 2),
      CATEGORIES: getEnvNumber('EXPO_PUBLIC_CACHE_CATEGORIES_MINUTES', 5),
      DEFAULT: getEnvNumber('EXPO_PUBLIC_CACHE_DEFAULT_MINUTES', 5)
    }
  },

  // Network Configuration
  NETWORK: {
    LOCAL_URL: getEnvValue('EXPO_PUBLIC_LOCAL_URL', networkConfig.mobile.api_urls.local),
    NETWORK_URL: getEnvValue('EXPO_PUBLIC_NETWORK_URL', networkConfig.mobile.api_urls.network),
    EMULATOR_URL: getEnvValue('EXPO_PUBLIC_EMULATOR_URL', networkConfig.mobile.api_urls.emulator),
    PRODUCTION_URL: getEnvValue('EXPO_PUBLIC_PRODUCTION_URL', networkConfig.mobile.api_urls.production)
  },

  // Cart Configuration
  CART: {
    STORAGE_KEY: getEnvValue('EXPO_PUBLIC_CART_STORAGE_KEY', 'luxus_cart'),
    SHIPPING_FEE: getEnvNumber('EXPO_PUBLIC_SHIPPING_FEE', 15.00),
    FREE_SHIPPING_THRESHOLD: getEnvNumber('EXPO_PUBLIC_FREE_SHIPPING_THRESHOLD', 150.00)
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: getEnvNumber('EXPO_PUBLIC_DEFAULT_PAGE_SIZE', 20),
    DEFAULT_PAGE: getEnvNumber('EXPO_PUBLIC_DEFAULT_PAGE', 1)
  },

  // Categories
  CATEGORIES: [
    { id: 1, name: 'Casual' },
    { id: 2, name: 'Social' },
    { id: 3, name: 'Esportivo' }
  ],

  // App Info
  APP: {
    NAME: getEnvValue('EXPO_PUBLIC_APP_NAME', 'Luxus Brechó'),
    VERSION: getEnvValue('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
    BUILD_ENV: getEnvValue('NODE_ENV', 'development')
  },

  // Debug
  DEBUG: {
    ENABLE_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_LOGS', __DEV__),
    ENABLE_CACHE_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_CACHE_LOGS', __DEV__),
    ENABLE_API_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_API_LOGS', __DEV__),
    ENABLE_NETWORK_INFO: getEnvBoolean('EXPO_PUBLIC_ENABLE_NETWORK_INFO', __DEV__)
  }
} as const;

// Helper function to get the appropriate API URL based on environment
export const getApiUrl = (): string => {
  const { NETWORK, DEBUG } = CONFIG;
  
  // Em produção, sempre usa a URL de produção
  if (!__DEV__) {
    return NETWORK.PRODUCTION_URL;
  }
  
  // Em desenvolvimento, usa a URL da rede local
  return NETWORK.NETWORK_URL;
};

// Export individual sections for easier imports
export const API_CONFIG = CONFIG.API;
export const NETWORK_CONFIG = CONFIG.NETWORK;
export const CART_CONFIG = CONFIG.CART;
export const DEBUG_CONFIG = CONFIG.DEBUG;
