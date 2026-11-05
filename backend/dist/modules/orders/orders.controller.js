"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const orders_service_1 = require("./orders.service");
class OrdersController {
    static async create(req, res) {
        const input = req.body;
        const order = await orders_service_1.OrdersService.createOrder(req.user.id, input);
        res.status(201).json(order);
    }
    static async list(req, res) {
        const query = req.query;
        const result = await orders_service_1.OrdersService.listOrders(req.user, query);
        res.status(200).json(result);
    }
    static async getById(req, res) {
        const id = Number(req.params.id);
        const order = await orders_service_1.OrdersService.getOrderById(req.user, id);
        res.status(200).json(order);
    }
    static async cancel(req, res) {
        const id = Number(req.params.id);
        const order = await orders_service_1.OrdersService.cancelOrder(req.user, id);
        res.status(200).json(order);
    }
    static async confirm(req, res) {
        const id = Number(req.params.id);
        const order = await orders_service_1.OrdersService.confirmOrder(id);
        res.status(200).json(order);
    }
}
exports.OrdersController = OrdersController;
//# sourceMappingURL=orders.controller.js.map