"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const NEON_DEFAULT_URL = 'postgresql://neondb_owner:npg_Pu0jqMhtE6li@ep-winter-lake-bb2v4imt-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require';
const databaseUrl = process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.STORAGE_URL ||
    env_1.env.DATABASE_URL ||
    env_1.env.POSTGRES_URL ||
    env_1.env.STORAGE_URL ||
    (process.env.VERCEL ? NEON_DEFAULT_URL : undefined);
exports.sequelize = databaseUrl
    ? new sequelize_1.Sequelize(databaseUrl, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: env_1.env.NODE_ENV === 'development'
            ? (msg) => logger_1.logger.debug({ sql: msg }, 'Sequelize query')
            : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: true,
            timestamps: true,
        },
    })
    : new sequelize_1.Sequelize(env_1.env.DB_NAME, env_1.env.DB_USER, env_1.env.DB_PASSWORD, {
        host: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        dialect: 'postgres',
        logging: env_1.env.NODE_ENV === 'development'
            ? (msg) => logger_1.logger.debug({ sql: msg }, 'Sequelize query')
            : false,
        pool: {
            max: 20,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            underscored: true,
            timestamps: true,
        },
    });
//# sourceMappingURL=sequelize.js.map