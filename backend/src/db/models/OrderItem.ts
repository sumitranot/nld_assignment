import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
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

export type OrderItemCreationAttributes = Optional<
  OrderItemAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  declare id: number;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare order?: Order;
  declare product?: Product;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'unit_price',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    underscored: true,
    timestamps: true,
  },
);

