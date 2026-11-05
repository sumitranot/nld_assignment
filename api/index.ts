import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { app } = await import('../backend/src/app');
    return app(req, res);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Serverless Execution Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: {
          code: 'SERVERLESS_INVOCATION_ERROR',
          message: err?.message || 'Server failed to start',
        },
      }),
    );
  }
}
