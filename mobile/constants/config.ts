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

// Auto-detect network IP or use environment variable
const getNetworkUrl = (): string => {
  // Priority: Environment variable > Auto-detected IP > Fallback
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // You can add auto-detection logic here if needed
  // For now, use a common network IP as fallback
  return 'http://192.168.1.100:5000/api'; // Update this to your actual IP
};

// Configurações da aplicação
export const CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: getEnvNumber('EXPO_PUBLIC_API_TIMEOUT', 10000), // 10 segundos
    MAX_RETRIES: getEnvNumber('EXPO_PUBLIC_API_MAX_RETRIES', 2),
    RETRY_DELAY: getEnvNumber('EXPO_PUBLIC_API_RETRY_DELAY', 2000), // 2 segundos
    INITIAL_DELAY: getEnvNumber('EXPO_PUBLIC_API_INITIAL_DELAY', 500), // 500ms
    CACHE_MINUTES: {
      PRODUCTS: getEnvNumber('EXPO_PUBLIC_CACHE_PRODUCTS_MINUTES', 2),
      CATEGORIES: getEnvNumber('EXPO_PUBLIC_CACHE_CATEGORIES_MINUTES', 5),
      DEFAULT: getEnvNumber('EXPO_PUBLIC_CACHE_DEFAULT_MINUTES', 5)
    }
  },

  // Network Configuration
  NETWORK: {
    LOCAL_URL: 'http://localhost:5000/api',
    NETWORK_URL: getNetworkUrl(),
    EMULATOR_URL: 'http://10.0.2.2:5000/api',
    PRODUCTION_URL: getEnvValue('EXPO_PUBLIC_PRODUCTION_API_URL', 'https://sua-api.herokuapp.com/api')
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

  // Categories (could be loaded from API, but kept static for performance)
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
  
  // In production, always use production URL
  if (CONFIG.APP.BUILD_ENV === 'production') {
    return NETWORK.PRODUCTION_URL;
  }
  
  // In development, try network URL first, then fallback
  try {
    // You can add logic here to test connectivity
    // For now, return network URL for mobile development
    return NETWORK.NETWORK_URL;
  } catch {
    if (DEBUG.ENABLE_LOGS) {
      console.warn('Network URL not reachable, falling back to localhost');
    }
    return NETWORK.LOCAL_URL;
  }
};

// Export individual sections for easier imports
export const API_CONFIG = CONFIG.API;
export const NETWORK_CONFIG = CONFIG.NETWORK;
export const CART_CONFIG = CONFIG.CART;
export const DEBUG_CONFIG = CONFIG.DEBUG;