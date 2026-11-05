import { apiClient } from './client';
import { Order, OrderListItem, OrderStatus, PaginatedResponse } from './types';

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

  const response = await apiClient.get<PaginatedResponse<OrderListItem>>('/orders', {
    params: cleanParams,
  });
  return response.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await apiClient.get<Order | { data: Order }>(`/orders/${id}`);
  const data = response.data;
  return data && typeof data === 'object' && 'data' in data && data.data
    ? (data.data as Order)
    : (data as Order);
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<Order> => {
  const response = await apiClient.post<Order | { data: Order }>('/orders', payload);
  const data = response.data;
  return data && typeof data === 'object' && 'data' in data && data.data
    ? (data.data as Order)
    : (data as Order);
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.post<Order | { data: Order }>(`/orders/${id}/cancel`);
  const data = response.data;
  return data && typeof data === 'object' && 'data' in data && data.data
    ? (data.data as Order)
    : (data as Order);
};

export const confirmOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.post<Order | { data: Order }>(`/orders/${id}/confirm`);
  const data = response.data;
  return data && typeof data === 'object' && 'data' in data && data.data
    ? (data.data as Order)
    : (data as Order);
};
