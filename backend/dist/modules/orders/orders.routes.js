"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRoutes = void 0;
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const orders_validators_1 = require("./orders.validators");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const requireAccess_1 = require("../../middlewares/requireAccess");
const validate_1 = require("../../middlewares/validate");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Create order - requires authentication and CREATE access (ADMIN bypasses)
router.post('/', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, requireAccess_1.requireAccess)('CREATE'), (0, validate_1.validate)({ body: orders_validators_1.createOrderSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.create(req, res)));
// List orders with filters, pagination, and SQL item count aggregations
router.get('/', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, validate_1.validate)({ query: orders_validators_1.orderQuerySchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.list(req, res)));
// Retrieve single order details
router.get('/:id', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, validate_1.validate)({ params: orders_validators_1.orderIdParamSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.getById(req, res)));
// Cancel order - requires authentication and CREATE access
router.post('/:id/cancel', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, requireAccess_1.requireAccess)('CREATE'), (0, validate_1.validate)({ params: orders_validators_1.orderIdParamSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.cancel(req, res)));
// Confirm order - admin only (supports both POST and PATCH)
router.post('/:id/confirm', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, authorize_1.authorize)('ADMIN'), (0, validate_1.validate)({ params: orders_validators_1.orderIdParamSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.confirm(req, res)));
router.patch('/:id/confirm', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, authorize_1.authorize)('ADMIN'), (0, validate_1.validate)({ params: orders_validators_1.orderIdParamSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => orders_controller_1.OrdersController.confirm(req, res)));
exports.ordersRoutes = router;
//# sourceMappingURL=orders.routes.js.map