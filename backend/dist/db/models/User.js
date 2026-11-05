"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../sequelize");
class User extends sequelize_1.Model {
    toSafeObject() {
        return {
            id: this.id,
            email: this.email,
            role: this.role,
            access: this.access,
            createdAt: this.createdAt,
        };
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'password_hash',
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
    },
    access: {
        type: sequelize_1.DataTypes.ENUM('VIEW', 'CREATE'),
        allowNull: true,
        defaultValue: 'VIEW',
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
});
//# sourceMappingURL=User.js.map