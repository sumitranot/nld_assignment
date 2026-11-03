import { sequelize } from '../sequelize';
import { User } from './User';
import { Product } from './Product';
import { Order } from './Order';
import { OrderItem } from './OrderItem';

// User <-> Order (1:M)
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Order <-> OrderItem (1:M)
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Product <-> OrderItem (1:M)
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

export { sequelize, User, Product, Order, OrderItem };
export * from './User';
export * from './Product';
export * from './Order';
export * from './OrderItem';

