/**
 * Tenant Model
 *
 * A tenant is the top-level isolation boundary for RedRoomRewards.
 * Every domain entity (Wallet, LedgerEntry, EarnRateConfig, etc.)
 * carries a `tenant_id` filter; CI guard B-009 enforces this on every
 * Model query in services / wallets / ledger.
 *
 * `phase` reflects the rollout cohort per CEO Decision B3:
 *   1 — RedRoomPleasures, Cyrano (launch cohort)
 *   2 — ChatNow.Zone (deferred per D5; webhook-receive only)
 *
 * Collection: tenants
 */

import mongoose, { Document, Schema } from 'mongoose';

export type TenantPhase = 1 | 2;
export type TenantStatus = 'active' | 'suspended' | 'archived';

export interface ITenant extends Document {
  tenant_id: string;
  name: string;
  status: TenantStatus;
  phase: TenantPhase;
  default_currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TenantSchema = new Schema<ITenant>(
  {
    tenant_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 256,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'suspended', 'archived'],
      default: 'active',
      index: true,
    },
    phase: {
      type: Number,
      required: true,
      enum: [1, 2],
      index: true,
    },
    default_currency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16,
      default: 'points',
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2048,
    },
  },
  {
    timestamps: true,
    collection: 'tenants',
  },
);

TenantSchema.index({ phase: 1, status: 1 });

export const TenantModel = mongoose.model<ITenant>('Tenant', TenantSchema);
