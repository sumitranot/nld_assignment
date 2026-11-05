import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from './orders.dto';
import { OrderQueryInput } from './orders.validators';

export class OrdersController {
  static async create(req: Request, res: Response): Promise<void> {
    const input = req.body as unknown as CreateOrderDTO;
    const order = await OrdersService.createOrder(req.user!.id, input);
    res.status(201).json(order);
  }

  static async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as OrderQueryInput;
    const result = await OrdersService.listOrders(req.user!, query);
    res.status(200).json(result);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const order = await OrdersService.getOrderById(req.user!, id);
    res.status(200).json(order);
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const order = await OrdersService.cancelOrder(req.user!, id);
    res.status(200).json(order);
  }

  static async confirm(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const order = await OrdersService.confirmOrder(id);
    res.status(200).json(order);
  }
}

