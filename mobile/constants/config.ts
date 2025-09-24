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
    TIMEOUT: 10000, // 10 segundos
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000, // 2 segundos
    INITIAL_DELAY: 500, // 500ms
    CACHE_MINUTES: {
      PRODUCTS: getEnvNumber('EXPO_PUBLIC_CACHE_PRODUCTS_MINUTES', 2),
      CATEGORIES: getEnvNumber('EXPO_PUBLIC_CACHE_CATEGORIES_MINUTES', 5),
      DEFAULT: getEnvNumber('EXPO_PUBLIC_CACHE_DEFAULT_MINUTES', 5)
    }
  },

  // Network Configuration
  NETWORK: {
    LOCAL_URL: 'http://localhost:5000/api',
    NETWORK_URL: getEnvValue('EXPO_PUBLIC_API_URL', 'http://192.168.0.3:5000/api'),
    EMULATOR_URL: 'http://10.0.2.2:5000/api',
    PRODUCTION_URL: getEnvValue('EXPO_PUBLIC_PRODUCTION_API_URL', 'https://sua-api.herokuapp.com/api')
  },

  // Cart Configuration
  CART: {
    STORAGE_KEY: 'luxus_cart',
    SHIPPING_FEE: getEnvNumber('EXPO_PUBLIC_SHIPPING_FEE', 15.00),
    FREE_SHIPPING_THRESHOLD: getEnvNumber('EXPO_PUBLIC_FREE_SHIPPING_THRESHOLD', 150.00)
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    DEFAULT_PAGE: 1
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
    VERSION: getEnvValue('EXPO_PUBLIC_APP_VERSION', '1.0.0')
  },

  // Debug
  DEBUG: {
    ENABLE_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_LOGS', __DEV__),
    ENABLE_CACHE_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_CACHE_LOGS', __DEV__),
    ENABLE_API_LOGS: getEnvBoolean('EXPO_PUBLIC_ENABLE_API_LOGS', __DEV__)
  }
} as const;
