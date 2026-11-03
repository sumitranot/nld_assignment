import { Router } from 'express';
import { AuthController } from './auth.controller';
import { registerSchema, loginSchema } from './auth.validators';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler((req, res) => AuthController.register(req, res)),
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler((req, res) => AuthController.login(req, res)),
);

router.get(
  '/me',
  asyncHandler(authenticate),
  (req, res) => AuthController.getMe(req, res),
);

export const authRoutes = router;
