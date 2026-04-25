/**
 * Rate-Limit Middleware (D-006)
 *
 * Applies a per-IP sliding-window rate limit to all incoming requests.
 * Default: 60 requests per 60-second window, standard headers, no legacy headers.
 *
 * Wire this into AppModule.configure() after AuthMiddleware and
 * TenantScopeMiddleware.
 *
 * @module middleware/rate-limit
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please retry after 60 seconds.' },
});

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    limiter(req, res, next);
  }
}
