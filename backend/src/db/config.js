require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const baseConfig = dbUrl
  ? {
      url: dbUrl,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    }
  : {
      username: process.env.DB_USER || 'nld_user',
      password: process.env.DB_PASSWORD || 'nld_password',
      database: process.env.DB_NAME || 'nld_db',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
    };

module.exports = {
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME || 'nld_db_test',
    port: Number(process.env.DB_TEST_PORT) || Number(process.env.DB_PORT) || 5432,
    logging: false,
  },
  production: {
    ...baseConfig,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

