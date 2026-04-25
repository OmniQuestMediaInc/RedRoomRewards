/**
 * Auth Middleware (C-004)
 *
 * Extracts and verifies the Bearer JWT from the `Authorization` header.
 * On success, populates `req.tenantId` and `req.userId` so that downstream
 * guards and the `TenantScopeMiddleware` can enforce multi-tenant isolation
 * without re-reading the token.
 *
 * Intentionally does NOT reject unauthenticated requests — enforcement is
 * the responsibility of NestJS guards (e.g. a future `JwtAuthGuard`).
 * This keeps the middleware chain composable.
 *
 * @module middleware/auth
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * Expected shape of the JWT payload used by this platform.
 */
interface RrrJwtPayload {
  tenantId?: string;
  userId?: string;
  sub?: string;
  [key: string]: unknown;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string; userId?: string },
    _res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

    if (token) {
      try {
        const secret = process.env.JWT_SECRET ?? '';
        const payload = jwt.verify(token, secret) as RrrJwtPayload;

        if (typeof payload.tenantId === 'string') {
          req.tenantId = payload.tenantId;
        }
        if (typeof payload.userId === 'string') {
          req.userId = payload.userId;
        } else if (typeof payload.sub === 'string') {
          req.userId = payload.sub;
        }
      } catch {
        // Token is invalid or expired; leave tenantId / userId unset.
        // A guard will reject the request if authentication is required.
      }
    }

    next();
  }
}
