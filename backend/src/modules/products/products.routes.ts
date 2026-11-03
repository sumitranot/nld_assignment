import { Router } from 'express';
import { ProductsController } from './products.controller';
import {
  createProductSchema,
  productIdParamSchema,
  productQuerySchema,
  updateProductSchema,
} from './products.validators';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Products list available for all authenticated users
router.get(
  '/',
  asyncHandler(authenticate),
  validate({ query: productQuerySchema }),
  asyncHandler((req, res) => ProductsController.list(req, res)),
);

router.get(
  '/:id',
  asyncHandler(authenticate),
  validate({ params: productIdParamSchema }),
  asyncHandler((req, res) => ProductsController.getById(req, res)),
);

// Admin-only endpoints for managing products
router.post(
  '/',
  asyncHandler(authenticate),
  authorize('ADMIN'),
  validate({ body: createProductSchema }),
  asyncHandler((req, res) => ProductsController.create(req, res)),
);

router.put(
  '/:id',
  asyncHandler(authenticate),
  authorize('ADMIN'),
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  asyncHandler((req, res) => ProductsController.update(req, res)),
);

export const productsRoutes = router;

