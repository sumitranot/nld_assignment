import { Product } from '../../db/models/Product';
import { PaginatedResult } from '../../utils/pagination';
import { CreateProductDTO, ProductQueryFilters, UpdateProductDTO } from './products.dto';
export declare class ProductsService {
    static listProducts(filters: ProductQueryFilters): Promise<PaginatedResult<Product>>;
    static getProductById(id: number): Promise<Product>;
    static createProduct(data: CreateProductDTO): Promise<Product>;
    static updateProduct(id: number, data: UpdateProductDTO): Promise<Product>;
}
