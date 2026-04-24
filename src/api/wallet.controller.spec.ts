/**
 * Wallet Controller Tests
 */

import {
  WalletController,
  DeductPointsRequest,
  CreditPointsRequest,
  BadRequestError,
} from './wallet.controller';
import { IWalletService } from '../services/types';
import { IIdempotencyService } from '../services/idempotency.service';

describe('WalletController', () => {
  let controller: WalletController;
  let mockWalletService: jest.Mocked<IWalletService>;
  let mockIdempotencyService: jest.Mocked<IIdempotencyService>;

  beforeEach(() => {
    // Create mock wallet service
    mockWalletService = {
      getUserBalance: jest.fn(),
      getModelBalance: jest.fn(),
      holdInEscrow: jest.fn(),
      settleEscrow: jest.fn(),
      refundEscrow: jest.fn(),
      partialSettleEscrow: jest.fn(),
    } as unknown as jest.Mocked<IWalletService>;

    // Create mock idempotency service (cache miss by default)
    mockIdempotencyService = {
      checkKey: jest.fn().mockResolvedValue(null),
      recordKey: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IIdempotencyService>;

    controller = new WalletController(mockWalletService, mockIdempotencyService);
  });

  describe('getWallet', () => {
    it('should fetch wallet information for a user', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 1000,
        escrow: 200,
        total: 1200,
      });

      const response = await controller.getWallet('user-123');

      expect(response.userId).toBe('user-123');
      expect(response.availableBalance).toBe(1000);
      expect(response.escrowBalance).toBe(200);
      expect(response.totalBalance).toBe(1200);
      expect(response.currency).toBe('points');
      expect(mockWalletService.getUserBalance).toHaveBeenCalledWith('user-123');
    });

    it('should return structured wallet response', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 500,
        escrow: 0,
        total: 500,
      });

      const response = await controller.getWallet('user-456');

      expect(response).toHaveProperty('userId');
      expect(response).toHaveProperty('availableBalance');
      expect(response).toHaveProperty('escrowBalance');
      expect(response).toHaveProperty('totalBalance');
      expect(response).toHaveProperty('currency');
      expect(response).toHaveProperty('version');
      expect(response).toHaveProperty('createdAt');
      expect(response).toHaveProperty('lastUpdated');
    });
  });

  describe('deductPoints', () => {
    it('should deduct points from a user wallet', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 900,
        escrow: 0,
        total: 900,
      });

      const request: DeductPointsRequest = {
        amount: 100,
        reason: 'admin_debit',
        idempotencyKey: 'idem-123',
        requestId: 'req-123',
      };

      const response = await controller.deductPoints('user-123', request);

      expect(response.transaction.userId).toBe('user-123');
      expect(response.transaction.amount).toBe(-100); // Negative for debit
      expect(response.transaction.type).toBe('debit');
      expect(response.transaction.reason).toBe('admin_debit');
      expect(response.transaction.idempotencyKey).toBe('idem-123');
      expect(response.transaction.requestId).toBe('req-123');
      expect(response.wallet.userId).toBe('user-123');
    });

    it('should reject negative amounts', async () => {
      const request: DeductPointsRequest = {
        amount: -50,
        reason: 'admin_debit',
        idempotencyKey: 'idem-456',
        requestId: 'req-456',
      };

      await expect(controller.deductPoints('user-123', request)).rejects.toThrow(
        'Amount must be positive',
      );
    });

    it('should reject zero amounts', async () => {
      const request: DeductPointsRequest = {
        amount: 0,
        reason: 'admin_debit',
        idempotencyKey: 'idem-789',
        requestId: 'req-789',
      };

      await expect(controller.deductPoints('user-123', request)).rejects.toThrow(
        'Amount must be positive',
      );
    });

    it('should include metadata in transaction', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 950,
        escrow: 0,
        total: 950,
      });

      const request: DeductPointsRequest = {
        amount: 50,
        reason: 'chip_menu_purchase',
        metadata: { itemId: 'item-123', category: 'premium' },
        idempotencyKey: 'idem-meta',
        requestId: 'req-meta',
      };

      const response = await controller.deductPoints('user-789', request);

      expect(response.transaction.reason).toBe('chip_menu_purchase');
    });

    it('should reject request when idempotencyKey is missing', async () => {
      const request = {
        amount: 100,
        reason: 'admin_debit',
        idempotencyKey: '',
        requestId: 'req-missing',
      } as DeductPointsRequest;

      await expect(controller.deductPoints('user-123', request)).rejects.toThrow(BadRequestError);
    });

    it('should reject request when idempotencyKey is whitespace only', async () => {
      const request = {
        amount: 100,
        reason: 'admin_debit',
        idempotencyKey: '   ',
        requestId: 'req-whitespace',
      } as DeductPointsRequest;

      await expect(controller.deductPoints('user-123', request)).rejects.toThrow(BadRequestError);
    });

    it('should return cached result on idempotency key hit', async () => {
      const cachedResponse = {
        transaction: {
          id: 'txn_cached',
          userId: 'user-123',
          amount: -100,
          type: 'debit',
          reason: 'admin_debit',
          timestamp: '2026-01-01T00:00:00.000Z',
          idempotencyKey: 'idem-dup',
          previousBalance: 900,
          newBalance: 800,
          requestId: 'req-original',
        },
        wallet: {
          userId: 'user-123',
          availableBalance: 800,
          escrowBalance: 0,
          totalBalance: 800,
          currency: 'points',
          version: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          lastUpdated: '2026-01-01T00:00:00.000Z',
        },
      };
      mockIdempotencyService.checkKey.mockResolvedValue(
        cachedResponse as unknown as Record<string, unknown>,
      );

      const request: DeductPointsRequest = {
        amount: 100,
        reason: 'admin_debit',
        idempotencyKey: 'idem-dup',
        requestId: 'req-duplicate',
      };

      const response = await controller.deductPoints('user-123', request);

      // Should return cached result — wallet service must NOT be called
      expect(mockWalletService.getUserBalance).not.toHaveBeenCalled();
      expect(response.transaction.id).toBe('txn_cached');
      expect(mockIdempotencyService.recordKey).not.toHaveBeenCalled();
    });

    it('should record key after successful deduct', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 900,
        escrow: 0,
        total: 900,
      });

      const request: DeductPointsRequest = {
        amount: 100,
        reason: 'admin_debit',
        idempotencyKey: 'idem-record',
        requestId: 'req-record',
      };

      await controller.deductPoints('user-123', request);

      expect(mockIdempotencyService.recordKey).toHaveBeenCalledWith(
        'idem-record',
        'user-123',
        'wallet_deduct',
        expect.any(Object),
      );
    });
  });

  describe('creditPoints', () => {
    it('should credit points to a user wallet', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 1100,
        escrow: 0,
        total: 1100,
      });

      const request: CreditPointsRequest = {
        amount: 100,
        reason: 'user_signup_bonus',
        idempotencyKey: 'idem-credit-123',
        requestId: 'req-credit-123',
      };

      const response = await controller.creditPoints('user-123', request);

      expect(response.transaction.userId).toBe('user-123');
      expect(response.transaction.amount).toBe(100); // Positive for credit
      expect(response.transaction.type).toBe('credit');
      expect(response.transaction.reason).toBe('user_signup_bonus');
      expect(response.transaction.idempotencyKey).toBe('idem-credit-123');
      expect(response.transaction.requestId).toBe('req-credit-123');
      expect(response.wallet.userId).toBe('user-123');
    });

    it('should reject negative amounts', async () => {
      const request: CreditPointsRequest = {
        amount: -100,
        reason: 'admin_credit',
        idempotencyKey: 'idem-neg',
        requestId: 'req-neg',
      };

      await expect(controller.creditPoints('user-456', request)).rejects.toThrow(
        'Amount must be positive',
      );
    });

    it('should reject zero amounts', async () => {
      const request: CreditPointsRequest = {
        amount: 0,
        reason: 'admin_credit',
        idempotencyKey: 'idem-zero',
        requestId: 'req-zero',
      };

      await expect(controller.creditPoints('user-456', request)).rejects.toThrow(
        'Amount must be positive',
      );
    });

    it('should handle different reason types', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 1250,
        escrow: 0,
        total: 1250,
      });

      const request: CreditPointsRequest = {
        amount: 250,
        reason: 'referral_bonus',
        idempotencyKey: 'idem-ref',
        requestId: 'req-ref',
      };

      const response = await controller.creditPoints('user-ref', request);

      expect(response.transaction.reason).toBe('referral_bonus');
      expect(response.transaction.amount).toBe(250);
    });

    it('should reject request when idempotencyKey is missing', async () => {
      const request = {
        amount: 100,
        reason: 'admin_credit',
        idempotencyKey: '',
        requestId: 'req-missing',
      } as CreditPointsRequest;

      await expect(controller.creditPoints('user-456', request)).rejects.toThrow(BadRequestError);
    });

    it('should reject request when idempotencyKey is whitespace only', async () => {
      const request = {
        amount: 100,
        reason: 'admin_credit',
        idempotencyKey: '   ',
        requestId: 'req-whitespace',
      } as CreditPointsRequest;

      await expect(controller.creditPoints('user-456', request)).rejects.toThrow(BadRequestError);
    });

    it('should return cached result on idempotency key hit', async () => {
      const cachedResponse = {
        transaction: {
          id: 'txn_cached_credit',
          userId: 'user-123',
          amount: 100,
          type: 'credit',
          reason: 'user_signup_bonus',
          timestamp: '2026-01-01T00:00:00.000Z',
          idempotencyKey: 'idem-credit-dup',
          previousBalance: 1000,
          newBalance: 1100,
          requestId: 'req-original',
        },
        wallet: {
          userId: 'user-123',
          availableBalance: 1100,
          escrowBalance: 0,
          totalBalance: 1100,
          currency: 'points',
          version: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          lastUpdated: '2026-01-01T00:00:00.000Z',
        },
      };
      mockIdempotencyService.checkKey.mockResolvedValue(
        cachedResponse as unknown as Record<string, unknown>,
      );

      const request: CreditPointsRequest = {
        amount: 100,
        reason: 'user_signup_bonus',
        idempotencyKey: 'idem-credit-dup',
        requestId: 'req-duplicate',
      };

      const response = await controller.creditPoints('user-123', request);

      // Should return cached result — wallet service must NOT be called
      expect(mockWalletService.getUserBalance).not.toHaveBeenCalled();
      expect(response.transaction.id).toBe('txn_cached_credit');
      expect(mockIdempotencyService.recordKey).not.toHaveBeenCalled();
    });

    it('should record key after successful credit', async () => {
      mockWalletService.getUserBalance.mockResolvedValue({
        available: 1000,
        escrow: 0,
        total: 1000,
      });

      const request: CreditPointsRequest = {
        amount: 100,
        reason: 'user_signup_bonus',
        idempotencyKey: 'idem-credit-record',
        requestId: 'req-credit-record',
      };

      await controller.creditPoints('user-123', request);

      expect(mockIdempotencyService.recordKey).toHaveBeenCalledWith(
        'idem-credit-record',
        'user-123',
        'wallet_credit',
        expect.any(Object),
      );
    });
  });
});
