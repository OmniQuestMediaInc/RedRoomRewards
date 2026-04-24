/**
 * Merchant model — unit tests (B-004)
 *
 * Verifies merchant_tier enum, tenant_id linkage, phase, and the
 * documented compound indexes.
 */

import { MerchantModel, MerchantSchema, MERCHANT_TIERS } from '../merchant.model';

describe('MerchantModel (B-004)', () => {
  describe('schema configuration', () => {
    it('binds to the merchants collection', () => {
      expect(
        (MerchantSchema as unknown as { options: { collection: string } }).options.collection,
      ).toBe('merchants');
    });

    it('exposes the documented merchant_tier enum (B5 caps)', () => {
      expect(MERCHANT_TIERS).toEqual(['PLATINUM', 'GOLD', 'SILVER', 'MEMBER', 'GUEST']);
    });
  });

  describe('validateSync', () => {
    it('rejects a document missing required fields', () => {
      const doc = new MerchantModel({});
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.merchant_id).toBeDefined();
      expect(err?.errors.tenant_id).toBeDefined();
      expect(err?.errors.name).toBeDefined();
      expect(err?.errors.phase).toBeDefined();
      expect(err?.errors.merchant_tier).toBeDefined();
    });

    it('accepts a minimal valid Phase-1 merchant (PLATINUM tier)', () => {
      const doc = new MerchantModel({
        merchant_id: 'mer-rrp-001',
        tenant_id: 'tenant-rrp-001',
        name: 'RedRoomPleasures',
        phase: 1,
        merchant_tier: 'PLATINUM',
      });
      expect(doc.validateSync()).toBeUndefined();
      expect(doc.status).toBe('active');
      expect(doc.default_currency).toBe('points');
    });

    it('rejects an out-of-enum merchant_tier', () => {
      const doc = new MerchantModel({
        merchant_id: 'mer-x',
        tenant_id: 't-x',
        name: 'X',
        phase: 1,
        merchant_tier: 'BRONZE',
      });
      const err = doc.validateSync();
      expect(err?.errors.merchant_tier).toBeDefined();
    });

    it('rejects phase outside {1, 2}', () => {
      const doc = new MerchantModel({
        merchant_id: 'mer-x',
        tenant_id: 't-x',
        name: 'X',
        phase: 0,
        merchant_tier: 'GOLD',
      });
      expect(doc.validateSync()?.errors.phase).toBeDefined();
    });

    it('accepts every documented tier', () => {
      for (const tier of MERCHANT_TIERS) {
        const doc = new MerchantModel({
          merchant_id: `mer-${tier}`,
          tenant_id: 't-1',
          name: `M-${tier}`,
          phase: 1,
          merchant_tier: tier,
        });
        expect(doc.validateSync()).toBeUndefined();
      }
    });
  });

  describe('indexes', () => {
    it('declares the documented compound indexes', () => {
      const indexNames = MerchantSchema.indexes().map(([def]) => Object.keys(def).join(','));
      expect(indexNames).toEqual(
        expect.arrayContaining(['tenant_id,status', 'tenant_id,merchant_tier', 'phase,status']),
      );
    });

    it('marks merchant_id as unique on the path itself', () => {
      const path = MerchantSchema.path('merchant_id') as unknown as {
        options: { unique: boolean };
      };
      expect(path.options.unique).toBe(true);
    });
  });
});
