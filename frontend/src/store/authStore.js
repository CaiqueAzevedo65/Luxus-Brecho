import { create } from 'zustand';
import { authService } from '../services/auth';

export const useAuthStore = create((set, get) => ({
  // Estado
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Fazer login
  login: async (credentials) => {
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
        return { success: true };
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Erro no login',
        });
        return { success: false, emailNotConfirmed: result.emailNotConfirmed };
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro inesperado no login',
      });
      return { success: false };
    }
  },

  // Registrar novo usuário
  register: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.register(data);

      if (result.success && result.user) {
        set({
          user: null,  // Não autenticar automaticamente se precisar confirmar email
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return { 
          success: true, 
          requiresEmailConfirmation: result.requiresEmailConfirmation 
        };
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Erro no registro',
        });
        return { success: false, error: result.error || 'Erro no registro' };
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro inesperado no registro',
      });
      return { success: false, error: 'Erro inesperado no registro' };
    }
  },

  // Reenviar email de confirmação
  resendConfirmation: async (email) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.resendConfirmationEmail(email);

      set({ isLoading: false });

      if (result.success) {
        return true;
      } else {
        set({ error: result.error || 'Erro ao reenviar email' });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false,
        error: 'Erro ao reenviar email'
      });
      return false;
    }
  },

  // Fazer logout
  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Inicializar estado de autenticação
  initialize: () => {
    set({ isLoading: true });

    try {
      const user = authService.initialize();

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
  updateUser: (user) => {
    set({ user });
    authService.updateUserData(user);
  },
}));
