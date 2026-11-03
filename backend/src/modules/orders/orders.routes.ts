import { Router } from 'express';
import { OrdersController } from './orders.controller';
import {
  createOrderSchema,
  orderIdParamSchema,
  orderQuerySchema,
} from './orders.validators';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { requireAccess } from '../../middlewares/requireAccess';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Create order - requires authentication and CREATE access (ADMIN bypasses)
router.post(
  '/',
  asyncHandler(authenticate),
  requireAccess('CREATE'),
  validate({ body: createOrderSchema }),
  asyncHandler((req, res) => OrdersController.create(req, res)),
);

// List orders with filters, pagination, and SQL item count aggregations
router.get(
  '/',
  asyncHandler(authenticate),
  validate({ query: orderQuerySchema }),
  asyncHandler((req, res) => OrdersController.list(req, res)),
);

// Retrieve single order details
router.get(
  '/:id',
  asyncHandler(authenticate),
  validate({ params: orderIdParamSchema }),
  asyncHandler((req, res) => OrdersController.getById(req, res)),
);

// Cancel order - requires authentication and CREATE access
router.post(
  '/:id/cancel',
  asyncHandler(authenticate),
  requireAccess('CREATE'),
  validate({ params: orderIdParamSchema }),
  asyncHandler((req, res) => OrdersController.cancel(req, res)),
);

// Confirm order - admin only
router.patch(
  '/:id/confirm',
  asyncHandler(authenticate),
  authorize('ADMIN'),
  validate({ params: orderIdParamSchema }),
  asyncHandler((req, res) => OrdersController.confirm(req, res)),
);

export const ordersRoutes = router;

