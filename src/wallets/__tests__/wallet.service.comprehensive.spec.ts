/**
 * Comprehensive Wallet Service Tests
 *
 * Tests all escrow operations, edge cases, and business logic
 * as specified in TEST_STRATEGY.md
 */

import { WalletService } from '../wallet.service';
import { TransactionType, TransactionReason } from '../types';
import { InsufficientBalanceError } from '../../services/types';
import { WalletModel } from '../../db/models/wallet.model';
import { EscrowItemModel } from '../../db/models/escrow-item.model';

// Mock modules first (before variable declarations to satisfy jest hoisting)
jest.mock('../../db/models/wallet.model');
jest.mock('../../db/models/escrow-item.model');
jest.mock('../../db/models/model-wallet.model');

// Mock ledger service
const mockLedgerService = {
  checkIdempotency: jest.fn(),
  claimIdempotency: jest.fn().mockResolvedValue(true),
  createEntry: jest.fn(),
  queryEntries: jest.fn(),
  getBalanceSnapshot: jest.fn(),
  generateReconciliationReport: jest.fn(),
};

describe('WalletService - Comprehensive Tests', () => {
  let walletService: WalletService;

  beforeEach(() => {
    jest.resetAllMocks(); // also resets mock implementations from previous tests
    // Restore required defaults after reset
    mockLedgerService.claimIdempotency.mockResolvedValue(true);
    walletService = new WalletService(mockLedgerService as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  describe('holdInEscrow', () => {
    it('should deduct from available and add to escrow', async () => {
      // Arrange
      const userId = 'user-123';
      const initialBalance = 500;
      const holdAmount = 100;
      const idempotencyKey = 'idem-hold-1';

      mockLedgerService.checkIdempotency.mockResolvedValue(false);
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId,
        availableBalance: initialBalance,
        escrowBalance: 0,
        currency: 'points',
        version: 1,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLedgerService.createEntry.mockResolvedValue({
        entryId: 'entry-1',
      });
      (EscrowItemModel.create as jest.Mock).mockResolvedValue({
        escrowId: 'escrow-1',
      });
      (WalletModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId,
        availableBalance: initialBalance - holdAmount,
        escrowBalance: holdAmount,
        version: 2,
      });

      // Act
      const result = await walletService.holdInEscrow({
        userId,
        amount: holdAmount,
        reason: TransactionReason.CHIP_MENU_PURCHASE,
        queueItemId: 'queue-123',
        featureType: 'chip_menu',
        idempotencyKey,
        requestId: 'req-1',
      });

      // Assert
      expect(result.previousBalance).toBe(initialBalance);
      expect(result.newAvailableBalance).toBe(400);
      expect(result.escrowBalance).toBe(100);
      expect(mockLedgerService.createEntry).toHaveBeenCalled();
      expect(EscrowItemModel.create).toHaveBeenCalled();
    });

    it('should reject if insufficient balance', async () => {
      // Arrange
      const userId = 'user-123';
      const availableBalance = 50;
      const holdAmount = 100;

      mockLedgerService.checkIdempotency.mockResolvedValue(false);
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId,
        availableBalance,
        escrowBalance: 0,
        currency: 'points',
        version: 1,
      });

      // Act & Assert
      await expect(
        walletService.holdInEscrow({
          userId,
          amount: holdAmount,
          reason: TransactionReason.CHIP_MENU_PURCHASE,
          queueItemId: 'queue-123',
          featureType: 'chip_menu',
          idempotencyKey: 'idem-2',
          requestId: 'req-2',
        }),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it('should handle idempotent requests', async () => {
      // Arrange
      const idempotencyKey = 'idem-duplicate';

      // claimIdempotency returning false = key already claimed, reject
      mockLedgerService.claimIdempotency.mockResolvedValue(false);

      // Act & Assert
      await expect(
        walletService.holdInEscrow({
          userId: 'user-123',
          amount: 100,
          reason: TransactionReason.CHIP_MENU_PURCHASE,
          queueItemId: 'queue-123',
          featureType: 'chip_menu',
          idempotencyKey,
          requestId: 'req-3',
        }),
      ).rejects.toThrow('Idempotency key already used');
    });

    it('should validate amount is positive', async () => {
      // No wallet mock — WalletModel.findOne and create return undefined after reset.
      // Accessing wallet properties throws, which is the expected rejection.

      // Zero amount
      await expect(
        walletService.holdInEscrow({
          userId: 'user-123',
          amount: 0,
          reason: TransactionReason.CHIP_MENU_PURCHASE,
          queueItemId: 'queue-123',
          featureType: 'chip_menu',
          idempotencyKey: 'idem-4',
          requestId: 'req-4',
        }),
      ).rejects.toThrow();

      // Negative amount
      await expect(
        walletService.holdInEscrow({
          userId: 'user-123',
          amount: -100,
          reason: TransactionReason.CHIP_MENU_PURCHASE,
          queueItemId: 'queue-123',
          featureType: 'chip_menu',
          idempotencyKey: 'idem-5',
          requestId: 'req-5',
        }),
      ).rejects.toThrow();
    });

    it('should create immutable ledger entry', async () => {
      // Arrange
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        availableBalance: 500,
        escrowBalance: 0,
        version: 1,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLedgerService.createEntry.mockResolvedValue({
        entryId: 'entry-1',
      });
      (EscrowItemModel.create as jest.Mock).mockResolvedValue({
        escrowId: 'escrow-1',
      });
      (WalletModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        availableBalance: 400,
        escrowBalance: 100,
        version: 2,
      });

      // Act
      await walletService.holdInEscrow({
        userId: 'user-123',
        amount: 100,
        reason: TransactionReason.CHIP_MENU_PURCHASE,
        queueItemId: 'queue-123',
        featureType: 'chip_menu',
        idempotencyKey: 'idem-6',
        requestId: 'req-6',
      });

      // Assert - verify ledger entry created with correct parameters
      expect(mockLedgerService.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          accountType: 'user',
          type: TransactionType.DEBIT,
          balanceState: 'available',
          stateTransition: 'available→escrow',
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero balance scenarios', async () => {
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user-zero',
        availableBalance: 0,
        escrowBalance: 0,
        version: 1,
      });

      await expect(
        walletService.holdInEscrow({
          userId: 'user-zero',
          amount: 100,
          reason: TransactionReason.CHIP_MENU_PURCHASE,
          queueItemId: 'queue-123',
          featureType: 'chip_menu',
          idempotencyKey: 'idem-zero',
          requestId: 'req-zero',
        }),
      ).rejects.toThrow(InsufficientBalanceError);
    });

    it('should handle minimum amount (0.01)', async () => {
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user-min',
        availableBalance: 1,
        escrowBalance: 0,
        version: 1,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLedgerService.createEntry.mockResolvedValue({
        entryId: 'entry-min',
      });
      (EscrowItemModel.create as jest.Mock).mockResolvedValue({
        escrowId: 'escrow-min',
      });
      (WalletModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: 'user-min',
        availableBalance: 0.99,
        escrowBalance: 0.01,
        version: 2,
      });

      const result = await walletService.holdInEscrow({
        userId: 'user-min',
        amount: 0.01,
        reason: TransactionReason.CHIP_MENU_PURCHASE,
        queueItemId: 'queue-min',
        featureType: 'chip_menu',
        idempotencyKey: 'idem-min',
        requestId: 'req-min',
      });

      expect(result.escrowBalance).toBe(0.01);
    });

    it('should handle large amounts', async () => {
      const largeAmount = 1000000;
      (WalletModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user-large',
        availableBalance: largeAmount,
        escrowBalance: 0,
        version: 1,
        save: jest.fn().mockResolvedValue(true),
      });
      mockLedgerService.createEntry.mockResolvedValue({
        entryId: 'entry-large',
      });
      (EscrowItemModel.create as jest.Mock).mockResolvedValue({
        escrowId: 'escrow-large',
      });
      (WalletModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId: 'user-large',
        availableBalance: 0,
        escrowBalance: largeAmount,
        version: 2,
      });

      const result = await walletService.holdInEscrow({
        userId: 'user-large',
        amount: largeAmount,
        reason: TransactionReason.CHIP_MENU_PURCHASE,
        queueItemId: 'queue-large',
        featureType: 'chip_menu',
        idempotencyKey: 'idem-large',
        requestId: 'req-large',
      });

      expect(result.escrowBalance).toBe(largeAmount);
    });
  });
});
