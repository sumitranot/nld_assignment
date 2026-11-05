import { Request, Response } from 'express';
export declare class OrdersController {
    static create(req: Request, res: Response): Promise<void>;
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static cancel(req: Request, res: Response): Promise<void>;
    static confirm(req: Request, res: Response): Promise<void>;
}
