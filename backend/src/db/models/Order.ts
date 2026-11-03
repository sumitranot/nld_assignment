import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
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

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  declare id: number;
  declare userId: number;
  declare orderNumber: string;
  declare status: OrderStatus;
  declare totalAmount: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare items?: OrderItem[];
  declare user?: User;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total_amount',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    underscored: true,
    timestamps: true,
  },
);

