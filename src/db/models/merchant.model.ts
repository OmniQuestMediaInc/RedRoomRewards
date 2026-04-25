/**
 * Merchant Model
 *
 * A merchant is a tenant-scoped issuer of points within the RRR loyalty
 * fabric. Each merchant carries a `merchant_tier` (CEO Decision B2 —
 * launch dimension) and a `phase` aligned with its parent tenant
 * (CEO Decision B3).
 *
 * `merchant_tier` enum follows CEO Decision B5 caps:
 *   PLATINUM 50 / GOLD 35 / SILVER 20 / MEMBER 10 / GUEST 5
 *
 * Collection: merchants
 */

import mongoose, { Document, Schema } from 'mongoose';
import { TenantPhase } from './tenant.model';

export type MerchantTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'MEMBER' | 'GUEST';
export const MERCHANT_TIERS: ReadonlyArray<MerchantTier> = [
  'PLATINUM',
  'GOLD',
  'SILVER',
  'MEMBER',
  'GUEST',
] as const;

export type MerchantStatus = 'active' | 'suspended' | 'archived';

export interface IMerchant extends Document {
  merchant_id: string;
  tenant_id: string;
  name: string;
  status: MerchantStatus;
  phase: TenantPhase;
  merchant_tier: MerchantTier;
  default_currency: string;
  webhook_url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MerchantSchema = new Schema<IMerchant>(
  {
    merchant_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    tenant_id: {
      type: String,
      required: true,
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
    merchant_tier: {
      type: String,
      required: true,
      enum: MERCHANT_TIERS,
      index: true,
    },
    default_currency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16,
      default: 'points',
    },
    webhook_url: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2048,
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
    collection: 'merchants',
  },
);

MerchantSchema.index({ tenant_id: 1, status: 1 });
MerchantSchema.index({ tenant_id: 1, merchant_tier: 1 });
MerchantSchema.index({ phase: 1, status: 1 });

export const MerchantModel = mongoose.model<IMerchant>('Merchant', MerchantSchema);
