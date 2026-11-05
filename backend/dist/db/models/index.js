"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = exports.Product = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("../sequelize");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return sequelize_1.sequelize; } });
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Product_1 = require("./Product");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return Product_1.Product; } });
const Order_1 = require("./Order");
Object.defineProperty(exports, "Order", { enumerable: true, get: function () { return Order_1.Order; } });
const OrderItem_1 = require("./OrderItem");
Object.defineProperty(exports, "OrderItem", { enumerable: true, get: function () { return OrderItem_1.OrderItem; } });
// User <-> Order (1:M)
User_1.User.hasMany(Order_1.Order, {
    foreignKey: 'userId',
    as: 'orders',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});
Order_1.Order.belongsTo(User_1.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});
// Order <-> OrderItem (1:M)
Order_1.Order.hasMany(OrderItem_1.OrderItem, {
    foreignKey: 'orderId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
OrderItem_1.OrderItem.belongsTo(Order_1.Order, {
    foreignKey: 'orderId',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
// Product <-> OrderItem (1:M)
Product_1.Product.hasMany(OrderItem_1.OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});
OrderItem_1.OrderItem.belongsTo(Product_1.Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});
__exportStar(require("./User"), exports);
__exportStar(require("./Product"), exports);
__exportStar(require("./Order"), exports);
__exportStar(require("./OrderItem"), exports);
//# sourceMappingURL=index.js.map