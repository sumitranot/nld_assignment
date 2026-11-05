"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    static async register(req, res) {
        const input = req.body;
        const result = await auth_service_1.AuthService.register(input);
        res.status(201).json(result);
    }
    static async login(req, res) {
        const input = req.body;
        const result = await auth_service_1.AuthService.login(input);
        res.status(200).json(result);
    }
    static getMe(req, res) {
        if (!req.user) {
            res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
            return;
        }
        res.status(200).json({ user: req.user.toSafeObject() });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map