import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.validators';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const input = req.body as RegisterInput;
    const result = await AuthService.register(input);
    res.status(201).json(result);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const input = req.body as LoginInput;
    const result = await AuthService.login(input);
    res.status(200).json(result);
  }

  static getMe(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    res.status(200).json({ user: req.user.toSafeObject() });
  }
}
