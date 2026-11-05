"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../db/models/User");
const env_1 = require("../../config/env");
const AppError_1 = require("../../utils/AppError");
const BCRYPT_SALT_ROUNDS = 12;
class AuthService {
    static generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            access: user.role === 'ADMIN' ? null : user.access,
        };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
    }
    static async register(input) {
        const normalizedEmail = input.email.toLowerCase().trim();
        if (input.role === 'ADMIN' && !env_1.env.ALLOW_ADMIN_REGISTRATION) {
            throw new AppError_1.ForbiddenError('Self-registration for ADMIN role is disabled in this environment');
        }
        const existingUser = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new AppError_1.ConflictError('Email is already registered');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, BCRYPT_SALT_ROUNDS);
        const user = await User_1.User.create({
            email: normalizedEmail,
            passwordHash,
            role: input.role,
            access: input.role === 'ADMIN' ? null : (input.access ?? 'VIEW'),
        });
        const token = this.generateToken(user);
        return {
            user: user.toSafeObject(),
            token,
        };
    }
    static async login(input) {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            // Security standard: generic invalid credentials message prevents user enumeration
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        }
        const isPasswordValid = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        }
        const token = this.generateToken(user);
        return {
            user: user.toSafeObject(),
            token,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map