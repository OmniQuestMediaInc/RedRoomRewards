/**
 * LoyaltyAccount model — unit tests (B-005)
 */

import {
  LoyaltyAccountModel,
  LoyaltyAccountSchema,
  RRR_MEMBER_TIERS,
} from '../loyalty-account.model';

describe('LoyaltyAccountModel (B-005)', () => {
  describe('schema configuration', () => {
    it('binds to the loyalty_accounts collection', () => {
      expect(
        (LoyaltyAccountSchema as unknown as { options: { collection: string } }).options.collection,
      ).toBe('loyalty_accounts');
    });

    it('exposes the documented rrr_member_tier enum (B5 caps)', () => {
      expect(RRR_MEMBER_TIERS).toEqual(['PLATINUM', 'GOLD', 'SILVER', 'MEMBER', 'GUEST']);
    });
  });

  describe('validateSync', () => {
    it('rejects a document missing required fields', () => {
      const doc = new LoyaltyAccountModel({});
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.account_id).toBeDefined();
      expect(err?.errors.tenant_id).toBeDefined();
      expect(err?.errors.user_id).toBeDefined();
    });

    it('accepts a minimal valid document and applies defaults (status, currency, tier-null, enrolled_at)', () => {
      const doc = new LoyaltyAccountModel({
        account_id: 'acc-1',
        tenant_id: 'tenant-rrp-001',
        user_id: 'user-1',
      });
      expect(doc.validateSync()).toBeUndefined();
      expect(doc.status).toBe('active');
      expect(doc.default_currency).toBe('points');
      expect(doc.rrr_member_tier).toBeNull();
      expect(doc.enrolled_at).toBeInstanceOf(Date);
      expect(doc.closed_at).toBeNull();
    });

    it('accepts every documented member tier', () => {
      for (const tier of RRR_MEMBER_TIERS) {
        const doc = new LoyaltyAccountModel({
          account_id: `acc-${tier}`,
          tenant_id: 't-1',
          user_id: `u-${tier}`,
          rrr_member_tier: tier,
        });
        expect(doc.validateSync()).toBeUndefined();
      }
    });

    it('rejects an out-of-enum rrr_member_tier', () => {
      const doc = new LoyaltyAccountModel({
        account_id: 'acc-1',
        tenant_id: 't-1',
        user_id: 'u-1',
        rrr_member_tier: 'BRONZE',
      });
      expect(doc.validateSync()?.errors.rrr_member_tier).toBeDefined();
    });

    it('rejects an out-of-enum status', () => {
      const doc = new LoyaltyAccountModel({
        account_id: 'acc-1',
        tenant_id: 't-1',
        user_id: 'u-1',
        status: 'paused',
      });
      expect(doc.validateSync()?.errors.status).toBeDefined();
    });
  });

  describe('indexes', () => {
    it('declares the documented composite-unique indexes', () => {
      const indexes = LoyaltyAccountSchema.indexes();
      const names = indexes.map(([def, opts]) => ({
        key: Object.keys(def).join(','),
        unique: opts?.unique === true,
      }));

      expect(names).toEqual(
        expect.arrayContaining([
          { key: 'tenant_id,account_id', unique: true },
          { key: 'tenant_id,user_id', unique: true },
          { key: 'tenant_id,status', unique: false },
        ]),
      );
    });
  });
});
