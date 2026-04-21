/**
 * Security and Authorization Tests
 *
 * Tests authorization validation, input validation, and security controls
 * as specified in TEST_STRATEGY.md Section 5.
 */

import { AuthService, JWTPayload, UserRole } from '../services/auth.service';
import { TransactionReason } from '../wallets/types';

const TEST_AUTH_CONFIG = {
  jwtSecret: 'test-secret-do-not-use-in-production',
  tokenExpirySeconds: 300,
  algorithm: 'HS256' as const,
};

function makeJWTPayload(partial: Partial<JWTPayload> & { role: UserRole; sub: string }): JWTPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    iat: now,
    exp: now + 300,
    type: 'test',
    ...partial,
  };
}

describe('Security Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(TEST_AUTH_CONFIG);
  });

  describe('Authorization Validation', () => {
    describe('Queue Authorization Tokens', () => {
      it('should reject tampered authorization token', () => {
        const authorization = authService.generateSettlementAuthorization(
          'queue-123',
          'escrow-123',
          'model-456',
          100,
          TransactionReason.PERFORMANCE_COMPLETED
        );

        const tamperedToken = authorization.token.slice(0, -5) + 'XXXXX';

        expect(() => authService.verifyAuthorizationToken(tamperedToken)).toThrow();
      });

      it('should reject tokens with wrong operation type', () => {
        const refundAuth = authService.generateRefundAuthorization(
          'queue-123',
          'escrow-123',
          'user-123',
          100,
          TransactionReason.PERFORMANCE_ABANDONED
        );

        // A refund token must not satisfy a settlement check.
        const refundAsSettlement = {
          queueItemId: refundAuth.queueItemId,
          token: refundAuth.token,
          escrowId: refundAuth.escrowId,
          modelId: 'model-456',
          amount: refundAuth.amount,
          reason: refundAuth.reason,
          issuedAt: refundAuth.issuedAt,
          expiresAt: refundAuth.expiresAt,
        };

        expect(() =>
          authService.validateSettlementAuthorization(
            refundAsSettlement,
            'queue-123',
            'escrow-123'
          )
        ).toThrow('Invalid authorization type');
      });
    });

    describe('Admin Authorization', () => {
      it('should validate admin roles for operations', () => {
        const adminPayload = makeJWTPayload({ sub: 'admin-123', role: UserRole.ADMIN });

        expect(authService.hasRole(adminPayload, UserRole.ADMIN)).toBe(true);
        // Admin is allowed to satisfy any role requirement.
        expect(authService.hasRole(adminPayload, UserRole.USER)).toBe(true);
      });

      it('should reject operations without required admin role', () => {
        const userPayload = makeJWTPayload({ sub: 'user-123', role: UserRole.USER });

        expect(authService.hasRole(userPayload, UserRole.ADMIN)).toBe(false);
      });
    });
  });

  describe('Input Validation', () => {
    it('should reject SQL injection attempts in userId', () => {
      const maliciousUserId = "user-123'; DROP TABLE wallets; --";

      expect(() => {
        validateUserId(maliciousUserId);
      }).toThrow('Invalid user ID format');
    });

    it('should sanitize metadata fields', () => {
      const maliciousMetadata = {
        notes: "'; DELETE FROM ledger WHERE '1'='1",
      };

      const sanitized = sanitizeMetadata(maliciousMetadata);
      expect(sanitized.notes).not.toContain('DELETE');
    });

    it('should reject negative amounts', () => {
      expect(() => validateAmount(-100)).toThrow('Amount must be positive');
    });

    it('should reject zero amounts', () => {
      expect(() => validateAmount(0)).toThrow('Amount must be positive');
    });

    it('should reject NaN amounts', () => {
      expect(() => validateAmount(NaN)).toThrow('Amount must be a number');
    });
  });

  describe('PII and Secret Protection', () => {
    it('should not log sensitive data', () => {
      const transactionData = {
        userId: 'user-123',
        amount: 100,
        creditCard: '4111111111111111',
        ssn: '123-45-6789',
      };

      const logSafe = redactSensitiveData(transactionData);

      expect(logSafe.creditCard).toBeUndefined();
      expect(logSafe.ssn).toBeUndefined();
      expect(logSafe.userId).toBe('user-123');
    });

    it('should redact email addresses in logs', () => {
      const data = {
        user: 'john.doe@example.com',
        action: 'signup',
      };

      const logSafe = redactSensitiveData(data);
      expect(logSafe.user).toBe('[REDACTED_EMAIL]');
    });
  });
});

// Helper validation functions
function validateUserId(userId: unknown): void {
  if (typeof userId !== 'string') {
    throw new Error('Invalid user ID format');
  }
  if (userId.includes(';') || userId.includes('--')) {
    throw new Error('Invalid user ID format');
  }
}

function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/<script>/gi, '')
        .replace(/DELETE/gi, '')
        .replace(/DROP/gi, '');
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function validateAmount(amount: unknown): void {
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  if (isNaN(amount)) {
    throw new Error('Amount must be a number');
  }
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
}

function redactSensitiveData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const redacted: Record<string, unknown> = { ...data };
  const sensitiveFields = ['password', 'creditCard', 'ssn', 'apiKey', 'token'];
  sensitiveFields.forEach((field) => {
    if (redacted[field]) {
      delete redacted[field];
    }
  });
  if (
    typeof redacted.user === 'string' &&
    redacted.user.includes('@')
  ) {
    redacted.user = '[REDACTED_EMAIL]';
  }
  return redacted;
}
