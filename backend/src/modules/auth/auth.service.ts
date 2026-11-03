import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../db/models/User';
import { env } from '../../config/env';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../utils/AppError';
import { AuthResponse, JWTPayload, LoginDTO, RegisterDTO } from './auth.dto';

const BCRYPT_SALT_ROUNDS = 12;

export class AuthService {
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      access: user.role === 'ADMIN' ? null : user.access,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static async register(input: RegisterDTO): Promise<AuthResponse> {
    const normalizedEmail = input.email.toLowerCase().trim();

    if (input.role === 'ADMIN' && !env.ALLOW_ADMIN_REGISTRATION) {
      throw new ForbiddenError(
        'Self-registration for ADMIN role is disabled in this environment',
      );
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: input.role,
      access: input.role === 'ADMIN' ? null : (input.access ?? 'VIEW'),
    });

    const token = this.generateToken(user);

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  static async login(input: LoginDTO): Promise<AuthResponse> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      // Security standard: generic invalid credentials message prevents user enumeration
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: user.toSafeObject(),
      token,
    };
  }
}
