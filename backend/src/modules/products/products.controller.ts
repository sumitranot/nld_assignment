import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDTO } from './products.dto';
import { ProductQueryInput, UpdateProductInput } from './products.validators';

export class ProductsController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ProductQueryInput;
    const result = await ProductsService.listProducts(query);
    res.status(200).json(result);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const product = await ProductsService.getProductById(id);
    res.status(200).json(product);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const body = req.body as unknown as CreateProductDTO;
    const product = await ProductsService.createProduct(body);
    res.status(201).json(product);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const body = req.body as UpdateProductInput;
    const product = await ProductsService.updateProduct(id, body);
    res.status(200).json(product);
  }
}

