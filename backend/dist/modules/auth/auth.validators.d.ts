import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    role: z.ZodEnum<["ADMIN", "USER"]>;
    access: z.ZodDefault<z.ZodOptional<z.ZodEnum<["VIEW", "CREATE"]>>>;
}, "strip", z.ZodTypeAny, {
    role: "ADMIN" | "USER";
    access: "VIEW" | "CREATE";
    email: string;
    password: string;
}, {
    role: "ADMIN" | "USER";
    email: string;
    password: string;
    access?: "VIEW" | "CREATE" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
