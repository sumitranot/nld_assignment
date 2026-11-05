"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderIdParamSchema = exports.orderQuerySchema = exports.createOrderSchema = exports.createOrderItemSchema = void 0;
const zod_1 = require("zod");
exports.createOrderItemSchema = zod_1.z.object({
    sku: zod_1.z
        .string({ required_error: 'SKU is required' })
        .min(1, 'SKU cannot be empty')
        .trim()
        .transform((val) => val.toUpperCase()),
    qty: zod_1.z.coerce
        .number({ required_error: 'Quantity is required' })
        .int('Quantity must be an integer')
        .positive('Quantity must be strictly greater than 0'),
});
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(exports.createOrderItemSchema, { required_error: 'Items array is required' })
        .nonempty('Order must contain at least one item'),
});
exports.orderQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
    from: zod_1.z.string().trim().optional(),
    to: zod_1.z.string().trim().optional(),
    userId: zod_1.z.coerce.number().int().positive().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
exports.orderIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive({ message: 'Order ID must be a positive integer' }),
});
//# sourceMappingURL=orders.validators.js.map