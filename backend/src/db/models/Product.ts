import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductAttributes {
  id: number;
  name: string;
  sku: string;
  stockQty: number;
  price: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'stockQty' | 'createdAt' | 'updatedAt'
>;

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare id: number;
  declare name: string;
  declare sku: string;
  declare stockQty: number;
  declare price: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stockQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'stock_qty',
      validate: {
        min: 0,
      },
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'products',
    underscored: true,
    timestamps: true,
  },
);

