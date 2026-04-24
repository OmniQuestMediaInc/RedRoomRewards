/**
 * TierCapConfig Model
 *
 * Tenant-scoped, merchant-set redemption cap configuration per loyalty tier.
 * Versioned via effective_at / superseded_at — never delete or update rows;
 * insert a new row and stamp superseded_at on the prior active row.
 *
 * CEO Decision B5: No platform defaults. Each merchant configures
 *   max_discount_percent per tier in this table.
 *
 * B5 placeholder values for testing (DO NOT seed in this PR — model only):
 *   PLATINUM: redemption_cap_pct = 50
 *   GOLD:     redemption_cap_pct = 35
 *   SILVER:   redemption_cap_pct = 20
 *   MEMBER:   redemption_cap_pct = 10
 *   GUEST:    redemption_cap_pct = 5
 *
 * Collection: tier_cap_configs
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITierCapConfig extends Document {
  config_id: string;
  tenant_id: string;
  merchant_id: string;
  effective_at: Date;
  superseded_at: Date | null;
  correlation_id: string;
  reason_code: string;
  created_by: string;
  tier_name: 'PLATINUM' | 'GOLD' | 'SILVER' | 'MEMBER' | 'GUEST';
  redemption_cap_pct: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TierCapConfigSchema = new Schema<ITierCapConfig>(
  {
    config_id: {
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
    merchant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    effective_at: {
      type: Date,
      required: true,
      index: true,
    },
    superseded_at: {
      type: Date,
      required: false,
      default: null,
    },
    correlation_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    reason_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    tier_name: {
      type: String,
      required: true,
      enum: ['PLATINUM', 'GOLD', 'SILVER', 'MEMBER', 'GUEST'],
    },
    redemption_cap_pct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    collection: 'tier_cap_configs',
  },
);

// Compound index for active-config lookup (tenant + merchant, newest first)
TierCapConfigSchema.index({ tenant_id: 1, merchant_id: 1, effective_at: -1 });

// Index for tier-specific lookups
TierCapConfigSchema.index({ tenant_id: 1, merchant_id: 1, tier_name: 1 });

export const TierCapConfigModel = mongoose.model<ITierCapConfig>(
  'TierCapConfig',
  TierCapConfigSchema,
);
