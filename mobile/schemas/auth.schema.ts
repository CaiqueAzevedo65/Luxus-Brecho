import { z } from 'zod';

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
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra e um número'),
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

// Tipos inferidos
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type SearchFormData = z.infer<typeof SearchSchema>;

// Hook personalizado para validação com Zod
export const useZodValidation = <T extends z.ZodSchema>(schema: T) => {
  const validate = (data: unknown) => {
    try {
      const result = schema.parse(data);
      return { success: true as const, data: result, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { success: false as const, data: null, errors };
      }
      return { success: false as const, data: null, errors: { general: 'Erro de validação' } };
    }
  };

  return { validate };
};