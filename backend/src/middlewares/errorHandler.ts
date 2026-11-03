import { Request, Response, NextFunction } from 'express';
import {
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
  ForeignKeyConstraintError,
  DatabaseError,
} from 'sequelize';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction,
): void => {
  // 1. Handled custom AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, `[AppError ${err.errorCode}]: ${err.message}`);
    } else {
      logger.warn({ err, details: err.details }, `[AppError ${err.errorCode}]: ${err.message}`);
    }

    res.status(err.statusCode).json({
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // 2. Zod validation error
  if (err instanceof ZodError) {
    const formatted = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    logger.warn({ details: formatted }, '[ZodValidationError]');

    res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request data',
        details: formatted,
      },
    });
    return;
  }

  // 3. Sequelize Unique Constraint Error (e.g. duplicate email, sku, or order_number)
  if (err instanceof UniqueConstraintError) {
    const conflictFields = err.errors.map((item) => ({
      field: item.path ?? 'unknown',
      message: item.message,
    }));

    logger.warn({ conflictFields }, '[SequelizeUniqueConstraintError]');

    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with this identifier already exists',
        details: conflictFields,
      },
    });
    return;
  }

  // 4. Sequelize Validation Error
  if (err instanceof SequelizeValidationError) {
    const validationDetails = err.errors.map((item) => ({
      field: item.path ?? 'unknown',
      message: item.message,
    }));

    logger.warn({ validationDetails }, '[SequelizeValidationError]');

    res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: validationDetails,
      },
    });
    return;
  }

  // 5. Sequelize Foreign Key Constraint Error
  if (err instanceof ForeignKeyConstraintError) {
    logger.warn({ table: err.table, value: err.value }, '[SequelizeForeignKeyConstraintError]');

    res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Referenced foreign key resource does not exist',
      },
    });
    return;
  }

  // 6. Sequelize Database Error (e.g. Check constraints)
  if (err instanceof DatabaseError) {
    const originalMessage = String(err.message);

    if (originalMessage.includes('check_products_stock_qty_non_negative')) {
      logger.warn({ err }, '[DatabaseCheckConstraintViolation: stock_qty >= 0]');
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Insufficient stock: quantity cannot be negative',
        },
      });
      return;
    }

    if (originalMessage.includes('check_order_items_quantity_positive')) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Order item quantity must be strictly greater than 0',
        },
      });
      return;
    }
  }

  // 7. Unhandled / Internal Server Error
  logger.error({ err }, '[UnhandledServerError]');

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred. Please try again later.'
          : err.message || 'Internal server error',
    },
  });
};

