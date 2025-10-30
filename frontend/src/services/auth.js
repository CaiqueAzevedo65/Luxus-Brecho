const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  /**
   * Faz login do usuário
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/users/auth`, {
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
        // Salvar dados do usuário no localStorage
        localStorage.setItem('luxus_user', JSON.stringify(data.user));
        localStorage.setItem('luxus_auth', 'authenticated');
        
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  },

  /**
   * Registra novo usuário
   */
  async register(data) {
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
        tipo: 'Cliente', // Sempre cliente para registro via frontend
      };

      const response = await fetch(`${API_URL}/users`, {
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
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
    }
  },

  /**
   * Reenvia email de confirmação
   */
  async resendConfirmationEmail(email) {
    try {
      const response = await fetch(`${API_URL}/users/resend-confirmation`, {
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
  },

  /**
   * Faz logout do usuário
   */
  logout() {
    try {
      localStorage.removeItem('luxus_auth');
      localStorage.removeItem('luxus_user');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated() {
    try {
      const token = localStorage.getItem('luxus_auth');
      return token !== null;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  },

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('luxus_user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },

  /**
   * Inicializa o serviço de autenticação
   */
  initialize() {
    try {
      const isAuth = this.isAuthenticated();
      if (isAuth) {
        return this.getCurrentUser();
      }
      return null;
    } catch (error) {
      console.error('Erro ao inicializar auth service:', error);
      return null;
    }
  },

  /**
   * Atualiza dados do usuário no storage
   */
  updateUserData(user) {
    try {
      localStorage.setItem('luxus_user', JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  },
};
