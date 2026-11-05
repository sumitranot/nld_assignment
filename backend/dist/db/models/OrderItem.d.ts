import { Model, Optional } from 'sequelize';
import type { Order } from './Order';
import type { Product } from './Product';
export interface OrderItemAttributes {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type OrderItemCreationAttributes = Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'>;
export declare class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    createdAt: Date;
    updatedAt: Date;
    order?: Order;
    product?: Product;
}
