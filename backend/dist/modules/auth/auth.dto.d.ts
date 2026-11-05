import { SafeUser, UserAccess, UserRole } from '../../db/models/User';
export interface RegisterDTO {
    email: string;
    password: string;
    role: UserRole;
    access?: UserAccess;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: SafeUser;
    token: string;
}
export interface JWTPayload {
    sub: number;
    email: string;
    role: UserRole;
    access: UserAccess | null;
}
