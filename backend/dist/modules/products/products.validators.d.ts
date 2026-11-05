import { z } from 'zod';
export declare const productQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    q: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    search?: string | undefined;
    q?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    q?: string | undefined;
}>;
export declare const productIdParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodEffects<z.ZodString, string, string>;
    stockQty: z.ZodNumber;
    price: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, string, string | number>;
    imageUrl: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null, string | null | undefined>;
}, "strip", z.ZodTypeAny, {
    stockQty: number;
    imageUrl: string | null;
    name: string;
    sku: string;
    price: string;
}, {
    stockQty: number;
    name: string;
    sku: string;
    price: string | number;
    imageUrl?: string | null | undefined;
}>;
export declare const updateProductSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    stockQty: z.ZodOptional<z.ZodNumber>;
    price: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, string, string | number>>;
    imageUrl: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null, string | null | undefined>;
}, "strip", z.ZodTypeAny, {
    imageUrl: string | null;
    stockQty?: number | undefined;
    name?: string | undefined;
    sku?: string | undefined;
    price?: string | undefined;
}, {
    stockQty?: number | undefined;
    imageUrl?: string | null | undefined;
    name?: string | undefined;
    sku?: string | undefined;
    price?: string | number | undefined;
}>, {
    imageUrl: string | null;
    stockQty?: number | undefined;
    name?: string | undefined;
    sku?: string | undefined;
    price?: string | undefined;
}, {
    stockQty?: number | undefined;
    imageUrl?: string | null | undefined;
    name?: string | undefined;
    sku?: string | undefined;
    price?: string | number | undefined;
}>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProductIdParamInput = z.infer<typeof productIdParamSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
