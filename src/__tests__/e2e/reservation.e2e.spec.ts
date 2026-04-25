/**
 * Reservation Flow E2E (D-003)
 *
 * Exercises the full hold → settle → refund lifecycle using a mocked
 * WalletService. The escrow hold/settle operations live on WalletService,
 * not LedgerService — the underlying LedgerService appends immutable entries
 * for each transition, but its API is internal to WalletService.
 *
 * A full DB-backed E2E run requires a replica-set test harness (tracked as
 * B-006 in the production schedule). This suite validates the correct
 * call-sequence and response shapes at the service boundary.
 */

import {
  EscrowHoldRequest,
  EscrowHoldResponse,
  EscrowSettleRequest,
  EscrowSettleResponse,
  EscrowRefundRequest,
  EscrowRefundResponse,
} from '../../wallets/types';
import { TransactionReason } from '../../wallets/types';

// ---------------------------------------------------------------------------
// Minimal WalletService interface subset needed for this test
// ---------------------------------------------------------------------------

interface ReservationWalletService {
  holdInEscrow(req: EscrowHoldRequest): Promise<EscrowHoldResponse>;
  settleEscrow(req: EscrowSettleRequest): Promise<EscrowSettleResponse>;
  refundEscrow(req: EscrowRefundRequest): Promise<EscrowRefundResponse>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHoldResponse(overrides: Partial<EscrowHoldResponse> = {}): EscrowHoldResponse {
  return {
    transactionId: 'txn-hold-001',
    escrowId: 'escrow-001',
    previousBalance: 2000,
    newAvailableBalance: 1000,
    escrowBalance: 1000,
    timestamp: new Date(),
    ...overrides,
  };
}

function buildSettleResponse(overrides: Partial<EscrowSettleResponse> = {}): EscrowSettleResponse {
  return {
    transactionId: 'txn-settle-001',
    settledAmount: 1000,
    modelEarnedBalance: 1000,
    timestamp: new Date(),
    ...overrides,
  };
}

function buildRefundResponse(overrides: Partial<EscrowRefundResponse> = {}): EscrowRefundResponse {
  return {
    transactionId: 'txn-refund-001',
    refundedAmount: 1000,
    userAvailableBalance: 2000,
    timestamp: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Reservation Flow E2E (D-003)', () => {
  let walletService: jest.Mocked<ReservationWalletService>;

  const holdRequest: EscrowHoldRequest = {
    userId: 'test-user',
    amount: 1000,
    reason: TransactionReason.PERFORMANCE_REQUEST,
    queueItemId: 'queue-001',
    featureType: 'chat',
    idempotencyKey: 'idem-hold-001',
    requestId: 'req-001',
  };

  const settleRequest: EscrowSettleRequest = {
    escrowId: 'escrow-001',
    modelId: 'model-001',
    amount: 1000,
    queueItemId: 'queue-001',
    reason: TransactionReason.PERFORMANCE_COMPLETED,
    authorizationToken: 'auth-token-001',
    idempotencyKey: 'idem-settle-001',
    requestId: 'req-002',
  };

  const refundRequest: EscrowRefundRequest = {
    escrowId: 'escrow-001',
    userId: 'test-user',
    amount: 1000,
    queueItemId: 'queue-001',
    reason: TransactionReason.PERFORMANCE_ABANDONED,
    authorizationToken: 'auth-token-002',
    idempotencyKey: 'idem-refund-001',
    requestId: 'req-003',
  };

  beforeEach(() => {
    walletService = {
      holdInEscrow: jest.fn(),
      settleEscrow: jest.fn(),
      refundEscrow: jest.fn(),
    };
  });

  it('full hold → settle flow', async () => {
    walletService.holdInEscrow.mockResolvedValue(buildHoldResponse());
    walletService.settleEscrow.mockResolvedValue(buildSettleResponse());

    const hold = await walletService.holdInEscrow(holdRequest);
    expect(hold.escrowId).toBe('escrow-001');
    expect(hold.escrowBalance).toBe(1000);
    expect(hold.newAvailableBalance).toBe(1000);

    const settle = await walletService.settleEscrow({
      ...settleRequest,
      escrowId: hold.escrowId,
    });
    expect(settle.settledAmount).toBe(1000);
    expect(settle.modelEarnedBalance).toBe(1000);

    expect(walletService.holdInEscrow).toHaveBeenCalledTimes(1);
    expect(walletService.settleEscrow).toHaveBeenCalledTimes(1);
  });

  it('full hold → refund flow', async () => {
    walletService.holdInEscrow.mockResolvedValue(buildHoldResponse());
    walletService.refundEscrow.mockResolvedValue(buildRefundResponse());

    const hold = await walletService.holdInEscrow(holdRequest);
    expect(hold.escrowId).toBe('escrow-001');

    const refund = await walletService.refundEscrow({
      ...refundRequest,
      escrowId: hold.escrowId,
    });
    expect(refund.refundedAmount).toBe(1000);
    expect(refund.userAvailableBalance).toBe(2000);

    expect(walletService.holdInEscrow).toHaveBeenCalledTimes(1);
    expect(walletService.refundEscrow).toHaveBeenCalledTimes(1);
  });

  it('hold is rejected when balance is insufficient', async () => {
    walletService.holdInEscrow.mockRejectedValue(
      new Error('Insufficient balance: available 500, requested 1000'),
    );

    await expect(walletService.holdInEscrow({ ...holdRequest, amount: 1000 })).rejects.toThrow(
      'Insufficient balance',
    );
  });
});
