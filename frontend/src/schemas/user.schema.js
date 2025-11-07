import { z } from 'zod';

// Schema para endereço
export const AddressSchema = z.object({
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Use o formato 00000-000'),
  rua: z
    .string()
    .min(3, 'Rua deve ter pelo menos 3 caracteres')
    .max(200, 'Rua deve ter no máximo 200 caracteres'),
  numero: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número deve ter no máximo 10 caracteres'),
  complemento: z
    .string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  bairro: z
    .string()
    .min(2, 'Bairro deve ter pelo menos 2 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  cidade: z
    .string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (ex: SP)')
    .regex(/^[A-Z]{2}$/, 'Estado deve conter apenas letras maiúsculas'),
});

// Schema para mudança de senha
export const ChangePasswordSchema = z.object({
  senhaAtual: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  novaSenha: z
    .string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
  confirmarNovaSenha: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.novaSenha === data.confirmarNovaSenha, {
  message: 'Senhas não coincidem',
  path: ['confirmarNovaSenha'],
});

// Schema para mudança de email
export const ChangeEmailSchema = z.object({
  novoEmail: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória para confirmar a mudança'),
});
