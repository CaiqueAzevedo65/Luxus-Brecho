import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/networkUtils';

export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'Cliente' | 'Administrador';
  ativo: boolean;
  created_at: string;
  updated_at: string;
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
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${getApiUrl()}/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data: AuthResponse = await response.json();

      if (data && data.user) {
        // Salvar dados do usuário no AsyncStorage
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'authenticated'); // Token simples por enquanto
        
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
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
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

      if (!response.ok) {
        throw new Error('Erro ao criar conta');
      }

      const responseData: { message: string; user: User } = await response.json();

      if (responseData && responseData.user) {
        // Após registro, fazer login automaticamente
        const loginResult = await this.login({
          email: data.email,
          senha: data.senha,
        });

        return loginResult;
      }

      return { success: false, error: 'Erro ao criar conta' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratar erro de email já existente
      if (error.message && error.message.includes('já existe')) {
        return { success: false, error: 'Este email já está cadastrado' };
      }
      
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
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
