import { Model, Optional } from 'sequelize';
import type { OrderItem } from './OrderItem';
import type { User } from './User';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export interface OrderAttributes {
    id: number;
    userId: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
export declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    id: number;
    userId: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: string;
    createdAt: Date;
    updatedAt: Date;
    items?: OrderItem[];
    user?: User;
}
