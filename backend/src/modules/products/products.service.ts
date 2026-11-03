import { Op, WhereOptions } from 'sequelize';
import { Product } from '../../db/models/Product';
import { ConflictError, NotFoundError } from '../../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginatedResult } from '../../utils/pagination';
import { CreateProductDTO, ProductQueryFilters, UpdateProductDTO } from './products.dto';

export class ProductsService {
  static async listProducts(
    filters: ProductQueryFilters,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, offset } = parsePagination(filters);

    let where: WhereOptions = {};

    if (filters.q && filters.q.trim().length > 0) {
      const searchTerm = `%${filters.q.trim()}%`;
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: searchTerm } },
          { sku: { [Op.iLike]: searchTerm } },
        ],
      };
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return {
      data: rows,
      meta: buildPaginationMeta(count, page, limit),
    };
  }

  static async getProductById(id: number): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return product;
  }

  static async createProduct(data: CreateProductDTO): Promise<Product> {
    const existingSku = await Product.findOne({ where: { sku: data.sku } });
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
    }

    return await Product.create(data);
  }

  static async updateProduct(id: number, data: UpdateProductDTO): Promise<Product> {
    const product = await this.getProductById(id);

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await Product.findOne({
        where: {
          sku: data.sku,
          id: { [Op.ne]: id },
        },
      });
      if (existingSku) {
        throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
      }
    }

    await product.update(data);
    return product;
  }
}
