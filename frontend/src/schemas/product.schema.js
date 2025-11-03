import { z } from 'zod';

// Validador de categoria (mesmas categorias do mobile)
const categoryValidator = z.enum(['Casual', 'Social', 'Esportivo'], {
  errorMap: () => ({ message: 'Selecione uma categoria válida' })
});

// Schema para formulário de criação de produto (strings para inputs)
export const CreateProductFormSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim(),
  preco: z
    .string()
    .min(1, 'O preço é obrigatório')
    .refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num > 0;
    }, 'Digite um preço válido maior que zero'),
  categoria: categoryValidator,
});

// Schema para validação final (com tipos corretos para envio à API)
export const CreateProductSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim(),
  preco: z
    .number()
    .positive('O preço deve ser maior que zero')
    .min(1, 'O preço mínimo é R$ 1,00')
    .max(100000, 'O preço máximo é R$ 100.000,00'),
  categoria: categoryValidator,
  imagem: z
    .instanceof(File, { message: 'Selecione uma imagem' })
    .refine((file) => file.size <= 5000000, 'A imagem deve ter no máximo 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Formato de imagem inválido. Use JPEG, PNG ou WebP'
    ),
});

// Schema para edição de produto (todos os campos opcionais exceto ID)
export const EditProductSchema = z.object({
  id: z.number(),
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  preco: z
    .number()
    .positive('O preço deve ser maior que zero')
    .min(1, 'O preço mínimo é R$ 1,00')
    .max(100000, 'O preço máximo é R$ 100.000,00')
    .optional(),
  categoria: categoryValidator.optional(),
  ativo: z.boolean().optional(),
  destaque: z.boolean().optional(),
});

// Opções para select de categorias
export const categoryOptions = [
  { label: 'Casual', value: 'Casual' },
  { label: 'Social', value: 'Social' },
  { label: 'Esportivo', value: 'Esportivo' },
];

// Hook personalizado para validação com Zod (reutilizado do auth.schema.js)
export const useZodValidation = (schema) => {
  const validate = (data) => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: { general: 'Erro de validação' } };
    }
  };

  return { validate };
};
