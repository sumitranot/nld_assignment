let app;
try {
  app = require('../backend/dist/app').app;
} catch (loadErr) {
  console.error('Initial load of ../backend/dist/app failed:', loadErr);
}

module.exports = (req, res) => {
  if (!app) {
    try {
      app = require('../backend/dist/app').app;
    } catch (retryErr) {
      console.error('Retry load of ../backend/dist/app failed:', retryErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          error: {
            code: 'SERVERLESS_MODULE_LOAD_ERROR',
            message: retryErr?.message || 'Failed to load backend application module',
            stack: retryErr?.stack,
          },
        }),
      );
    }
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Request Execution Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error: {
          code: 'SERVERLESS_EXECUTION_ERROR',
          message: err?.message || 'Server error occurred during request processing',
        },
      }),
    );
  }
};

