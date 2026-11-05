"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../sequelize");
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    orderNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'order_number',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_amount',
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'orders',
    underscored: true,
    timestamps: true,
});
//# sourceMappingURL=Order.js.map