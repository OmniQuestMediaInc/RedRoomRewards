/**
 * Tenant model — unit tests (B-004)
 *
 * Verifies schema shape, enum validation, and required-field
 * enforcement at the mongoose validator layer (no live MongoDB
 * connection required — `validateSync()` runs the schema validators
 * synchronously against an unsaved document).
 */

import { TenantModel, TenantSchema } from '../tenant.model';

describe('TenantModel (B-004)', () => {
  describe('schema configuration', () => {
    it('binds to the tenants collection', () => {
      expect(
        (TenantSchema as unknown as { options: { collection: string } }).options.collection,
      ).toBe('tenants');
    });

    it('declares timestamps', () => {
      expect(
        (TenantSchema as unknown as { options: { timestamps: boolean } }).options.timestamps,
      ).toBe(true);
    });

    it('exposes status, phase, default_currency paths', () => {
      const paths = Object.keys(TenantSchema.paths);
      for (const p of ['tenant_id', 'name', 'status', 'phase', 'default_currency']) {
        expect(paths).toContain(p);
      }
    });
  });

  describe('validateSync', () => {
    it('rejects a document missing required fields', () => {
      const doc = new TenantModel({});
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.tenant_id).toBeDefined();
      expect(err?.errors.name).toBeDefined();
      expect(err?.errors.phase).toBeDefined();
    });

    it('accepts a minimal valid document and applies status/currency defaults', () => {
      const doc = new TenantModel({
        tenant_id: 'tenant-rrp-001',
        name: 'RedRoomPleasures',
        phase: 1,
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.status).toBe('active');
      expect(doc.default_currency).toBe('points');
    });

    it('rejects an out-of-enum status value', () => {
      const doc = new TenantModel({
        tenant_id: 't1',
        name: 'X',
        phase: 1,
        status: 'paused',
      });
      const err = doc.validateSync();
      expect(err?.errors.status).toBeDefined();
    });

    it('rejects an out-of-enum phase value', () => {
      const doc = new TenantModel({
        tenant_id: 't1',
        name: 'X',
        phase: 3,
      });
      const err = doc.validateSync();
      expect(err?.errors.phase).toBeDefined();
    });

    it('accepts phase 1 (RedRoomPleasures / Cyrano)', () => {
      const doc = new TenantModel({ tenant_id: 't1', name: 'RedRoomPleasures', phase: 1 });
      expect(doc.validateSync()).toBeUndefined();
    });

    it('accepts phase 2 (ChatNow.Zone)', () => {
      const doc = new TenantModel({ tenant_id: 't2', name: 'ChatNow.Zone', phase: 2 });
      expect(doc.validateSync()).toBeUndefined();
    });
  });

  describe('indexes', () => {
    it('declares the documented indexes', () => {
      const indexNames = TenantSchema.indexes().map(([def]) => Object.keys(def).join(','));
      expect(indexNames).toEqual(expect.arrayContaining(['phase,status']));
    });

    it('marks tenant_id as unique on the path itself', () => {
      const path = TenantSchema.path('tenant_id') as unknown as { options: { unique: boolean } };
      expect(path.options.unique).toBe(true);
    });
  });
});
