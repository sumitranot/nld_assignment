"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../db/models/User");
const AppError_1 = require("../utils/AppError");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError_1.UnauthorizedError('Missing or malformed Authorization header');
        }
        const token = authHeader.substring(7).trim();
        if (!token) {
            throw new AppError_1.UnauthorizedError('Authentication token missing');
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        }
        catch (jwtErr) {
            if (jwtErr instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new AppError_1.UnauthorizedError('Token expired');
            }
            throw new AppError_1.UnauthorizedError('Invalid authentication token');
        }
        // Security requirement: Roles/access are embedded in the JWT AND re-validated against the DB user on each request
        const user = await User_1.User.findByPk(payload.sub);
        if (!user) {
            throw new AppError_1.UnauthorizedError('User account not found or session revoked');
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map