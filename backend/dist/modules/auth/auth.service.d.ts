import { User } from '../../db/models/User';
import { AuthResponse, LoginDTO, RegisterDTO } from './auth.dto';
export declare class AuthService {
    static generateToken(user: User): string;
    static register(input: RegisterDTO): Promise<AuthResponse>;
    static login(input: LoginDTO): Promise<AuthResponse>;
}
