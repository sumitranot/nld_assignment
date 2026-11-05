"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAccess = void 0;
const AppError_1 = require("../utils/AppError");
const requireAccess = (requiredAccess) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.UnauthorizedError('Authentication required'));
            return;
        }
        // Design Decision: ADMIN bypasses granular access checks
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        const userAccess = req.user.access;
        // Design Decision: CREATE implies VIEW permissions
        if (requiredAccess === 'VIEW') {
            if (userAccess === 'VIEW' || userAccess === 'CREATE') {
                next();
                return;
            }
        }
        else if (requiredAccess === 'CREATE') {
            if (userAccess === 'CREATE') {
                next();
                return;
            }
        }
        next(new AppError_1.ForbiddenError(`Action requires '${requiredAccess}' access privilege. Your current access is '${userAccess ?? 'NONE'}'.`));
    };
};
exports.requireAccess = requireAccess;
//# sourceMappingURL=requireAccess.js.map