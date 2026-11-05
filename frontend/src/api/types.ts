import { z } from 'zod';

export type UserRole = 'ADMIN' | 'USER';
export type UserAccess = 'VIEW' | 'CREATE';

export const userRoleSchema = z.enum(['ADMIN', 'USER']);
export const userAccessSchema = z.enum(['VIEW', 'CREATE']).nullable();

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: userRoleSchema,
  access: userAccessSchema.optional(),
  createdAt: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  stockQty: z.number(),
  price: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Product = z.infer<typeof productSchema>;

export const orderStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  productId: z.number(),
  quantity: z.number(),
  unitPrice: z.string(),
  product: productSchema.optional(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  orderNumber: z.string(),
  status: orderStatusSchema,
  totalAmount: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  user: z
    .object({
      id: z.number(),
      email: z.string(),
    })
    .optional(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderListItemSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  status: orderStatusSchema,
  totalAmount: z.string(),
  createdAt: z.string(),
  itemCount: z.number(),
  lineCount: z.number(),
  userId: z.number(),
  user: z
    .object({
      id: z.number(),
      email: z.string(),
    })
    .optional(),
});
export type OrderListItem = z.infer<typeof orderListItemSchema>;

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface StockConflictItem {
  sku: string;
  requested: number;
  available: number;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  details?: {
    insufficientItems?: StockConflictItem[];
    [key: string]: unknown;
  };
  status?: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
