import { create } from 'zustand';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';

interface AuthState {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Ações
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Fazer login
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.login(credentials);

      if (result.success && result.user) {
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Erro no login',
        });
        return false;
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro inesperado no login',
      });
      return false;
    }
  },

  // Registrar novo usuário
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.register(data);

      if (result.success && result.user) {
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Erro no registro',
        });
        return false;
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro inesperado no registro',
      });
      return false;
    }
  },

  // Fazer logout
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Erro no logout',
      });
    }
  },

  // Inicializar estado de autenticação
  initialize: async () => {
    set({ isLoading: true });

    try {
      const user = await authService.initialize();

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro ao inicializar autenticação',
      });
    }
  },

  // Limpar erro
  clearError: () => {
    set({ error: null });
  },

  // Atualizar dados do usuário
  updateUser: (user: User) => {
    set({ user });
    authService.updateUserData(user);
  },
}));
