"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const products_service_1 = require("./products.service");
class ProductsController {
    static async list(req, res) {
        const query = req.query;
        const result = await products_service_1.ProductsService.listProducts(query);
        res.status(200).json(result);
    }
    static async getById(req, res) {
        const id = Number(req.params.id);
        const product = await products_service_1.ProductsService.getProductById(id);
        res.status(200).json(product);
    }
    static async create(req, res) {
        const body = req.body;
        const product = await products_service_1.ProductsService.createProduct(body);
        res.status(201).json(product);
    }
    static async update(req, res) {
        const id = Number(req.params.id);
        const body = req.body;
        const product = await products_service_1.ProductsService.updateProduct(id, body);
        res.status(200).json(product);
    }
}
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map