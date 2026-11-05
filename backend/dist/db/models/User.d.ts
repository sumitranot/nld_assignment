import { Model, Optional } from 'sequelize';
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
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    access: UserAccess | null;
    createdAt: Date;
    updatedAt: Date;
    toSafeObject(): SafeUser;
}
