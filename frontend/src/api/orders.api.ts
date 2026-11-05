import { apiClient, normalizeApiError } from './client';
import {
  Order,
  OrderListItem,
  OrderStatus,
  PaginatedResponse,
  orderSchema,
  orderListItemSchema,
  paginationMetaSchema,
} from './types';
import { z } from 'zod';

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
  userId?: number;
}

export interface CreateOrderPayload {
  items: Array<{
    sku: string;
    qty: number;
  }>;
}

const paginatedOrdersResponseSchema = z.object({
  data: z.array(orderListItemSchema),
  meta: paginationMetaSchema,
});

export const getOrders = async (
  params?: GetOrdersParams,
): Promise<PaginatedResponse<OrderListItem>> => {
  const cleanParams: Record<string, unknown> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  };

  if (params?.status) cleanParams.status = params.status;
  if (params?.from) cleanParams.from = params.from;
  if (params?.to) cleanParams.to = params.to;
  if (params?.userId) cleanParams.userId = params.userId;

  try {
    const response = await apiClient.get('/orders', {
      params: cleanParams,
    });

    const parsed = paginatedOrdersResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      return response.data as PaginatedResponse<OrderListItem>;
    }
    return parsed.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    const data = response.data;
    const raw = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    const parsed = orderSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Order);
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  try {
    const response = await apiClient.post('/orders', payload);
    const data = response.data;
    const raw = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    const parsed = orderSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Order);
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const cancelOrder = async (id: number): Promise<Order> => {
  try {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    const data = response.data;
    const raw = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    const parsed = orderSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Order);
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const confirmOrder = async (id: number): Promise<Order> => {
  try {
    const response = await apiClient.post(`/orders/${id}/confirm`);
    const data = response.data;
    const raw = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    const parsed = orderSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Order);
  } catch (err) {
    throw normalizeApiError(err);
  }
};
