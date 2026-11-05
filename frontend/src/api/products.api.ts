import { apiClient } from './client';
import { PaginatedResponse, Product } from './types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  stockQty: number;
  price: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  stockQty?: number;
  price?: string;
}

export const getProducts = async (
  params?: GetProductsParams,
): Promise<PaginatedResponse<Product>> => {
  const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      search: params?.search ? params.search.trim() : undefined,
    },
  });
  return response.data;
};

export const createProduct = async (
  data: CreateProductInput,
): Promise<Product> => {
  const response = await apiClient.post<Product | { data: Product }>('/products', data);
  const respData = response.data;
  return respData && typeof respData === 'object' && 'data' in respData && respData.data
    ? (respData.data as Product)
    : (respData as Product);
};

export const updateProduct = async (
  id: number,
  data: UpdateProductInput,
): Promise<Product> => {
  const response = await apiClient.put<Product | { data: Product }>(`/products/${id}`, data);
  const respData = response.data;
  return respData && typeof respData === 'object' && 'data' in respData && respData.data
    ? (respData.data as Product)
    : (respData as Product);
};

