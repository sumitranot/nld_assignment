import type { IncomingMessage, ServerResponse } from 'http';
import { app } from '../backend/src/app';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
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
          message: err?.message || 'Server error',
        },
      }),
    );
  }
}
