import { z } from 'zod';
import { useZodValidation } from './auth.schema';

// Schema para formulário (strings)
export const CreateProductFormSchema = z.object({
  titulo: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  preco: z.string()
    .min(1, 'O preço é obrigatório')
    .refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num > 0;
    }, 'Digite um preço válido'),
  categoria: z.string()
    .min(1, 'Selecione uma categoria')
    .refine((val) => ['Casual', 'Social', 'Esportivo'].includes(val), 'Categoria inválida'),
});

// Schema para validação final (com tipos corretos)
export const CreateProductSchema = z.object({
  titulo: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  preco: z.number()
    .positive('O preço deve ser maior que zero')
    .min(1, 'O preço mínimo é R$ 1,00')
    .max(100000, 'O preço máximo é R$ 100.000,00'),
  categoria: z.string()
    .min(1, 'Selecione uma categoria')
    .refine((val) => ['Casual', 'Social', 'Esportivo'].includes(val), 'Categoria inválida'),
  image: z.object({
    uri: z.string().min(1, 'Selecione uma imagem')
  }).nullable().refine((val) => val !== null, 'Selecione uma imagem')
});

export type CreateProductFormData = z.infer<typeof CreateProductFormSchema>;
export type CreateProductData = z.infer<typeof CreateProductSchema>;

export { useZodValidation };
