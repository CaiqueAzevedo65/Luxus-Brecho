import { z } from 'zod';

// Schema base para produtos
export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  brand: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string().url('URL inválida')).optional(),
  rating: z.number().min(0).max(5).optional(),
  stock: z.number().int().nonnegative('Estoque não pode ser negativo'),
  discount: z.number().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

// Schema para criação de produto (sem _id)
export const CreateProductSchema = ProductSchema.omit({ _id: true });

// Schema para atualização de produto (todos os campos opcionais)
export const UpdateProductSchema = ProductSchema.partial().omit({ _id: true });

// Schema para filtros de produto
export const ProductFiltersSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc']).optional()
});

// Schema para resposta da API com paginação
export const ProductResponseSchema = z.object({
  items: z.array(ProductSchema),
  pagination: z.object({
    page: z.number(),
    page_size: z.number(),
    total: z.number()
  })
});

// Tipos inferidos dos schemas
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
