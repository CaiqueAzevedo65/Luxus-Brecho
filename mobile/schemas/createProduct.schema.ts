import { z } from 'zod';
import { useZodValidation } from './auth.schema';
import { ProductCategory } from '../types/product';

// Validador de categoria
const categoryValidator = z.enum(['Casual', 'Social', 'Esportivo'] as const);

// Schema para formulário (strings)
export const CreateProductFormSchema = z.object({
  titulo: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim(),
  preco: z.string()
    .min(1, 'O preço é obrigatório')
    .refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num > 0;
    }, 'Digite um preço válido maior que zero'),
  categoria: categoryValidator,
});

// Schema para validação final (com tipos corretos)
export const CreateProductSchema = z.object({
  titulo: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim(),
  preco: z.number()
    .positive('O preço deve ser maior que zero')
    .min(1, 'O preço mínimo é R$ 1,00')
    .max(100000, 'O preço máximo é R$ 100.000,00'),
  categoria: categoryValidator,
  image: z.object({
    uri: z.string().min(1, 'URI da imagem é obrigatória')
  }).refine((val) => val !== null, 'Selecione uma imagem')
});

// Schema para edição de produto (todos os campos opcionais exceto ID)
export const EditProductSchema = z.object({
  id: z.number(),
  titulo: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  preco: z.number()
    .positive('O preço deve ser maior que zero')
    .min(1, 'O preço mínimo é R$ 1,00')
    .max(100000, 'O preço máximo é R$ 100.000,00')
    .optional(),
  categoria: categoryValidator.optional(),
  disponivel: z.boolean().optional(),
});

// Tipos inferidos
export type CreateProductFormData = z.infer<typeof CreateProductFormSchema>;
export type CreateProductData = z.infer<typeof CreateProductSchema>;
export type EditProductData = z.infer<typeof EditProductSchema>;

// Opções para select de categorias
export const categoryOptions = [
  { label: 'Casual', value: 'Casual' as ProductCategory },
  { label: 'Social', value: 'Social' as ProductCategory },
  { label: 'Esportivo', value: 'Esportivo' as ProductCategory },
];

export { useZodValidation };
