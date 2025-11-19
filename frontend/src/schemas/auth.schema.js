import { z } from 'zod';
import { useCallback } from 'react';

// Schema para login
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  senha: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

// Schema para registro
export const RegisterSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  senha: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmarSenha: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'Senhas não coincidem',
  path: ['confirmarSenha'],
});

// Schema para busca
export const SearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Digite pelo menos 2 caracteres para buscar')
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .trim(),
});

// Hook personalizado para validação com Zod
export const useZodValidation = (schema) => {
  const validate = useCallback((data) => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        
        // Usar o método issues do ZodError que é mais confiável
        const issues = error.issues || error.errors || [];
        
        issues.forEach((issue) => {
          if (issue && issue.path && Array.isArray(issue.path)) {
            const path = issue.path.join('.');
            errors[path] = issue.message || 'Erro de validação';
          }
        });
        
        return { success: false, data: null, errors };
      }
      
      console.error('Erro de validação:', error);
      return { success: false, data: null, errors: { general: 'Erro de validação' } };
    }
  }, [schema]);

  return { validate };
};

// Export alternativo para compatibilidade
export const registerSchema = RegisterSchema;
