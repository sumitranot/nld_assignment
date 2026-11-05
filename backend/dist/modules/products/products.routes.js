"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRoutes = void 0;
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const products_validators_1 = require("./products.validators");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const validate_1 = require("../../middlewares/validate");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Products list available for all authenticated users
router.get('/', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, validate_1.validate)({ query: products_validators_1.productQuerySchema }), (0, asyncHandler_1.asyncHandler)((req, res) => products_controller_1.ProductsController.list(req, res)));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, validate_1.validate)({ params: products_validators_1.productIdParamSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => products_controller_1.ProductsController.getById(req, res)));
// Admin-only endpoints for managing products
router.post('/', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, authorize_1.authorize)('ADMIN'), (0, validate_1.validate)({ body: products_validators_1.createProductSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => products_controller_1.ProductsController.create(req, res)));
router.put('/:id', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (0, authorize_1.authorize)('ADMIN'), (0, validate_1.validate)({ params: products_validators_1.productIdParamSchema, body: products_validators_1.updateProductSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => products_controller_1.ProductsController.update(req, res)));
exports.productsRoutes = router;
//# sourceMappingURL=products.routes.js.map