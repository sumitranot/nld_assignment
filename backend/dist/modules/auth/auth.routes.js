"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validators_1 = require("./auth.validators");
const validate_1 = require("../../middlewares/validate");
const asyncHandler_1 = require("../../utils/asyncHandler");
const authenticate_1 = require("../../middlewares/authenticate");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_1.authRateLimiter, (0, validate_1.validate)({ body: auth_validators_1.registerSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => auth_controller_1.AuthController.register(req, res)));
router.post('/login', rateLimiter_1.authRateLimiter, (0, validate_1.validate)({ body: auth_validators_1.loginSchema }), (0, asyncHandler_1.asyncHandler)((req, res) => auth_controller_1.AuthController.login(req, res)));
router.get('/me', (0, asyncHandler_1.asyncHandler)(authenticate_1.authenticate), (req, res) => auth_controller_1.AuthController.getMe(req, res));
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map