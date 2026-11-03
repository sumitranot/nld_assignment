import { z } from 'zod';
import { toCents, fromCents } from '../../utils/money';

const priceField = z
  .union([z.string(), z.number()])
  .transform((val) => {
    try {
      const cents = toCents(val);
      if (cents < 0) {
        throw new Error();
      }
      return fromCents(cents);
    } catch {
      throw new Error('Invalid price format');
    }
  });

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  q: z.string().trim().optional(),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Product ID must be a positive integer' }),
});

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).min(1).trim(),
  sku: z
    .string({ required_error: 'SKU is required' })
    .min(1)
    .trim()
    .transform((val) => val.toUpperCase()),
  stockQty: z.coerce
    .number({ required_error: 'Stock quantity is required' })
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity cannot be negative'),
  price: priceField,
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    sku: z
      .string()
      .min(1)
      .trim()
      .transform((val) => val.toUpperCase())
      .optional(),
    stockQty: z.coerce
      .number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity cannot be negative')
      .optional(),
    price: priceField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProductIdParamInput = z.infer<typeof productIdParamSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

