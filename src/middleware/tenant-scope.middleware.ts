import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * TenantScopeMiddleware
 *
 * Propagates the authenticated tenant context into a `queryOptions`
 * bag on the request so that downstream service calls can attach the
 * correct `tenant_id` filter without re-reading the JWT on every query.
 *
 * The `tenantId` field is expected to be populated earlier in the
 * middleware chain (e.g. by the JWT auth guard).  When absent the
 * middleware is a no-op — enforcement of the presence of `tenantId`
 * is the responsibility of the auth layer, not this middleware.
 */
@Injectable()
export class TenantScopeMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string; queryOptions?: Record<string, unknown> },
    _res: Response,
    next: NextFunction,
  ): void {
    if (req.tenantId) {
      req.queryOptions = { ...req.queryOptions, tenant_id: req.tenantId };
    }
    next();
  }
}
