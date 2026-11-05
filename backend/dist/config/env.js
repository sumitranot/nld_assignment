"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DATABASE_URL: zod_1.z.string().optional(),
    POSTGRES_URL: zod_1.z.string().optional(),
    DATABASE_URL_UNPOOLED: zod_1.z.string().optional(),
    STORAGE_URL: zod_1.z.string().optional(),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.coerce.number().int().positive().default(5432),
    DB_NAME: zod_1.z.string().default('nld_db'),
    DB_USER: zod_1.z.string().default('nld_user'),
    DB_PASSWORD: zod_1.z.string().default('nld_password'),
    JWT_SECRET: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (!val || val.length < 32) {
            return 'nld-super-secure-production-jwt-secret-key-32chars';
        }
        return val;
    }),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    ALLOW_ADMIN_REGISTRATION: zod_1.z
        .enum(['true', 'false'])
        .default('false')
        .transform((v) => v === 'true'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(500),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    /* eslint-disable no-console */
    console.warn('⚠️ Environment variables warning:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    /* eslint-enable no-console */
}
// Fallback safe defaults if any parse issue occurs
exports.env = parsed.success
    ? parsed.data
    : {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
        STORAGE_URL: process.env.STORAGE_URL,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: Number(process.env.DB_PORT) || 5432,
        DB_NAME: process.env.DB_NAME || 'nld_db',
        DB_USER: process.env.DB_USER || 'nld_user',
        DB_PASSWORD: process.env.DB_PASSWORD || 'nld_password',
        JWT_SECRET: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
            ? process.env.JWT_SECRET
            : 'nld-super-secure-production-jwt-secret-key-32chars',
        JWT_EXPIRES_IN: '24h',
        CORS_ORIGIN: '*',
        ALLOW_ADMIN_REGISTRATION: false,
        RATE_LIMIT_WINDOW_MS: 900_000,
        RATE_LIMIT_MAX: 500,
    };
//# sourceMappingURL=env.js.map