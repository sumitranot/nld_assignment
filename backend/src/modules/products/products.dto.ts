export interface CreateProductDTO {
  name: string;
  sku: string;
  stockQty: number;
  price: string;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  stockQty?: number;
  price?: string;
}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  q?: string;
}

