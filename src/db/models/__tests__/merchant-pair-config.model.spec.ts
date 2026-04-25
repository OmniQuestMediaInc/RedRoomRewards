/**
 * MerchantPairConfig model — unit tests (B-007)
 */

import {
  MerchantPairConfigModel,
  MerchantPairConfigSchema,
  DEFAULT_CROSS_MERCHANT_EXCHANGE_RATE,
  getDefaultExchangeRate,
} from '../merchant-pair-config.model';

describe('MerchantPairConfigModel (B-007)', () => {
  describe('schema configuration', () => {
    it('binds to the merchant_pair_configs collection', () => {
      expect(
        (MerchantPairConfigSchema as unknown as { options: { collection: string } }).options
          .collection,
      ).toBe('merchant_pair_configs');
    });

    it('exposes the documented 1:1 default per CEO Decision B4', () => {
      expect(DEFAULT_CROSS_MERCHANT_EXCHANGE_RATE).toBe(1.0);
      expect(getDefaultExchangeRate()).toBe(1.0);
    });
  });

  describe('validateSync', () => {
    it('rejects a document missing required effective-dating fields', () => {
      const doc = new MerchantPairConfigModel({});
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.config_id).toBeDefined();
      expect(err?.errors.tenant_id).toBeDefined();
      expect(err?.errors.from_merchant_id).toBeDefined();
      expect(err?.errors.to_merchant_id).toBeDefined();
      expect(err?.errors.exchange_rate).toBeDefined();
      expect(err?.errors.effective_at).toBeDefined();
      expect(err?.errors.correlation_id).toBeDefined();
      expect(err?.errors.reason_code).toBeDefined();
      expect(err?.errors.created_by).toBeDefined();
    });

    it('accepts a minimal valid pair-config and defaults superseded_at to null', () => {
      const doc = new MerchantPairConfigModel({
        config_id: 'cfg-pair-001',
        tenant_id: 't-1',
        from_merchant_id: 'mer-rrp-001',
        to_merchant_id: 'mer-cyrano-001',
        exchange_rate: 1.0,
        effective_at: new Date('2026-01-01T00:00:00Z'),
        correlation_id: 'corr-1',
        reason_code: 'INITIAL_PAIR_CONFIG',
        created_by: 'admin-kbh',
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.superseded_at).toBeNull();
    });

    it('rejects a negative exchange_rate', () => {
      const doc = new MerchantPairConfigModel({
        config_id: 'cfg-pair-001',
        tenant_id: 't-1',
        from_merchant_id: 'mer-rrp-001',
        to_merchant_id: 'mer-cyrano-001',
        exchange_rate: -0.5,
        effective_at: new Date(),
        correlation_id: 'corr-1',
        reason_code: 'PROMO',
        created_by: 'admin-kbh',
      });
      expect(doc.validateSync()?.errors.exchange_rate).toBeDefined();
    });

    it('accepts a zero exchange_rate (denominated burn-only pairing)', () => {
      const doc = new MerchantPairConfigModel({
        config_id: 'cfg-pair-001',
        tenant_id: 't-1',
        from_merchant_id: 'mer-rrp-001',
        to_merchant_id: 'mer-cyrano-001',
        exchange_rate: 0,
        effective_at: new Date(),
        correlation_id: 'corr-1',
        reason_code: 'BURN_ONLY',
        created_by: 'admin-kbh',
      });
      expect(doc.validateSync()).toBeUndefined();
    });
  });

  describe('indexes', () => {
    it('declares the documented active-row partial-unique index', () => {
      const indexes = MerchantPairConfigSchema.indexes();

      const partialUnique = indexes.find(
        ([def, opts]) =>
          def.tenant_id === 1 &&
          def.from_merchant_id === 1 &&
          def.to_merchant_id === 1 &&
          opts?.unique === true &&
          opts?.partialFilterExpression?.superseded_at === null,
      );
      expect(partialUnique).toBeDefined();
    });

    it('declares the lookup index for tenant + pair + effective_at desc', () => {
      const indexes = MerchantPairConfigSchema.indexes();
      const lookup = indexes.find(
        ([def]) =>
          def.tenant_id === 1 &&
          def.from_merchant_id === 1 &&
          def.to_merchant_id === 1 &&
          def.effective_at === -1,
      );
      expect(lookup).toBeDefined();
    });

    it('marks config_id as unique on the path itself', () => {
      const path = MerchantPairConfigSchema.path('config_id') as unknown as {
        options: { unique: boolean };
      };
      expect(path.options.unique).toBe(true);
    });
  });
});
