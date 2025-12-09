import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './auth';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAccessToken', () => {
    it('deve retornar null quando não há token', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.getAccessToken()).toBeNull();
    });

    it('deve retornar o token quando existe', () => {
      localStorage.getItem.mockReturnValue('test-token');
      expect(authService.getAccessToken()).toBe('test-token');
    });
  });

  describe('isTokenExpired', () => {
    it('deve retornar true quando não há data de expiração', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.isTokenExpired()).toBe(true);
    });

    it('deve retornar true quando token está expirado', () => {
      const pastTime = Date.now() - 1000;
      localStorage.getItem.mockReturnValue(pastTime.toString());
      expect(authService.isTokenExpired()).toBe(true);
    });

    it('deve retornar false quando token ainda é válido', () => {
      const futureTime = Date.now() + 100000;
      localStorage.getItem.mockReturnValue(futureTime.toString());
      expect(authService.isTokenExpired()).toBe(false);
    });
  });

  describe('saveTokens', () => {
    it('deve salvar tokens no localStorage', () => {
      authService.saveTokens('access', 'refresh', 3600);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('luxus_access_token', 'access');
      expect(localStorage.setItem).toHaveBeenCalledWith('luxus_refresh_token', 'refresh');
      expect(localStorage.setItem).toHaveBeenCalledTimes(3); // access, refresh, expires
    });
  });

  describe('clearTokens', () => {
    it('deve remover tokens do localStorage', () => {
      authService.clearTokens();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_token_expires');
    });
  });

  describe('logout', () => {
    it('deve limpar todos os dados de autenticação', () => {
      authService.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_auth');
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('luxus_access_token');
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar false quando não há auth nem token', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('deve retornar true quando há auth e token', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'luxus_auth') return 'authenticated';
        if (key === 'luxus_access_token') return 'token';
        return null;
      });
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar null quando não há usuário', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('deve retornar usuário parseado', () => {
      const user = { id: 1, nome: 'Test', email: 'test@test.com' };
      localStorage.getItem.mockReturnValue(JSON.stringify(user));
      expect(authService.getCurrentUser()).toEqual(user);
    });

    it('deve retornar null quando JSON é inválido', () => {
      // Silencia o console.error esperado para este teste
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorage.getItem.mockReturnValue('invalid-json');
      expect(authService.getCurrentUser()).toBeNull();
      
      // Verifica que o erro foi logado e restaura
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          user: { id: 1, nome: 'Test' },
          access_token: 'access',
          refresh_token: 'refresh',
          expires_in: 3600
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', senha: '123456' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual({ id: 1, nome: 'Test' });
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('deve retornar erro quando email não confirmado', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          message: 'Email não confirmado',
          email_not_confirmed: true
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', senha: '123456' });

      expect(result.success).toBe(false);
      expect(result.emailNotConfirmed).toBe(true);
    });

    it('deve retornar erro quando credenciais inválidas', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Credenciais inválidas' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', senha: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciais inválidas');
    });
  });
});
