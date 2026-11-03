import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export type UserRole = 'ADMIN' | 'USER';
export type UserAccess = 'VIEW' | 'CREATE';

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  access: UserAccess | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'access' | 'createdAt' | 'updatedAt'>;

export interface SafeUser {
  id: number;
  email: string;
  role: UserRole;
  access: UserAccess | null;
  createdAt?: Date;
}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare access: UserAccess | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  toSafeObject(): SafeUser {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      access: this.access,
      createdAt: this.createdAt,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
    },
    access: {
      type: DataTypes.ENUM('VIEW', 'CREATE'),
      allowNull: true,
      defaultValue: 'VIEW',
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  },
);

