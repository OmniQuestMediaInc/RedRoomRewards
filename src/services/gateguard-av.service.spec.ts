import { GateGuardAVService } from './gateguard-av.service';

describe('GateGuardAVService', () => {
  const service = new GateGuardAVService();

  it('returns a verified GateGuard result for a guest', async () => {
    const result = await service.verifyAccount('guest-1');
    expect(result.verified).toBe(true);
    expect(result.method).toBe('GATEGUARD');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.verifiedAt).toBeInstanceOf(Date);
  });

  it('accepts an optional billing address argument without affecting the result', async () => {
    const result = await service.verifyAccount('guest-2', { line1: '1 Test St' });
    expect(result.verified).toBe(true);
  });
});
