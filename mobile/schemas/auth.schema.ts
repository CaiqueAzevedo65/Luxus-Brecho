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
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

// Schema para busca
export const SearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Digite algo para pesquisar')
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .trim(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
});

// Tipos inferidos
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type SearchFormData = z.infer<typeof SearchSchema>;

// Hook personalizado para validação Zod
export function useZodValidation<T extends z.ZodSchema>(schema: T) {
  const validate = (data: unknown): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Erro de validação' } };
    }
  };

  return { validate };
}
