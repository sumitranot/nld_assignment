import { apiClient, normalizeApiError } from './client';
import {
  PaginatedResponse,
  Product,
  productSchema,
  paginationMetaSchema,
} from './types';
import { z } from 'zod';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  stockQty: number;
  price: string;
  imageUrl?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  stockQty?: number;
  price?: string;
  imageUrl?: string | null;
}

const paginatedProductResponseSchema = z.object({
  data: z.array(productSchema),
  meta: paginationMetaSchema,
});

export const getProducts = async (
  params?: GetProductsParams,
): Promise<PaginatedResponse<Product>> => {
  const searchTerm = (params?.search || params?.q || '').trim() || undefined;
  try {
    const response = await apiClient.get('/products', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        q: searchTerm,
        search: searchTerm,
      },
    });

    const parsed = paginatedProductResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      return response.data as PaginatedResponse<Product>;
    }
    return parsed.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  try {
    const response = await apiClient.post('/products', data);
    const respData = response.data;
    const raw = respData && typeof respData === 'object' && 'data' in respData ? respData.data : respData;
    const parsed = productSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Product);
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export const updateProduct = async (id: number, data: UpdateProductInput): Promise<Product> => {
  try {
    const response = await apiClient.put(`/products/${id}`, data);
    const respData = response.data;
    const raw = respData && typeof respData === 'object' && 'data' in respData ? respData.data : respData;
    const parsed = productSchema.safeParse(raw);
    return parsed.success ? parsed.data : (raw as Product);
  } catch (err) {
    throw normalizeApiError(err);
  }
};
