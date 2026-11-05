"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const openapi_json_1 = __importDefault(require("./docs/openapi.json"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const auth_routes_1 = require("./modules/auth/auth.routes");
const products_routes_1 = require("./modules/products/products.routes");
const orders_routes_1 = require("./modules/orders/orders.routes");
const notFound_1 = require("./middlewares/notFound");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
if (env_1.env.NODE_ENV !== 'test') {
    app.use((req, _res, next) => {
        logger_1.logger.info({ method: req.method, url: req.url }, 'incoming request');
        next();
    });
}
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Interactive Swagger UI & OpenAPI Specification
app.get('/docs/openapi.json', (_req, res) => {
    res.json(openapi_json_1.default);
});
app.get('/docs', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NLD Assessment — Logistics Order Management API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`);
});
// Modular Routes
app.use('/auth', auth_routes_1.authRoutes);
app.use('/products', products_routes_1.productsRoutes);
app.use('/orders', orders_routes_1.ordersRoutes);
// Mirror under /api for serverless routing
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/products', products_routes_1.productsRoutes);
app.use('/api/orders', orders_routes_1.ordersRoutes);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Catch 404 for unhandled routes
app.use(notFound_1.notFound);
// Centralized error handler
app.use(errorHandler_1.errorHandler);
//# sourceMappingURL=app.js.map