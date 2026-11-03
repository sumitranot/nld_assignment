export type UserRole = 'ADMIN' | 'USER';
export type UserAccess = 'VIEW' | 'CREATE';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  access: UserAccess | null;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  stockQty: number;
  price: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  user?: {
    id: number;
    email: string;
  };
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  itemCount: number;
  lineCount: number;
  userId: number;
  user?: {
    id: number;
    email: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

