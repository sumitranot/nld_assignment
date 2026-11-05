import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_Pu0jqMhtE6li@ep-winter-lake-bb2v4imt-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require';

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.STORAGE_URL ||
  env.DATABASE_URL ||
  env.POSTGRES_URL ||
  env.STORAGE_URL ||
  (process.env.VERCEL ? NEON_DEFAULT_URL : undefined);

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging:
        env.NODE_ENV === 'development'
          ? (msg: string) => logger.debug({ sql: msg }, 'Sequelize query')
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
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      dialect: 'postgres',
      logging:
        env.NODE_ENV === 'development'
          ? (msg: string) => logger.debug({ sql: msg }, 'Sequelize query')
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
