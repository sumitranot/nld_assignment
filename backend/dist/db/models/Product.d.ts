import { Model, Optional } from 'sequelize';
export interface ProductAttributes {
    id: number;
    name: string;
    sku: string;
    stockQty: number;
    price: string;
    imageUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export type ProductCreationAttributes = Optional<ProductAttributes, 'id' | 'stockQty' | 'imageUrl' | 'createdAt' | 'updatedAt'>;
export declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    id: number;
    name: string;
    sku: string;
    stockQty: number;
    price: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
