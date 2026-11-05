"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../utils/AppError");
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.UnauthorizedError('Authentication required'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new AppError_1.ForbiddenError(`Access forbidden: requires one of the following roles [${allowedRoles.join(', ')}]`));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map