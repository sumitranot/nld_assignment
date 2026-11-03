import { z } from 'zod';

export const createOrderItemSchema = z.object({
  sku: z
    .string({ required_error: 'SKU is required' })
    .min(1, 'SKU cannot be empty')
    .trim()
    .transform((val) => val.toUpperCase()),
  qty: z.coerce
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be strictly greater than 0'),
});

export const createOrderSchema = z.object({
  items: z
    .array(createOrderItemSchema, { required_error: 'Items array is required' })
    .nonempty('Order must contain at least one item'),
});

export const orderQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  userId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Order ID must be a positive integer' }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;

