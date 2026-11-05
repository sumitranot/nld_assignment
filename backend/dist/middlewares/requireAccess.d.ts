import { RequestHandler } from 'express';
import { UserAccess } from '../db/models/User';
export declare const requireAccess: (requiredAccess: UserAccess) => RequestHandler;
