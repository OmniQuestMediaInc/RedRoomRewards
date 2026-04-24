import { WelfareGuardianScoreService } from './welfare-guardian-score.service';

describe('WelfareGuardianScoreService', () => {
  let service: WelfareGuardianScoreService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new WelfareGuardianScoreService();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scoreTransaction should return a stub WGS result with PASS action', async () => {
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
});
