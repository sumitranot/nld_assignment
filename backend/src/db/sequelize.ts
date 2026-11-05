import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const databaseUrl = env.DATABASE_URL || env.POSTGRES_URL;

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

