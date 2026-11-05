"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const validate = (schemas) => {
    return (req, _res, next) => {
        void (async () => {
            try {
                if (schemas.params) {
                    const parsedParams = await schemas.params.parseAsync(req.params);
                    req.params = parsedParams;
                }
                if (schemas.query) {
                    const parsedQuery = await schemas.query.parseAsync(req.query);
                    req.query = parsedQuery;
                }
                if (schemas.body) {
                    const parsedBody = await schemas.body.parseAsync(req.body);
                    req.body = parsedBody;
                }
                next();
            }
            catch (err) {
                if (err instanceof zod_1.ZodError) {
                    const formatted = err.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    }));
                    next(new AppError_1.BadRequestError('Validation failed', formatted));
                    return;
                }
                next(err);
            }
        })();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map