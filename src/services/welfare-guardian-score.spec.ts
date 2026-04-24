import { WelfareGuardianScoreService } from './welfare-guardian-score.service';

describe('WelfareGuardianScoreService (WO-006)', () => {
  let service: WelfareGuardianScoreService;

  beforeEach(() => {
    service = new WelfareGuardianScoreService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Low-value transactions (<1000) — PASS / LOW
  it('scores tiny transaction (0 CZT) as LOW / PASS', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-tiny',
      guestId: 'guest-1',
      amountCzt: 0,
    });
    expect(result.action).toBe('PASS');
    expect(result.welfareTier).toBe('LOW');
    expect(result.fraudRisk).toBe(5);
    expect(result.welfareRisk).toBe(10);
  });

  // 1000–4999 CZT — PASS / LOW
  it('scores 1000 CZT as LOW / PASS', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-001',
      guestId: 'guest-42',
      amountCzt: 1000,
    });
    expect(result.action).toBe('PASS');
    expect(result.fraudRisk).toBe(15);
    expect(result.welfareRisk).toBe(22);
    expect(result.welfareTier).toBe('LOW');
  });

  it('scores 4999 CZT as LOW / PASS', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-002',
      guestId: 'guest-42',
      amountCzt: 4999,
    });
    expect(result.action).toBe('PASS');
    expect(result.welfareTier).toBe('LOW');
  });

  // 5000–9999 CZT — REVIEW / MEDIUM
  it('scores 5000 CZT as MEDIUM / REVIEW', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-003',
      guestId: 'guest-42',
      amountCzt: 5000,
    });
    expect(result.action).toBe('REVIEW');
    expect(result.welfareTier).toBe('MEDIUM');
    expect(result.fraudRisk).toBe(30);
    expect(result.welfareRisk).toBe(40);
  });

  // 10000–24999 CZT — SOFT_DECLINE / HIGH
  it('scores 10000 CZT as HIGH / SOFT_DECLINE', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-004',
      guestId: 'guest-42',
      amountCzt: 10_000,
    });
    expect(result.action).toBe('SOFT_DECLINE');
    expect(result.welfareTier).toBe('HIGH');
    expect(result.fraudRisk).toBe(55);
    expect(result.welfareRisk).toBe(65);
  });

  // 25000+ CZT — HARD_DECLINE / CRITICAL
  it('scores 25000 CZT as CRITICAL / HARD_DECLINE', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-005',
      guestId: 'guest-42',
      amountCzt: 25_000,
    });
    expect(result.action).toBe('HARD_DECLINE');
    expect(result.welfareTier).toBe('CRITICAL');
    expect(result.fraudRisk).toBe(80);
    expect(result.welfareRisk).toBe(90);
  });

  it('scores very large amount (1_000_000 CZT) as CRITICAL / HARD_DECLINE', async () => {
    const result = await service.scoreTransaction({
      transactionId: 'txn-max',
      guestId: 'guest-42',
      amountCzt: 1_000_000,
    });
    expect(result.action).toBe('HARD_DECLINE');
    expect(result.welfareTier).toBe('CRITICAL');
  });
});
