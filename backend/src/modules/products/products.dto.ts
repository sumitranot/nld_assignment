export interface CreateProductDTO {
  name: string;
  sku: string;
  stockQty: number;
  price: string;
  imageUrl?: string | null;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  stockQty?: number;
  price?: string;
  imageUrl?: string | null;
}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
}

