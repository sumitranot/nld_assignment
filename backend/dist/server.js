"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const server = app_1.app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
});
const shutdown = (signal) => {
    logger_1.logger.info(`${signal} received, shutting down gracefully...`);
    server.close(() => {
        logger_1.logger.info('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
//# sourceMappingURL=server.js.map