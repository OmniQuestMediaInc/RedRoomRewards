/**
 * IdentityLink model — unit tests (B-005)
 */

import { IdentityLinkModel, IdentityLinkSchema } from '../identity-link.model';

describe('IdentityLinkModel (B-005)', () => {
  describe('schema configuration', () => {
    it('binds to the identity_links collection', () => {
      expect(
        (IdentityLinkSchema as unknown as { options: { collection: string } }).options.collection,
      ).toBe('identity_links');
    });
  });

  describe('validateSync', () => {
    it('rejects a document missing required fields', () => {
      const doc = new IdentityLinkModel({});
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.link_id).toBeDefined();
      expect(err?.errors.tenant_id).toBeDefined();
      expect(err?.errors.merchant_id).toBeDefined();
      expect(err?.errors.account_id).toBeDefined();
      expect(err?.errors.external_id).toBeDefined();
      expect(err?.errors.provider).toBeDefined();
    });

    it('accepts a minimal valid document and applies defaults (status=active, bound_at, revoked_at=null)', () => {
      const doc = new IdentityLinkModel({
        link_id: 'lnk-1',
        tenant_id: 't-1',
        merchant_id: 'm-1',
        account_id: 'acc-1',
        external_id: 'ext-1',
        provider: 'sso',
      });
      expect(doc.validateSync()).toBeUndefined();
      expect(doc.status).toBe('active');
      expect(doc.bound_at).toBeInstanceOf(Date);
      expect(doc.revoked_at).toBeNull();
    });

    it('rejects an out-of-enum provider', () => {
      const doc = new IdentityLinkModel({
        link_id: 'lnk-1',
        tenant_id: 't-1',
        merchant_id: 'm-1',
        account_id: 'acc-1',
        external_id: 'ext-1',
        provider: 'oauth',
      });
      expect(doc.validateSync()?.errors.provider).toBeDefined();
    });

    it('accepts each documented provider value', () => {
      for (const provider of ['sso', 'webhook', 'manual'] as const) {
        const doc = new IdentityLinkModel({
          link_id: `lnk-${provider}`,
          tenant_id: 't-1',
          merchant_id: 'm-1',
          account_id: `acc-${provider}`,
          external_id: `ext-${provider}`,
          provider,
        });
        expect(doc.validateSync()).toBeUndefined();
      }
    });

    it('rejects an out-of-enum status', () => {
      const doc = new IdentityLinkModel({
        link_id: 'lnk-1',
        tenant_id: 't-1',
        merchant_id: 'm-1',
        account_id: 'acc-1',
        external_id: 'ext-1',
        provider: 'sso',
        status: 'pending',
      });
      expect(doc.validateSync()?.errors.status).toBeDefined();
    });
  });

  describe('indexes', () => {
    it('declares the documented composite-unique indexes', () => {
      const indexes = IdentityLinkSchema.indexes();
      const names = indexes.map(([def, opts]) => ({
        key: Object.keys(def).join(','),
        unique: opts?.unique === true,
      }));

      expect(names).toEqual(
        expect.arrayContaining([
          { key: 'tenant_id,merchant_id,external_id', unique: true },
          { key: 'tenant_id,account_id,merchant_id', unique: true },
          { key: 'tenant_id,status', unique: false },
        ]),
      );
    });

    it('marks link_id as unique on the path itself', () => {
      const path = IdentityLinkSchema.path('link_id') as unknown as {
        options: { unique: boolean };
      };
      expect(path.options.unique).toBe(true);
    });
  });
});
