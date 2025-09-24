// Tipos para informações de debug
export interface NetworkInfo {
  isConnected: boolean | null;
  type: string;
  isInternetReachable?: boolean | null;
  details?: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string;
    carrier?: string;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  timestamp: string;
  version?: string;
  database?: {
    connected: boolean;
    responseTime?: number;
  };
}

export interface UserInfo {
  id?: number;
  nome?: string;
  email?: string;
  role?: 'Cliente' | 'Administrador';
  isAuthenticated: boolean;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  brand?: string;
  screenWidth: number;
  screenHeight: number;
  isEmulator?: boolean;
}

export interface DebugInfo {
  networkInfo: NetworkInfo;
  apiUrl: string;
  backendHealth: HealthStatus;
  userInfo: UserInfo;
  deviceInfo: DeviceInfo;
}
