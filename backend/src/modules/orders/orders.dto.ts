import { OrderStatus } from '../../db/models/Order';

export interface OrderItemInputDTO {
  sku: string;
  qty: number;
}

export interface CreateOrderDTO {
  items: OrderItemInputDTO[];
}

export interface OrderQueryFilters {
  status?: OrderStatus;
  from?: string;
  to?: string;
  userId?: number;
  page?: number;
  limit?: number;
}

export interface OrderListItemDTO {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: Date;
  itemCount: number;
  lineCount: number;
  userId: number;
  user?: {
    id: number;
    email: string;
  };
}

