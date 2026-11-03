import { User } from '../db/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

