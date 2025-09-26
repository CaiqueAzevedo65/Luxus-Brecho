// Tipos para network-config.json
export interface NetworkConfig {
  description: string;
  backend: {
    host: string;
    port: number;
    current_ip: string;
    urls: {
      local: string;
      network: string;
    };
  };
  mobile: {
    api_urls: {
      local: string;
      network: string;
      emulator: string;
      production: string;
    };
    current_environment: string;
    preferred_url: string;
  };
  cors: {
    allowed_origins: string[];
  };
  troubleshooting: {
    common_issues: string[];
    commands: {
      check_backend: string;
      get_network_ip_windows: string;
      get_network_ip_linux: string;
    };
  };
}

declare module '../network-config.json' {
  const value: NetworkConfig;
  export default value;
}
