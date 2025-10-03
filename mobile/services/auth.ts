import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/networkUtils';

export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'Cliente' | 'Administrador';
  ativo: boolean;
  email_confirmado: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

const AUTH_TOKEN_KEY = '@luxus_brecho:auth_token';
const USER_DATA_KEY = '@luxus_brecho:user_data';

class AuthService {
  private currentUser: User | null = null;

  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string; emailNotConfirmed?: boolean }> {
    try {
      const response = await fetch(`${getApiUrl()}/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      // Verifica se o email não foi confirmado
      if (response.status === 403 && data.email_not_confirmed) {
        return { 
          success: false, 
          error: data.message || 'Email não confirmado',
          emailNotConfirmed: true 
        };
      }

      if (!response.ok) {
        return { success: false, error: data.message || 'Credenciais inválidas' };
      }

      if (data && data.user) {
        // Salvar dados do usuário no AsyncStorage
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
        
        this.currentUser = data.user;
        
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  }

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string; requiresEmailConfirmation?: boolean }> {
    try {
      // Validar se as senhas coincidem
      if (data.senha !== data.confirmarSenha) {
        return { success: false, error: 'As senhas não coincidem' };
      }

      // Criar payload para o backend
      const payload = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        tipo: 'Cliente' as const, // Sempre cliente para registro via mobile
      };

      const response = await fetch(`${getApiUrl()}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: responseData.message || 'Erro ao criar conta' 
        };
      }

      if (responseData && responseData.user) {
        // Retorna sucesso mas indica que precisa confirmar email
        return { 
          success: true, 
          user: responseData.user,
          requiresEmailConfirmation: responseData.email_confirmation_required || false
        };
      }

      return { success: false, error: 'Erro ao criar conta' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
    }
  }

  /**
   * Reenvia email de confirmação
   */
  async resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/users/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Erro ao reenviar email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      return { success: false, error: 'Erro ao reenviar email. Tente novamente.' };
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      this.currentUser = null;
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token !== null;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém dados do usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Inicializa o serviço de autenticação
   */
  async initialize(): Promise<User | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (isAuth) {
        return await this.getCurrentUser();
      }
      return null;
    } catch (error) {
      console.error('Erro ao inicializar auth service:', error);
      return null;
    }
  }

  /**
   * Atualiza dados do usuário no storage
   */
  async updateUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      this.currentUser = user;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }
}

export const authService = new AuthService();
