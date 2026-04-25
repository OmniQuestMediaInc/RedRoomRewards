/**
 * FraudSignalService — unit tests (C-009 / C-012)
 *
 * Verifies:
 *   - detectFraud returns an empty array when no patterns are detected.
 *   - detectFraud does NOT emit a webhook when no patterns are detected.
 *   - detectFraud emits a "fraud.signal" webhook when patterns are present.
 *   - The webhook payload includes userId, patterns, evidence, and detectedAt.
 */

import { FraudSignalService, FraudCheckEvent } from '../fraud-signal.service';
import { WebhookEmitService } from '../../webhooks/webhook-emit.service';

const mockEmit = jest.fn().mockResolvedValue(undefined);

const mockWebhookEmitService: jest.Mocked<Pick<WebhookEmitService, 'emit'>> = {
  emit: mockEmit,
};

describe('FraudSignalService (C-012)', () => {
  let service: FraudSignalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FraudSignalService(mockWebhookEmitService as unknown as WebhookEmitService);
  });

  it('returns an empty array when no fraud patterns are detected', async () => {
    const event: FraudCheckEvent = { userId: 'user-001' };

    const result = await service.detectFraud(event);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('does not emit a webhook when no fraud patterns are detected', async () => {
    const event: FraudCheckEvent = { userId: 'user-001' };

    await service.detectFraud(event);

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('emits a fraud.signal webhook when patterns are detected', async () => {
    // Reach into the private method to force a detection — use prototype spy.
    const checkSpy = jest
      .spyOn(
        service as unknown as { checkPatterns: (e: FraudCheckEvent) => unknown[] },
        'checkPatterns',
      )
      .mockReturnValue([{ type: 'VELOCITY', description: 'test' }]);

    const event: FraudCheckEvent = { userId: 'user-fraud-001' };

    const result = await service.detectFraud(event);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('VELOCITY');
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith(
      'fraud.signal',
      expect.objectContaining({
        userId: 'user-fraud-001',
        patterns: expect.arrayContaining([expect.objectContaining({ type: 'VELOCITY' })]),
        detectedAt: expect.any(String),
        evidence: expect.objectContaining({ userId: 'user-fraud-001' }),
      }),
    );

    checkSpy.mockRestore();
  });

  it('includes all detected patterns in the webhook payload', async () => {
    const multiPatterns = [
      { type: 'VELOCITY' as const, description: 'velocity hit' },
      { type: 'IMMEDIATE_REDEMPTION' as const, description: 'fast redeem' },
    ];

    jest
      .spyOn(
        service as unknown as { checkPatterns: (e: FraudCheckEvent) => unknown[] },
        'checkPatterns',
      )
      .mockReturnValue(multiPatterns);

    const event: FraudCheckEvent = { userId: 'user-multi' };
    const result = await service.detectFraud(event);

    expect(result).toHaveLength(2);
    expect(mockEmit).toHaveBeenCalledWith(
      'fraud.signal',
      expect.objectContaining({ patterns: multiPatterns }),
    );
  });
});
