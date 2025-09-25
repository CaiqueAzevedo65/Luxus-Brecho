// Configurações da aplicação
export const CONFIG = {
  // API Configuration
  API: {
    TIMEOUT: 10000, // 10 segundos
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000, // 2 segundos
    INITIAL_DELAY: 500, // 500ms
    CACHE_MINUTES: {
      PRODUCTS: 2,
      CATEGORIES: 5,
      DEFAULT: 5
    }
  },

  // Network Configuration
  NETWORK: {
    LOCAL_URL: 'http://localhost:5000/api',
    NETWORK_URL: 'http://172.25.32.1:5000/api',
    EMULATOR_URL: 'http://10.0.2.2:5000/api',
    PRODUCTION_URL: 'https://sua-api.herokuapp.com/api'
  },

  // Cart Configuration
  CART: {
    STORAGE_KEY: 'luxus_cart',
    SHIPPING_FEE: 15.00,
    FREE_SHIPPING_THRESHOLD: 150.00
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

  // Debug
  DEBUG: {
    ENABLE_LOGS: __DEV__, // Só em desenvolvimento
    ENABLE_CACHE_LOGS: __DEV__,
    ENABLE_API_LOGS: __DEV__
  }
} as const;
