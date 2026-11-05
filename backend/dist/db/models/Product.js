"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../sequelize");
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    sku: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    stockQty: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'stock_qty',
        validate: {
            min: 0,
        },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'image_url',
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'products',
    underscored: true,
    timestamps: true,
});
//# sourceMappingURL=Product.js.map