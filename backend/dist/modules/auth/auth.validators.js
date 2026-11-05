"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .transform((val) => val.toLowerCase().trim()),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be minimum 6 characters'),
    role: zod_1.z.enum(['ADMIN', 'USER'], {
        required_error: 'Role must be either ADMIN or USER',
    }),
    access: zod_1.z.enum(['VIEW', 'CREATE']).optional().default('VIEW'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .transform((val) => val.toLowerCase().trim()),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});
//# sourceMappingURL=auth.validators.js.map