"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../../db/sequelize");
const Product_1 = require("../../db/models/Product");
const AppError_1 = require("../../utils/AppError");
const pagination_1 = require("../../utils/pagination");
class ProductsService {
    static async listProducts(filters) {
        const { page, limit, offset } = (0, pagination_1.parsePagination)(filters);
        const searchKey = (filters.q || filters.search || '').trim();
        let where = {};
        let order = [['id', 'ASC']];
        if (searchKey.length > 0) {
            const searchTerm = `%${searchKey}%`;
            where = {
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.iLike]: searchTerm } },
                    { sku: { [sequelize_1.Op.iLike]: searchTerm } },
                ],
            };
            const escaped = sequelize_2.sequelize.escape(searchKey.toLowerCase());
            const escapedPrefix = sequelize_2.sequelize.escape(searchKey.toLowerCase() + '%');
            order = [
                [
                    sequelize_2.sequelize.literal(`CASE 
            WHEN LOWER("Product"."name") = ${escaped} THEN 1
            WHEN LOWER("Product"."sku") = ${escaped} THEN 2
            WHEN LOWER("Product"."name") LIKE ${escapedPrefix} THEN 3
            WHEN LOWER("Product"."sku") LIKE ${escapedPrefix} THEN 4
            ELSE 5
          END`),
                    'ASC',
                ],
                ['name', 'ASC'],
                ['id', 'ASC'],
            ];
        }
        const { count, rows } = await Product_1.Product.findAndCountAll({
            where,
            limit,
            offset,
            order,
        });
        return {
            data: rows,
            meta: (0, pagination_1.buildPaginationMeta)(count, page, limit),
        };
    }
    static async getProductById(id) {
        const product = await Product_1.Product.findByPk(id);
        if (!product) {
            throw new AppError_1.NotFoundError(`Product with ID ${id} not found`);
        }
        return product;
    }
    static async createProduct(data) {
        const existingSku = await Product_1.Product.findOne({ where: { sku: data.sku } });
        if (existingSku) {
            throw new AppError_1.ConflictError(`Product with SKU '${data.sku}' already exists`);
        }
        return await Product_1.Product.create(data);
    }
    static async updateProduct(id, data) {
        const product = await this.getProductById(id);
        if (data.sku && data.sku !== product.sku) {
            const existingSku = await Product_1.Product.findOne({
                where: {
                    sku: data.sku,
                    id: { [sequelize_1.Op.ne]: id },
                },
            });
            if (existingSku) {
                throw new AppError_1.ConflictError(`Product with SKU '${data.sku}' already exists`);
            }
        }
        await product.update(data);
        return product;
    }
}
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map