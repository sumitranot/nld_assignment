"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.productIdParamSchema = exports.productQuerySchema = void 0;
const zod_1 = require("zod");
const money_1 = require("../../utils/money");
const priceField = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number()])
    .transform((val) => {
    try {
        const cents = (0, money_1.toCents)(val);
        if (cents < 0) {
            throw new Error();
        }
        return (0, money_1.fromCents)(cents);
    }
    catch {
        throw new Error('Invalid price format');
    }
});
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
    q: zod_1.z.string().trim().optional(),
    search: zod_1.z.string().trim().optional(),
});
exports.productIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive({ message: 'Product ID must be a positive integer' }),
});
const imageUrlField = zod_1.z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null));
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: 'Product name is required' }).min(1).trim(),
    sku: zod_1.z
        .string({ required_error: 'SKU is required' })
        .min(1)
        .trim()
        .transform((val) => val.toUpperCase()),
    stockQty: zod_1.z.coerce
        .number({ required_error: 'Stock quantity is required' })
        .int('Stock quantity must be an integer')
        .min(0, 'Stock quantity cannot be negative'),
    price: priceField,
    imageUrl: imageUrlField,
});
exports.updateProductSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).trim().optional(),
    sku: zod_1.z
        .string()
        .min(1)
        .trim()
        .transform((val) => val.toUpperCase())
        .optional(),
    stockQty: zod_1.z.coerce
        .number()
        .int('Stock quantity must be an integer')
        .min(0, 'Stock quantity cannot be negative')
        .optional(),
    price: priceField.optional(),
    imageUrl: imageUrlField,
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
});
//# sourceMappingURL=products.validators.js.map