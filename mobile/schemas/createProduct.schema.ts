import { z } from 'zod';
import { ImagePickerAsset } from 'expo-image-picker';

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
    .min(3, 'A categoria deve ter pelo menos 3 caracteres'),
  image: z.custom<ImagePickerAsset>((val) => {
    return val && typeof val === 'object' && 'uri' in val;
  }, 'Selecione uma imagem')
});

export type CreateProductFormData = z.infer<typeof CreateProductSchema>;
