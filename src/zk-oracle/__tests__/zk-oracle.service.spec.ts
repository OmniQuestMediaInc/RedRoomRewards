import { ZkOracleService } from '../zk-oracle.service';
import { ZkCircuitId } from '../zk-oracle.types';

describe('ZkOracleService (WO-011 PoC)', () => {
  let service: ZkOracleService;

  beforeEach(() => {
    service = new ZkOracleService();
  });

  // ── generateBalanceProof ─────────────────────────────────────────────────

  describe('generateBalanceProof', () => {
    it('returns a proof with the correct circuitId and threshold', () => {
      const proof = service.generateBalanceProof(12_000, 1_000);

      expect(proof.circuitId).toBe(ZkCircuitId.BALANCE_RANGE);
      expect(proof.threshold).toBe(1_000);
    });

    it('does NOT include the private balance in the proof', () => {
      const balance = 99_999;
      const proof = service.generateBalanceProof(balance, 1_000);

      const proofStr = JSON.stringify(proof);
      expect(proofStr).not.toContain(String(balance));
    });

    it('generates a non-empty commitment and proof blob', () => {
      const proof = service.generateBalanceProof(5_000, 500);

      expect(proof.commitment.value).toHaveLength(64); // SHA-256 hex
      expect(proof.commitment.nonce).toHaveLength(64); // 32 bytes hex
      expect(proof.proof.length).toBeGreaterThan(0);
      expect(proof.proofId).toBeTruthy();
    });

    it('generates a unique proofId on each call', () => {
      const p1 = service.generateBalanceProof(5_000, 500);
      const p2 = service.generateBalanceProof(5_000, 500);

      expect(p1.proofId).not.toBe(p2.proofId);
    });

    it('throws when balance < threshold (circuit constraint violation)', () => {
      expect(() => service.generateBalanceProof(500, 1_000)).toThrow(/constraint violated/);
    });

    it('succeeds when balance exactly equals threshold', () => {
      expect(() => service.generateBalanceProof(1_000, 1_000)).not.toThrow();
    });

    it('throws on negative threshold', () => {
      expect(() => service.generateBalanceProof(1_000, -1)).toThrow(/non-negative/);
    });

    it('writes an audit record with public data only (no private balance)', () => {
      const correlationId = 'corr-abc-123';
      const proof = service.generateBalanceProof(12_000, 1_000, correlationId);
      const records = service.getAuditRecords(proof.proofId);

      expect(records).toHaveLength(1);
      expect(records[0].threshold).toBe(1_000);
      expect(records[0].correlationId).toBe(correlationId);
      expect(records[0].commitment).toBe(proof.commitment.value);

      // Audit record must never contain the private balance
      expect(JSON.stringify(records[0])).not.toContain('12000');
    });
  });

  // ── verifyBalanceProof ───────────────────────────────────────────────────

  describe('verifyBalanceProof', () => {
    it('verifies a legitimately generated proof', () => {
      const proof = service.generateBalanceProof(12_000, 1_000);
      const result = service.verifyBalanceProof(proof);

      expect(result.valid).toBe(true);
      expect(result.circuitId).toBe(ZkCircuitId.BALANCE_RANGE);
      expect(result.claimedThreshold).toBe(1_000);
      expect(result.error).toBeUndefined();
    });

    it('rejects a tampered proof blob', () => {
      const proof = service.generateBalanceProof(12_000, 1_000);
      const tampered = { ...proof, proof: 'deadbeef:1000' };

      const result = service.verifyBalanceProof(tampered);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects a proof with a mismatched threshold', () => {
      const proof = service.generateBalanceProof(12_000, 1_000);
      // Claim a higher threshold than the proof was generated against
      const tampered = { ...proof, threshold: 10_000 };

      const result = service.verifyBalanceProof(tampered);
      expect(result.valid).toBe(false);
    });

    it('rejects a proof with the wrong circuitId', () => {
      const proof = service.generateBalanceProof(12_000, 1_000);
      const tampered = { ...proof, circuitId: ZkCircuitId.TIER_MEMBERSHIP };

      const result = service.verifyBalanceProof(tampered);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Circuit mismatch/);
    });

    it('never throws — always returns a ZkVerifyResult', () => {
      // Completely invalid input
      const garbage = {
        commitment: { value: 'bad', nonce: 'bad', algorithm: 'sha256' as const },
        threshold: 0,
        proof: '',
        circuitId: ZkCircuitId.BALANCE_RANGE,
        proofId: 'x',
        generatedAt: new Date().toISOString(),
      };

      expect(() => service.verifyBalanceProof(garbage)).not.toThrow();
      expect(service.verifyBalanceProof(garbage).valid).toBe(false);
    });
  });

  // ── audit log ────────────────────────────────────────────────────────────

  describe('getAuditRecords', () => {
    it('returns all records when called without a proofId', () => {
      service.generateBalanceProof(1_000, 100);
      service.generateBalanceProof(2_000, 200);
      service.generateBalanceProof(3_000, 300);

      expect(service.getAuditRecords()).toHaveLength(3);
    });

    it('returns only the matching record when proofId is given', () => {
      const p1 = service.generateBalanceProof(1_000, 100);
      service.generateBalanceProof(2_000, 200);

      const records = service.getAuditRecords(p1.proofId);
      expect(records).toHaveLength(1);
      expect(records[0].proofId).toBe(p1.proofId);
    });

    it('returns empty array for an unknown proofId', () => {
      service.generateBalanceProof(1_000, 100);
      expect(service.getAuditRecords('no-such-id')).toHaveLength(0);
    });
  });
});
