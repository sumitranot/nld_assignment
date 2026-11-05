import { z } from 'zod';
export declare const createOrderItemSchema: z.ZodObject<{
    sku: z.ZodEffects<z.ZodString, string, string>;
    qty: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    sku: string;
    qty: number;
}, {
    sku: string;
    qty: number;
}>;
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        sku: z.ZodEffects<z.ZodString, string, string>;
        qty: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sku: string;
        qty: number;
    }, {
        sku: string;
        qty: number;
    }>, "atleastone">;
}, "strip", z.ZodTypeAny, {
    items: [{
        sku: string;
        qty: number;
    }, ...{
        sku: string;
        qty: number;
    }[]];
}, {
    items: [{
        sku: string;
        qty: number;
    }, ...{
        sku: string;
        qty: number;
    }[]];
}>;
export declare const orderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED"]>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodNumber>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | undefined;
    userId?: number | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    userId?: number | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
export declare const orderIdParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;
