import { RequestHandler } from 'express';
import { UserRole } from '../db/models/User';
export declare const authorize: (...allowedRoles: UserRole[]) => RequestHandler;
