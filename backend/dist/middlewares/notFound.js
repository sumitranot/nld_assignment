"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const AppError_1 = require("../utils/AppError");
const notFound = (req, _res) => {
    throw new AppError_1.NotFoundError(`Endpoint ${req.method} ${req.originalUrl} not found`);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map